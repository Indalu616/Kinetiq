import { useCallback, useEffect, useRef, useState } from 'react';
import { DrawingUtils, PoseLandmarker } from '@mediapipe/tasks-vision';
import { getPoseLandmarker } from '../lib/vision';
import { angleAt, averageVisibility, SignalSmoother } from '../lib/geometry';
import { SIDE_CHAINS } from '../lib/landmarks';
import { ArmRepTracker, DEFAULT_CONFIG } from '../lib/exerciseEngine';
import { isSupported as speechIsSupported, speakText, warmUpVoices } from '../lib/voice';
import { useCamera } from './useCamera';

const SIDE_COLOR = {
  left: '#d9a441', // warm gold
  right: '#c1704e', // clay / terracotta
};
const SKELETON_COLOR = 'rgba(241, 236, 221, 0.45)';
const GOOD_COLOR = '#5fa082'; // stage accent green — reached target

function makeEmptySide() {
  return { angle: null, elbowAngle: null, visible: false, reps: [] };
}

/**
 * Top-level orchestration hook: owns the camera, the shared PoseLandmarker,
 * the per-frame detection + drawing loop, and the two ArmRepTracker state
 * machines (left/right). Exposes plain state + controls for the UI layer.
 */
export function useExerciseSession() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useCamera(videoRef);

  const [modelStatus, setModelStatus] = useState('loading'); // loading | ready | error
  const [modelError, setModelError] = useState(null);
  const [running, setRunning] = useState(false);
  const [poseDetected, setPoseDetected] = useState(false);
  const [side, setSideState] = useState('both'); // left | right | both
  const [targetAngle, setTargetAngleState] = useState(DEFAULT_CONFIG.targetAngle);
  const [liveSides, setLiveSides] = useState({ left: makeEmptySide(), right: makeEmptySide() });
  const [lastEvent, setLastEvent] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const speechSupported = speechIsSupported();

  const landmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const rafRef = useRef(null);
  const smoothersRef = useRef({ left: new SignalSmoother(), right: new SignalSmoother() });
  const elbowSmoothersRef = useRef({ left: new SignalSmoother(), right: new SignalSmoother() });
  const trackersRef = useRef({ left: new ArmRepTracker('left'), right: new ArmRepTracker('right') });
  const lastVideoTimeRef = useRef(-1);
  const startTimeRef = useRef(null);

  // Prime the speech-synthesis voice list as early as possible so the very
  // first rep's feedback isn't the call that's warming it up (some browsers
  // return an empty voice list, and therefore no audio, on a cold first call).
  useEffect(() => {
    warmUpVoices();
  }, []);

  // Load the shared PoseLandmarker once on mount.
  useEffect(() => {
    let cancelled = false;
    getPoseLandmarker()
      .then((lm) => {
        if (cancelled) return;
        landmarkerRef.current = lm;
        setModelStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load pose model', err);
        setModelError(err?.message ?? 'Failed to load the pose detection model.');
        setModelStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep both trackers' target angle in sync with the UI control.
  useEffect(() => {
    trackersRef.current.left.updateConfig({ targetAngle });
    trackersRef.current.right.updateConfig({ targetAngle });
  }, [targetAngle]);

  const speak = useCallback(
    (text) => {
      if (!audioFeedback) return;
      speakText(text);
    },
    [audioFeedback],
  );

  // Lets the UI offer a "Test" action so the user can confirm voice feedback
  // is actually audible (browser/OS TTS, volume, etc.) without needing to
  // complete a real rep first. Always speaks, regardless of the toggle, so
  // it doubles as a way to preview the feature before turning it on.
  const testVoice = useCallback(() => {
    speakText("Voice feedback is working. Good rep!");
  }, []);

  const drawFrame = useCallback(
    (result) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext('2d');
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!drawingUtilsRef.current) {
        drawingUtilsRef.current = new DrawingUtils(ctx);
      }
      const drawingUtils = drawingUtilsRef.current;

      const landmarks = result.landmarks?.[0];
      if (landmarks) {
        drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
          color: SKELETON_COLOR,
          lineWidth: 3,
        });
        drawingUtils.drawLandmarks(landmarks, {
          color: SKELETON_COLOR,
          fillColor: '#e2e8f0',
          radius: 3,
        });

        // Highlight the tracked arm chain(s) with a color reflecting live form.
        const sidesToHighlight = side === 'both' ? ['left', 'right'] : [side];
        for (const s of sidesToHighlight) {
          const chain = SIDE_CHAINS[s];
          const pts = [chain.hip, chain.shoulder, chain.elbow, chain.wrist].map((i) => landmarks[i]);
          if (pts.some((p) => !p)) continue;
          const tracker = trackersRef.current[s];
          const color = !tracker.visible
            ? SKELETON_COLOR
            : tracker.liveAngle >= targetAngle - DEFAULT_CONFIG.targetTolerance
              ? GOOD_COLOR
              : SIDE_COLOR[s];
          ctx.strokeStyle = color;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pts[1].x * canvas.width, pts[1].y * canvas.height); // shoulder
          ctx.lineTo(pts[2].x * canvas.width, pts[2].y * canvas.height); // elbow
          ctx.lineTo(pts[3].x * canvas.width, pts[3].y * canvas.height); // wrist
          ctx.stroke();

          // Angle label near the shoulder joint.
          const sx = pts[1].x * canvas.width;
          const sy = pts[1].y * canvas.height;
          const label = `${Math.round(tracker.liveAngle)}°`;
          ctx.font = 'bold 20px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(23, 20, 15, 0.78)';
          const textWidth = ctx.measureText(label).width;
          ctx.fillRect(sx + 8, sy - 26, textWidth + 12, 26);
          ctx.fillStyle = color;
          ctx.fillText(label, sx + 14, sy - 7);
        }
      }
      ctx.restore();
    },
    [side, targetAngle],
  );

  const processResult = useCallback(
    (result, timestamp) => {
      const landmarks = result.landmarks?.[0];
      setPoseDetected(Boolean(landmarks));
      if (!landmarks) {
        drawFrame(result);
        return;
      }

      const nextLive = { left: makeEmptySide(), right: makeEmptySide() };

      for (const s of ['left', 'right']) {
        const chain = SIDE_CHAINS[s];
        const hip = landmarks[chain.hip];
        const shoulder = landmarks[chain.shoulder];
        const elbow = landmarks[chain.elbow];
        const wrist = landmarks[chain.wrist];

        const visibility = averageVisibility([hip, shoulder, elbow]);
        const rawAbduction = angleAt(hip, shoulder, elbow);
        const rawElbow = angleAt(shoulder, elbow, wrist);

        const smoothedAbduction = smoothersRef.current[s].push(rawAbduction);
        const smoothedElbow = elbowSmoothersRef.current[s].push(rawElbow);

        const tracker = trackersRef.current[s];
        const outcome = tracker.update(smoothedAbduction, smoothedElbow, visibility, timestamp);

        nextLive[s] = {
          angle: smoothedAbduction,
          elbowAngle: smoothedElbow,
          visible: visibility >= DEFAULT_CONFIG.minVisibility,
          reps: tracker.reps,
        };

        if (outcome?.event === 'rep-completed') {
          setLastEvent({ side: s, rep: outcome.rep, key: outcome.rep.id });
          speak(outcome.rep.correct ? 'Good rep' : outcome.rep.note);
        }
      }

      setLiveSides(nextLive);
      drawFrame(result);
    },
    [drawFrame, speak],
  );

  // Detection loop, synced to the running flag. Uses a plain hoisted function
  // (rather than a self-referencing useCallback) so the recursive
  // requestAnimationFrame call is unambiguous to static analysis.
  useEffect(() => {
    if (!running) return undefined;
    let cancelled = false;

    function loop() {
      if (cancelled) return;
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (video && landmarker && video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const timestamp = performance.now();
        const result = landmarker.detectForVideo(video, timestamp);
        processResult(result, timestamp);
        if (startTimeRef.current !== null) {
          setElapsedMs(timestamp - startTimeRef.current);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, processResult]);

  const startSession = useCallback(
    async (preferredDeviceId) => {
      await camera.start(preferredDeviceId);
      if (modelStatus !== 'ready') return;
      trackersRef.current.left.reset();
      trackersRef.current.right.reset();
      smoothersRef.current.left.reset();
      smoothersRef.current.right.reset();
      elbowSmoothersRef.current.left.reset();
      elbowSmoothersRef.current.right.reset();
      setLiveSides({ left: makeEmptySide(), right: makeEmptySide() });
      setLastEvent(null);
      setElapsedMs(0);
      startTimeRef.current = performance.now();
      setRunning(true);
    },
    [camera, modelStatus],
  );

  const stopSession = useCallback(() => {
    setRunning(false);
    camera.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const allReps = [...trackersRef.current.left.reps, ...trackersRef.current.right.reps].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const correct = allReps.filter((r) => r.correct).length;
    const roms = allReps.map((r) => r.romMax);
    const summary = {
      id: `s-${Date.now()}`,
      startedAt: startTimeRef.current ? Date.now() - elapsedMs : Date.now(),
      endedAt: Date.now(),
      durationMs: elapsedMs,
      side,
      targetAngle,
      reps: allReps,
      totals: {
        total: allReps.length,
        correct,
        incorrect: allReps.length - correct,
        avgROM: roms.length ? Math.round(roms.reduce((a, b) => a + b, 0) / roms.length) : 0,
        bestROM: roms.length ? Math.round(Math.max(...roms)) : 0,
        formScore: allReps.length ? Math.round((correct / allReps.length) * 100) : 0,
      },
    };
    return summary;
  }, [camera, elapsedMs, side, targetAngle]);

  const resetSession = useCallback(() => {
    trackersRef.current.left.reset();
    trackersRef.current.right.reset();
    setLiveSides({ left: makeEmptySide(), right: makeEmptySide() });
    setLastEvent(null);
    startTimeRef.current = performance.now();
    setElapsedMs(0);
  }, []);

  // `camera.stop` is memoized (stable identity) inside useCamera, unlike the
  // `camera` object itself which is a fresh literal every render — depending
  // on the whole object here would tear the camera down on every re-render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => camera.stop(), [camera.stop]);

  const setSide = useCallback((s) => setSideState(s), []);
  const setTargetAngle = useCallback((a) => setTargetAngleState(a), []);

  return {
    videoRef,
    canvasRef,
    camera,
    modelStatus,
    modelError,
    running,
    poseDetected,
    side,
    setSide,
    targetAngle,
    setTargetAngle,
    liveSides,
    lastEvent,
    elapsedMs,
    audioFeedback,
    setAudioFeedback,
    speechSupported,
    testVoice,
    startSession,
    stopSession,
    resetSession,
  };
}
