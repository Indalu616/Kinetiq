/**
 * Facial-symmetry helpers built on MediaPipe Face Landmarker's blendshape
 * output (52 ARKit-style facial-expression scores, 0-1). Blendshapes are a
 * more robust symmetry signal than hand-deriving distances from the raw
 * 478-point mesh: they're already normalized per-expression and per-side,
 * so a left/right score difference is directly meaningful.
 *
 * Only a curated set of bilateral pairs is used — the ones that map to
 * visible, clinically-referenced facial movement (smile, mouth corner,
 * eyebrow raise) — rather than all 26 bilateral pairs, so the result stays
 * legible instead of a wall of numbers.
 */

// [label, leftCategory, rightCategory, weight]
export const SYMMETRY_PAIRS = [
  { key: 'smile', label: 'Smile', left: 'mouthSmileLeft', right: 'mouthSmileRight', weight: 0.4 },
  { key: 'mouthPull', label: 'Mouth-corner pull', left: 'mouthStretchLeft', right: 'mouthStretchRight', weight: 0.2 },
  { key: 'cheek', label: 'Cheek raise', left: 'cheekSquintLeft', right: 'cheekSquintRight', weight: 0.15 },
  { key: 'brow', label: 'Eyebrow raise', left: 'browOuterUpLeft', right: 'browOuterUpRight', weight: 0.25 },
];

/** Converts the raw FaceLandmarker blendshapes[0].categories array into a { name: score } lookup. */
export function blendshapeMap(categories) {
  const map = {};
  for (const c of categories ?? []) {
    map[c.categoryName] = c.score;
  }
  return map;
}

/** Combined 0-1 "how much facial movement is happening right now" signal, used to find the peak-expression frame. */
export function activationScore(map) {
  return SYMMETRY_PAIRS.reduce((sum, p) => sum + Math.max(map[p.left] ?? 0, map[p.right] ?? 0) * p.weight, 0);
}

/**
 * Per-pair left/right scores at a single frame, plus a 0-100 asymmetry
 * percentage (0 = perfectly symmetric, 100 = fully one-sided).
 */
export function pairAsymmetry(map, pair) {
  const l = map[pair.left] ?? 0;
  const r = map[pair.right] ?? 0;
  const max = Math.max(l, r);
  const asymmetryPct = max > 0.02 ? Math.round((Math.abs(l - r) / max) * 100) : 0;
  return { left: l, right: r, asymmetryPct };
}

/** Weighted overall asymmetry percentage across the curated pair set, for a single frame's blendshape map. */
export function overallAsymmetry(map) {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const pair of SYMMETRY_PAIRS) {
    const { left, right } = pairAsymmetry(map, pair);
    const max = Math.max(left, right);
    if (max < 0.02) continue; // ignore pairs with no meaningful activation this frame
    weightedSum += (Math.abs(left - right) / max) * pair.weight;
    weightTotal += pair.weight;
  }
  return weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 100) : 0;
}
