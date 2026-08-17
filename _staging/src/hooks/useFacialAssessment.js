import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { getFaceLandmarker } from '../lib/vision';
import { blendshapeMap, activationScore, pairAsymmetry, overallAsymmetry, SYMMETRY_PAIRS } from '../lib/faceMetrics';
import { speakText } from '../lib/voice';
import { useVisionTest } from './useVisionTest';

const NEUTRAL_MS = 1800; // brief baseline read before prompting the smile
const GOOD_COLOR = '#1f9d6f';
const NEUTRAL_LINE = 'rgba(238, 242, 249, 0.55)';

// A rough face-oval outline + mouth-corner / outer-eyebrow points from the
// canonical 478-point MediaPipe Face Mesh topology, used only to draw a
// light live-feedback guide. The actual symmetry measurement below is
// computed entirely from blendshape scores, not from these indices, so
// this is cosmetic rather than load-bearing.
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150,
  136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
];
const MOUTH_CORNERS = { left: 61, right: 291 };
const BROW_OUTER = { left: 70, right: 300 };

/**
 * Facial symmetry / early-sign screening assessment: reads the shared
 * FaceLandmarker's blendshape output (per-side facial-expression scores)
 * over a short "hold neutral, then smile naturally" window, and reports a
 * left/right symmetry comparison. This is a screening signal, not a
 * diagnosis — the summary language stays deliberately non-clinical.
 */
export function useFacialAssessment({ durationSec = 6, audioFeedback = true } = {}) {
  const startTimeRef = useRef(null);
  const neutralMapsRef = useRef([]);
  const bestFrameRef = useRef(null); // { score, map, timestamp } — peak activation frame during the smile phase
  const durationRef = useRef(durationSec);
  useEffect(() => {
    durationRef.current = durationSec;
  }, [durationSec]);

  const [phase, setPhase] = useState('idle'); // idle | neutral | smile
  const [visible, setVisible] = useState(false);
  const [remainingSec, setRemainingSec] = useState(durationSec);
  const [autoFinished, setAutoFinished] = useState(false);
  const [livePairs, setLivePairs] = useState([]);
  const deadlineRef = useRef(null);
  const announcedSmileRef = useRef(false);

  const onFrame = useCallback(
    (entities, result, timestamp) => {
      const landmarks = entities[0];
      const categories = result.faceBlendshapes?.[0]?.categories;
      if (!landmarks || !categories) {
        setVisible(false);
        return;
      }
      setVisible(true);

      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const map = blendshapeMap(categories);

      if (elapsed < NEUTRAL_MS) {
        setPhase('neutral');
        neutralMapsRef.current.push(map);
      } else {
        setPhase('smile');
        if (audioFeedback && !announcedSmileRef.current) {
          announcedSmileRef.current = true;
          speakText('Now smile naturally, and hold it');
        }
        const score = activationScore(map);
        if (!bestFrameRef.current || score > bestFrameRef.current.score) {
          bestFrameRef.current = { score, map, timestamp };
        }
        setLivePairs(SYMMETRY_PAIRS.map((p) => ({ key: p.key, label: p.label, ...pairAsymmetry(map, p) })));
      }

      if (deadlineRef.current !== null) {
        const remaining = Math.max(0, Math.ceil((deadlineRef.current - timestamp) / 1000));
        setRemainingSec(remaining);
        if (timestamp >= deadlineRef.current) setAutoFinished(true);
      }
    },
    [audioFeedback],
  );

  const drawExtra = useCallback((ctx, canvas, entities) => {
    const landmarks = entities[0];
    if (!landmarks) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.strokeStyle = NEUTRAL_LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    FACE_OVAL_INDICES.forEach((idx, i) => {
      const p = landmarks[idx];
      if (!p) return;
      const x = p.x * w;
      const y = p.y * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const dot = (idx, color) => {
      const p = landmarks[idx];
      if (!p) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    };
    dot(MOUTH_CORNERS.left, GOOD_COLOR);
    dot(MOUTH_CORNERS.right, GOOD_COLOR);
    dot(BROW_OUTER.left, '#dba8ff');
    dot(BROW_OUTER.right, '#dba8ff');
  }, []);

  const vision = useVisionTest({
    getLandmarker: getFaceLandmarker,
    connections: FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
    getEntities: (result) => result.faceLandmarks ?? [],
    drawSkeleton: false,
    onFrame,
    drawExtra,
  });

  const start = useCallback(
    async (deviceId) => {
      startTimeRef.current = null;
      neutralMapsRef.current = [];
      bestFrameRef.current = null;
      announcedSmileRef.current = false;
      setPhase('idle');
      setLivePairs([]);
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

    const neutralAvg = {};
    for (const map of neutralMapsRef.current) {
      for (const key of Object.keys(map)) neutralAvg[key] = (neutralAvg[key] ?? 0) + map[key] / (neutralMapsRef.current.length || 1);
    }

    const peak = bestFrameRef.current;
    const confident = Boolean(peak && peak.score > 0.12);
    const bestMap = peak?.map ?? {};

    const pairs = SYMMETRY_PAIRS.map((p) => ({
      key: p.key,
      label: p.label,
      ...pairAsymmetry(bestMap, p),
    }));

    const smilePair = pairs.find((p) => p.key === 'smile');
    const browPair = pairs.find((p) => p.key === 'brow');

    return {
      id: `face-${Date.now()}`,
      type: 'facial-symmetry',
      label: 'Facial Symmetry',
      endedAt: Date.now(),
      durationMs: durationRef.current * 1000,
      pairs,
      totals: {
        confident,
        overallAsymmetryPct: confident ? overallAsymmetry(bestMap) : null,
        smileAsymmetryPct: confident ? smilePair?.asymmetryPct ?? null : null,
        browAsymmetryPct: confident ? browPair?.asymmetryPct ?? null : null,
        neutralAsymmetryPct: neutralMapsRef.current.length ? overallAsymmetry(neutralAvg) : null,
      },
    };
  }, [vision]);

  return useMemo(
    () => ({ ...vision, phase, visible, remainingSec, autoFinished, livePairs, start, finish }),
    [vision, phase, visible, remainingSec, autoFinished, livePairs, start, finish],
  );
}
