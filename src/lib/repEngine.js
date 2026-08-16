/**
 * Generic hysteresis-based rep-counting state machine, extracted from the
 * Phase-1 shoulder tracker (see exerciseEngine.js) so the Motor Assessment
 * tests (sit-to-stand, hand taps, etc.) can reuse the exact same
 * landmark -> angle -> rep pipeline instead of re-deriving it per test.
 *
 * A "rep" is any signal that rises above `enterHigh`, peaks, then falls back
 * below `exitLow` (exitLow < enterHigh gives the hysteresis band that keeps
 * sensor jitter from double-counting). Works equally well for a shoulder
 * abduction angle, a knee extension angle, or a normalized pinch distance —
 * the caller just decides what "primary" and "secondary" mean.
 */

export const REP_DEFAULTS = {
  enterHigh: 40,
  exitLow: 25,
  targetPrimary: 90,
  targetTolerance: 12,
  minRepPrimary: 30,
  minSecondary: null, // optional secondary threshold (e.g. "keep arm straight"); null disables the check
  minVisibility: 0.5,
};

let idCounter = 0;

export class RepTracker {
  constructor(label, config = {}) {
    this.label = label;
    this.config = { ...REP_DEFAULTS, ...config };
    this.state = 'low';
    this.peakPrimary = 0;
    this.bestSecondary = null;
    this.repStartTime = null;
    this.reps = [];
    this.livePrimary = 0;
    this.liveSecondary = null;
    this.visible = false;
  }

  updateConfig(partial) {
    this.config = { ...this.config, ...partial };
  }

  reset() {
    this.state = 'low';
    this.peakPrimary = 0;
    this.bestSecondary = null;
    this.repStartTime = null;
    this.reps = [];
  }

  /**
   * Feed one frame of measurements into the state machine.
   * @returns {{ event: 'rep-completed', rep: object } | null}
   */
  update(primary, secondary, visibility, timestamp) {
    this.visible = visibility >= this.config.minVisibility;
    if (!this.visible || primary === null || primary === undefined) return null;

    this.livePrimary = primary;
    this.liveSecondary = secondary ?? this.liveSecondary;

    if (this.state === 'low') {
      if (primary >= this.config.enterHigh) {
        this.state = 'high';
        this.peakPrimary = primary;
        this.bestSecondary = secondary ?? null;
        this.repStartTime = timestamp;
      }
      return null;
    }

    // state === 'high'
    if (primary > this.peakPrimary) this.peakPrimary = primary;
    if (secondary !== null && secondary !== undefined) {
      if (this.bestSecondary === null || secondary < this.bestSecondary) this.bestSecondary = secondary;
    }

    if (primary <= this.config.exitLow) {
      const rep = this._finalizeRep(timestamp);
      this.state = 'low';
      this.peakPrimary = 0;
      this.bestSecondary = null;
      if (rep) return { event: 'rep-completed', rep };
    }

    return null;
  }

  _finalizeRep(timestamp) {
    if (this.peakPrimary < this.config.minRepPrimary) return null;

    const { targetPrimary, targetTolerance, minSecondary } = this.config;
    const reachedTarget = this.peakPrimary >= targetPrimary - targetTolerance;
    const secondaryOk = minSecondary == null || this.bestSecondary == null || this.bestSecondary >= minSecondary;
    const correct = reachedTarget && secondaryOk;

    const rep = {
      id: `${this.label}-${Date.now()}-${idCounter++}`,
      label: this.label,
      index: this.reps.length + 1,
      peakPrimary: Math.round(this.peakPrimary),
      bestSecondary: this.bestSecondary == null ? null : Math.round(this.bestSecondary),
      correct,
      reachedTarget,
      secondaryOk,
      timestamp,
      durationMs: this.repStartTime ? timestamp - this.repStartTime : null,
    };

    this.reps.push(rep);
    return rep;
  }
}
