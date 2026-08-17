import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { getHandLandmarker } from '../lib/vision';
import { distance2D } from '../lib/geometry';
import { HAND_LANDMARK } from '../lib/landmarks';
import { RepTracker } from '../lib/repEngine';
import { speakText } from '../lib/voice';
import { useVisionTest } from './useVisionTest';

// Pinch "closeness" is (referenceSpan - pinchGap), scaled up, using the
// wrist-to-middle-knuckle bone length as a per-frame scale reference so the
// signal stays roughly consistent regardless of hand-to-camera distance.
// These thresholds are heuristic starting points, not clinically validated.
const TAP_CONFIG = {
  enterHigh: 1.3,
  exitLow: 0.9,
  targetPrimary: 1.6,
  targetTolerance: 0.4,
  minRepPrimary: 1.0,
  minVisibility: 0,
};

const GOOD_COLOR = '#5fa082';
const HAND_COLOR = { left: '#d9a441', right: '#c1704e' };

function handednessLabel(category) {
  // MediaPipe reports handedness from the subject's own perspective. We
  // mirror the video for a natural selfie-view, so this label already lines
  // up with what the viewer sees on their left/right of the frame.
  return category?.categoryName === 'Left' ? 'left' : 'right';
}

/**
 * Finger-tapping speed assessment: counts thumb-to-index pinch cycles per
 * hand over a fixed countdown window, using MediaPipe's Hand Landmarker
 * (21 points/hand) instead of Pose Landmarker.
 */
export function useHandAssessment({ durationSec = 10, audioFeedback = true } = {}) {
  const trackersRef = useRef({ left: new RepTracker('left-hand', TAP_CONFIG), right: new RepTracker('right-hand', TAP_CONFIG) });
  const [reps, setReps] = useState({ left: [], right: [] });
  const [handsVisible, setHandsVisible] = useState({ left: false, right: false });
  const [remainingSec, setRemainingSec] = useState(durationSec);
  const [autoFinished, setAutoFinished] = useState(false);
  const deadlineRef = useRef(null);
  const durationRef = useRef(durationSec);
  useEffect(() => {
    durationRef.current = durationSec;
  }, [durationSec]);

  const onFrame = useCallback(
    (entities, result, timestamp) => {
      const handedness = result.handedness ?? [];
      const seen = { left: false, right: false };

      entities.forEach((landmarks, i) => {
        const label = handednessLabel(handedness[i]?.[0]);
        seen[label] = true;

        const wrist = landmarks[HAND_LANDMARK.WRIST];
        const middleMcp = landmarks[HAND_LANDMARK.MIDDLE_MCP];
        const thumbTip = landmarks[HAND_LANDMARK.THUMB_TIP];
        const indexTip = landmarks[HAND_LANDMARK.INDEX_TIP];
        const refSpan = distance2D(wrist, middleMcp);
        const pinchGap = distance2D(thumbTip, indexTip);
        if (!refSpan || pinchGap === null) return;

        const normalizedGap = pinchGap / refSpan;
        const closeness = Math.max(0, 2.2 - normalizedGap);

        const tracker = trackersRef.current[label];
        const outcome = tracker.update(closeness, null, 1, timestamp);
        if (outcome?.event === 'rep-completed') {
          setReps((prev) => ({ ...prev, [label]: [...tracker.reps] }));
        }
      });

      setHandsVisible(seen);
      trackersRef.current.left.visible = seen.left;
      trackersRef.current.right.visible = seen.right;

      if (deadlineRef.current !== null) {
        const remaining = Math.max(0, Math.ceil((deadlineRef.current - timestamp) / 1000));
        setRemainingSec(remaining);
        if (timestamp >= deadlineRef.current) setAutoFinished(true);
      }
    },
    [],
  );

  const drawExtra = useCallback((ctx, canvas, entities, result) => {
    const handedness = result.handedness ?? [];
    entities.forEach((landmarks, i) => {
      const label = handednessLabel(handedness[i]?.[0]);
      const tracker = trackersRef.current[label];
      const thumbTip = landmarks[HAND_LANDMARK.THUMB_TIP];
      const indexTip = landmarks[HAND_LANDMARK.INDEX_TIP];
      if (!thumbTip || !indexTip) return;
      const color = tracker.livePrimary >= TAP_CONFIG.targetPrimary - TAP_CONFIG.targetTolerance ? GOOD_COLOR : HAND_COLOR[label];
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(thumbTip.x * canvas.width, thumbTip.y * canvas.height);
      ctx.lineTo(indexTip.x * canvas.width, indexTip.y * canvas.height);
      ctx.stroke();
    });
  }, []);

  const vision = useVisionTest({
    getLandmarker: getHandLandmarker,
    connections: HandLandmarker.HAND_CONNECTIONS,
    onFrame,
    drawExtra,
  });

  // Speak the tap-count feedback outside the frame loop's hot path — audio
  // feedback per-tap would overlap too fast to be useful, so instead just
  // announce when time's about to run out.
  useEffect(() => {
    if (!audioFeedback || !vision.running) return;
    if (remainingSec === 3) speakText('Three seconds');
  }, [remainingSec, audioFeedback, vision.running]);

  const start = useCallback(
    async (deviceId) => {
      trackersRef.current.left.reset();
      trackersRef.current.right.reset();
      setReps({ left: [], right: [] });
      setHandsVisible({ left: false, right: false });
      setAutoFinished(false);
      setRemainingSec(durationRef.current);
      await vision.start(deviceId);
      deadlineRef.current = performance.now() + durationRef.current * 1000;
    },
    [vision],
  );

  const finish = useCallback(() => {
    vision.stop();
    deadlineRef.current = null;
    const leftReps = trackersRef.current.left.reps;
    const rightReps = trackersRef.current.right.reps;

    const summarizeHand = (handReps) => ({
      taps: handReps.length,
      ratePerSec: durationRef.current ? Math.round((handReps.length / durationRef.current) * 10) / 10 : 0,
      avgAmplitude: handReps.length
        ? Math.round((handReps.reduce((a, r) => a + r.peakPrimary, 0) / handReps.length) * 100) / 100
        : 0,
    });

    const left = summarizeHand(leftReps);
    const right = summarizeHand(rightReps);

    return {
      id: `hand-${Date.now()}`,
      type: 'hand-assessment',
      label: 'Hand Assessment',
      endedAt: Date.now(),
      durationMs: durationRef.current * 1000,
      reps: [...leftReps, ...rightReps].sort((a, b) => a.timestamp - b.timestamp),
      left,
      right,
      totals: {
        totalTaps: left.taps + right.taps,
        asymmetryTaps: Math.abs(left.taps - right.taps),
      },
    };
  }, [vision]);

  return useMemo(
    () => ({ ...vision, reps, handsVisible, remainingSec, autoFinished, start, finish }),
    [vision, reps, handsVisible, remainingSec, autoFinished, start, finish],
  );
}
