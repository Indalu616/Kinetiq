/**
 * Geometry helpers for turning raw pose landmarks into clinically meaningful
 * joint angles.
 */

/**
 * Angle ABC (in degrees, 0-180) at vertex B, formed by points A-B-C.
 * Uses 2D image-plane coordinates (x, y) which is sufficiently accurate for
 * a single frontal stationary camera and avoids the noisier estimated z
 * coordinate.
 */
export function angleAt(a, b, c) {
  if (!a || !b || !c) return null;

  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot = abx * cbx + aby * cby;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);

  if (magAB === 0 || magCB === 0) return null;

  let cosAngle = dot / (magAB * magCB);
  cosAngle = Math.min(1, Math.max(-1, cosAngle));

  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/** 2D Euclidean distance between two landmarks (image-plane, ignores z). */
export function distance2D(a, b) {
  if (!a || !b) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Sample standard deviation of a list of numbers (0 for fewer than 2 samples). */
export function stdDev(values) {
  const clean = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (clean.length < 2) return 0;
  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  const variance = clean.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (clean.length - 1);
  return Math.sqrt(variance);
}

/** Average visibility score across a set of landmarks (0-1, higher = more confident). */
export function averageVisibility(landmarks) {
  const valid = landmarks.filter((p) => p && typeof p.visibility === 'number');
  if (valid.length === 0) return 0;
  return valid.reduce((sum, p) => sum + p.visibility, 0) / valid.length;
}

/** Simple exponential moving average smoother for a noisy scalar signal. */
export class SignalSmoother {
  constructor(alpha = 0.35) {
    this.alpha = alpha;
    this.value = null;
  }

  push(sample) {
    if (sample === null || Number.isNaN(sample)) return this.value;
    this.value = this.value === null ? sample : this.alpha * sample + (1 - this.alpha) * this.value;
    return this.value;
  }

  reset() {
    this.value = null;
  }
}
