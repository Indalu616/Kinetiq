import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { getPoseLandmarker } from '../lib/vision';
import { angleAt, averageVisibility, SignalSmoother } from '../lib/geometry';
import { SIDE_CHAINS } from '../lib/landmarks';
import { RepTracker } from '../lib/repEngine';
import { speakText } from '../lib/voice';
import { useVisionTest } from './useVisionTest';

const ARM_CONFIG = {
  enterHigh: 40,
  exitLow: 25,
  targetPrimary: 90,
  targetTolerance: 12,
  minRepPrimary: 30,
  minVisibility: 0.5,
};

const GOOD_COLOR = '#5fa082';
const PHASE_COLOR = { left: '#d9a441', right: '#c1704e' };

/**
 * Standardized arm-movement assessment: run the same shoulder-abduction
 * pipeline as Phase 1, but sequentially — left arm for N reps, then right
 * arm for N reps — so the two sides can be directly compared (range of
 * motion, speed, asymmetry) rather than just tracked simultaneously.
 */
export function useArmAssessment({ targetReps = 5, audioFeedback = true } = {}) {
  const trackersRef = useRef({ left: new RepTracker('left', ARM_CONFIG), right: new RepTracker('right', ARM_CONFIG) });
  const smoothersRef = useRef({ left: new SignalSmoother(), right: new SignalSmoother() });
  const targetRepsRef = useRef(targetReps);
  useEffect(() => {
    targetRepsRef.current = targetReps;
  }, [targetReps]);

  const [phase, setPhase] = useState('left'); // left | right | done
  const phaseRef = useRef('left');
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const [reps, setReps] = useState({ left: [], right: [] });
  const [liveAngle, setLiveAngle] = useState(null);
  const [visible, setVisible] = useState(false);

  const onFrame = useCallback(
    (entities, _result, timestamp) => {
      const landmarks = entities[0];
      const currentPhase = phaseRef.current;
      if (!landmarks || currentPhase === 'done') {
        setVisible(false);
        return;
      }

      const chain = SIDE_CHAINS[currentPhase];
      const hip = landmarks[chain.hip];
      const shoulder = landmarks[chain.shoulder];
      const elbow = landmarks[chain.elbow];
      const vis = averageVisibility([hip, shoulder, elbow]);
      setVisible(vis >= ARM_CONFIG.minVisibility);

      const raw = angleAt(hip, shoulder, elbow);
      const smoothed = smoothersRef.current[currentPhase].push(raw);
      setLiveAngle(smoothed);

      const tracker = trackersRef.current[currentPhase];
      const outcome = tracker.update(smoothed, null, vis, timestamp);
      if (outcome?.event === 'rep-completed') {
        setReps((prev) => ({ ...prev, [currentPhase]: [...tracker.reps] }));
        if (audioFeedback) {
          speakText(outcome.rep.correct ? 'Good rep' : 'Raise your arm higher');
        }
        if (tracker.reps.length >= targetRepsRef.current) {
          if (currentPhase === 'left') {
            smoothersRef.current.right.reset();
            setPhase('right');
            if (audioFeedback) speakText('Now the right arm');
          } else {
            setPhase('done');
          }
        }
      }
    },
    [audioFeedback],
  );

  const drawExtra = useCallback((ctx, canvas, entities) => {
    const landmarks = entities[0];
    const currentPhase = phaseRef.current;
    if (!landmarks || currentPhase === 'done') return;
    const chain = SIDE_CHAINS[currentPhase];
    const pts = [chain.hip, chain.shoulder, chain.elbow, chain.wrist].map((i) => landmarks[i]);
    if (pts.some((p) => !p)) return;
    const tracker = trackersRef.current[currentPhase];
    const color = !tracker.visible
      ? 'rgba(241, 236, 221, 0.45)'
      : tracker.livePrimary >= ARM_CONFIG.targetPrimary - ARM_CONFIG.targetTolerance
        ? GOOD_COLOR
        : PHASE_COLOR[currentPhase];
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[1].x * canvas.width, pts[1].y * canvas.height);
    ctx.lineTo(pts[2].x * canvas.width, pts[2].y * canvas.height);
    ctx.lineTo(pts[3].x * canvas.width, pts[3].y * canvas.height);
    ctx.stroke();
  }, []);

  const vision = useVisionTest({
    getLandmarker: getPoseLandmarker,
    connections: PoseLandmarker.POSE_CONNECTIONS,
    onFrame,
    drawExtra,
  });

  const start = useCallback(
    async (deviceId) => {
      trackersRef.current.left.reset();
      trackersRef.current.right.reset();
      smoothersRef.current.left.reset();
      smoothersRef.current.right.reset();
      setPhase('left');
      setReps({ left: [], right: [] });
      setLiveAngle(null);
      await vision.start(deviceId);
    },
    [vision],
  );

  const finish = useCallback(() => {
    vision.stop();
    const leftReps = trackersRef.current.left.reps;
    const rightReps = trackersRef.current.right.reps;

    const summarizeSide = (sideReps) => {
      const peaks = sideReps.map((r) => r.peakPrimary);
      const durations = sideReps.map((r) => r.durationMs).filter((d) => typeof d === 'number');
      const correct = sideReps.filter((r) => r.correct).length;
      return {
        total: sideReps.length,
        correct,
        bestROM: peaks.length ? Math.round(Math.max(...peaks)) : 0,
        avgROM: peaks.length ? Math.round(peaks.reduce((a, b) => a + b, 0) / peaks.length) : 0,
        avgRepMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
        formScore: sideReps.length ? Math.round((correct / sideReps.length) * 100) : 0,
      };
    };

    const left = summarizeSide(leftReps);
    const right = summarizeSide(rightReps);
    const romDiff = left.bestROM - right.bestROM;
    const speedDiff = left.avgRepMs && right.avgRepMs ? left.avgRepMs - right.avgRepMs : 0;
    const maxROM = Math.max(left.bestROM, right.bestROM);
    const asymmetryPct = maxROM ? Math.round((Math.abs(romDiff) / maxROM) * 100) : 0;

    return {
      id: `arm-${Date.now()}`,
      type: 'arm-movement',
      label: 'Arm Movement',
      endedAt: Date.now(),
      durationMs: vision.elapsedMs,
      targetReps: targetRepsRef.current,
      reps: [...leftReps, ...rightReps].sort((a, b) => a.timestamp - b.timestamp),
      left,
      right,
      totals: {
        romDiffDeg: romDiff,
        speedDiffMs: speedDiff,
        asymmetryPct,
        formScore: Math.round((left.formScore + right.formScore) / 2),
      },
    };
  }, [vision]);

  return useMemo(
    () => ({ ...vision, phase, reps, liveAngle, visible, start, finish }),
    [vision, phase, reps, liveAngle, visible, start, finish],
  );
}
