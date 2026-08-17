import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { getPoseLandmarker } from '../lib/vision';
import { angleAt, averageVisibility, SignalSmoother, stdDev } from '../lib/geometry';
import { LEG_CHAINS } from '../lib/landmarks';
import { RepTracker } from '../lib/repEngine';
import { speakText } from '../lib/voice';
import { useVisionTest } from './useVisionTest';

const KNEE_CONFIG = {
  enterHigh: 150, // knee angle above this = standing
  exitLow: 120, // knee angle below this = seated
  targetPrimary: 165, // near-full standing extension
  targetTolerance: 15,
  minRepPrimary: 130,
  minVisibility: 0.45,
};

const GOOD_COLOR = '#5fa082';
const WARN_COLOR = '#d9a441';

/**
 * 5-times-sit-to-stand style assessment: reuses the exact same
 * landmark -> angle -> RepTracker pipeline as Phase 1, pointed at the knee
 * (hip -> knee -> ankle) instead of the shoulder. Also derives a rough
 * postural-sway score from hip horizontal drift while standing.
 */
export function useSitToStandTest({ targetReps = 5, audioFeedback = true } = {}) {
  const trackerRef = useRef(new RepTracker('stand-to-sit', KNEE_CONFIG));
  const smootherRef = useRef(new SignalSmoother());
  const swaySamplesRef = useRef([]);
  const targetRepsRef = useRef(targetReps);
  useEffect(() => {
    targetRepsRef.current = targetReps;
  }, [targetReps]);

  const [reps, setReps] = useState([]);
  const [liveAngle, setLiveAngle] = useState(null);
  const [visible, setVisible] = useState(false);
  const [autoFinished, setAutoFinished] = useState(false);

  const onFrame = useCallback(
    (entities, _result, timestamp) => {
      const landmarks = entities[0];
      if (!landmarks) {
        setVisible(false);
        return;
      }

      const legAngles = [];
      let visSum = 0;
      let visCount = 0;
      let hipXSum = 0;
      let hipXCount = 0;

      for (const side of ['left', 'right']) {
        const chain = LEG_CHAINS[side];
        const hip = landmarks[chain.hip];
        const knee = landmarks[chain.knee];
        const ankle = landmarks[chain.ankle];
        const vis = averageVisibility([hip, knee, ankle]);
        if (vis >= KNEE_CONFIG.minVisibility) {
          const a = angleAt(hip, knee, ankle);
          if (a !== null) legAngles.push(a);
        }
        if (hip) {
          hipXSum += hip.x;
          hipXCount += 1;
        }
        visSum += vis;
        visCount += 1;
      }

      const visibility = visCount ? visSum / visCount : 0;
      setVisible(visibility >= KNEE_CONFIG.minVisibility);

      if (legAngles.length === 0) return;
      const rawKnee = legAngles.reduce((a, b) => a + b, 0) / legAngles.length;
      const smoothed = smootherRef.current.push(rawKnee);
      setLiveAngle(smoothed);

      const tracker = trackerRef.current;
      if (tracker.state === 'high' && hipXCount) {
        swaySamplesRef.current.push(hipXSum / hipXCount);
      }

      const outcome = tracker.update(smoothed, null, visibility, timestamp);
      if (outcome?.event === 'rep-completed') {
        setReps([...tracker.reps]);
        if (audioFeedback) {
          speakText(outcome.rep.correct ? 'Good — full stand' : 'Try to stand up fully');
        }
        if (tracker.reps.length >= targetRepsRef.current) {
          setAutoFinished(true);
        }
      }
    },
    [audioFeedback],
  );

  const drawExtra = useCallback((ctx, canvas, entities) => {
    const landmarks = entities[0];
    if (!landmarks) return;
    const tracker = trackerRef.current;
    for (const side of ['left', 'right']) {
      const chain = LEG_CHAINS[side];
      const pts = [chain.hip, chain.knee, chain.ankle].map((i) => landmarks[i]);
      if (pts.some((p) => !p)) continue;
      const color = !tracker.visible
        ? 'rgba(241, 236, 221, 0.45)'
        : tracker.livePrimary >= KNEE_CONFIG.targetPrimary - KNEE_CONFIG.targetTolerance
          ? GOOD_COLOR
          : WARN_COLOR;
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x * canvas.width, pts[0].y * canvas.height);
      ctx.lineTo(pts[1].x * canvas.width, pts[1].y * canvas.height);
      ctx.lineTo(pts[2].x * canvas.width, pts[2].y * canvas.height);
      ctx.stroke();
    }
  }, []);

  const vision = useVisionTest({
    getLandmarker: getPoseLandmarker,
    connections: PoseLandmarker.POSE_CONNECTIONS,
    onFrame,
    drawExtra,
  });

  const start = useCallback(
    async (deviceId) => {
      trackerRef.current.reset();
      smootherRef.current.reset();
      swaySamplesRef.current = [];
      setReps([]);
      setLiveAngle(null);
      setAutoFinished(false);
      await vision.start(deviceId);
    },
    [vision],
  );

  const finish = useCallback(() => {
    vision.stop();
    const finalReps = trackerRef.current.reps;
    const correct = finalReps.filter((r) => r.correct).length;
    const durations = finalReps.map((r) => r.durationMs).filter((d) => typeof d === 'number');
    const peaks = finalReps.map((r) => r.peakPrimary);
    const swaySd = stdDev(swaySamplesRef.current); // normalized 0-1 image-plane units
    // Convert to a 0-100 "stability score" — lower drift is better. The
    // scale factor is an approximation (not a validated clinical measure).
    const stabilityScore = Math.max(0, Math.round(100 - swaySd * 800));

    const totalTimeMs = durations.reduce((a, b) => a + b, 0);
    return {
      id: `sts-${Date.now()}`,
      type: 'sit-to-stand',
      label: 'Sit-to-Stand',
      endedAt: Date.now(),
      durationMs: vision.elapsedMs,
      targetReps: targetRepsRef.current,
      reps: finalReps,
      totals: {
        total: finalReps.length,
        correct,
        incorrect: finalReps.length - correct,
        avgRepMs: durations.length ? Math.round(totalTimeMs / durations.length) : 0,
        bestRepMs: durations.length ? Math.round(Math.min(...durations)) : 0,
        avgExtension: peaks.length ? Math.round(peaks.reduce((a, b) => a + b, 0) / peaks.length) : 0,
        stabilityScore,
        formScore: finalReps.length ? Math.round((correct / finalReps.length) * 100) : 0,
      },
    };
  }, [vision]);

  return useMemo(
    () => ({
      ...vision,
      reps,
      liveAngle,
      visible,
      autoFinished,
      start,
      finish,
    }),
    [vision, reps, liveAngle, visible, autoFinished, start, finish],
  );
}
