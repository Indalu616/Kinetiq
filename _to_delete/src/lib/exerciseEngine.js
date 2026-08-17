/**
 * Pure, framework-agnostic rep-counting state machine for a single arm
 * performing shoulder abduction (arm raise) reps.
 *
 * The machine uses hysteresis (two different thresholds for "arm went up"
 * vs "arm came back down") so that sensor jitter around a single threshold
 * can't register as multiple reps.
 *
 * States:
 *  - "down": resting position, waiting for the arm to rise.
 *  - "rising"/"up": arm is above the "raised" threshold; we track the peak
 *     abduction angle reached (the range of motion for this rep) plus the
 *     best (most extended) elbow angle, used as a secondary straight-arm
 *     form check.
 *
 * A rep is logged when the arm returns back down below the "down" threshold
 * after having crossed the "up" threshold.
 */

export const DEFAULT_CONFIG = {
  // Angle (degrees) the arm must rise above to be considered "raised".
  raiseEnterAngle: 40,
  // Angle (degrees) the arm must fall below to be considered "down" again
  // (must be < raiseEnterAngle to create hysteresis).
  lowerExitAngle: 25,
  // Target range of motion for a fully "good" rep.
  targetAngle: 90,
  // Tolerance below the target that still counts as "good".
  targetTolerance: 12,
  // Minimum peak angle for a movement to be counted as a genuine rep at all
  // (guards against tiny arm twitches being logged as failed reps).
  minRepAngle: 30,
  // Elbow angle below this (very bent) at peak flags "keep your arm straighter".
  minElbowStraightAngle: 130,
  // Average landmark visibility required to trust a frame.
  minVisibility: 0.5,
};

let repIdCounter = 0;

export class ArmRepTracker {
  constructor(side, config = {}) {
    this.side = side;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = 'down';
    this.peakAngle = 0;
    this.peakElbowAngle = 180;
    this.repStartTime = null;
    this.reps = [];
    this.liveAngle = 0;
    this.liveElbowAngle = 180;
    this.visible = false;
  }

  updateConfig(partial) {
    this.config = { ...this.config, ...partial };
  }

  reset() {
    this.state = 'down';
    this.peakAngle = 0;
    this.peakElbowAngle = 180;
    this.repStartTime = null;
    this.reps = [];
  }

  /**
   * Feed one frame of measurements into the state machine.
   * @param {number|null} abductionAngle current shoulder abduction angle
   * @param {number|null} elbowAngle current elbow (straightness) angle
   * @param {number} visibility average landmark visibility (0-1)
   * @param {number} timestamp ms
   * @returns {{ event: 'rep-completed', rep: object } | null}
   */
  update(abductionAngle, elbowAngle, visibility, timestamp) {
    this.visible = visibility >= this.config.minVisibility;
    if (!this.visible || abductionAngle === null) {
      return null;
    }

    this.liveAngle = abductionAngle;
    this.liveElbowAngle = elbowAngle ?? this.liveElbowAngle;

    if (this.state === 'down') {
      if (abductionAngle >= this.config.raiseEnterAngle) {
        this.state = 'up';
        this.peakAngle = abductionAngle;
        this.peakElbowAngle = elbowAngle ?? 180;
        this.repStartTime = timestamp;
      }
      return null;
    }

    // state === 'up'
    if (abductionAngle > this.peakAngle) this.peakAngle = abductionAngle;
    if (elbowAngle !== null && elbowAngle < this.peakElbowAngle) {
      this.peakElbowAngle = elbowAngle;
    }

    if (abductionAngle <= this.config.lowerExitAngle) {
      const rep = this._finalizeRep(timestamp);
      this.state = 'down';
      this.peakAngle = 0;
      this.peakElbowAngle = 180;
      if (rep) {
        return { event: 'rep-completed', rep };
      }
    }

    return null;
  }

  _finalizeRep(timestamp) {
    if (this.peakAngle < this.config.minRepAngle) {
      // Too small a movement to count as an honest rep attempt.
      return null;
    }

    const { targetAngle, targetTolerance, minElbowStraightAngle } = this.config;
    const reachedTarget = this.peakAngle >= targetAngle - targetTolerance;
    const armStraight = this.peakElbowAngle >= minElbowStraightAngle;
    const correct = reachedTarget && armStraight;

    let note = 'Good movement';
    if (!reachedTarget && !armStraight) {
      note = 'Raise higher and straighten your arm';
    } else if (!reachedTarget) {
      note = 'Raise your arm higher';
    } else if (!armStraight) {
      note = 'Keep your arm straighter';
    }

    const rep = {
      id: `${this.side}-${Date.now()}-${repIdCounter++}`,
      side: this.side,
      index: this.reps.length + 1,
      romMax: Math.round(this.peakAngle),
      elbowAngleAtPeak: Math.round(this.peakElbowAngle),
      correct,
      note,
      timestamp,
      durationMs: this.repStartTime ? timestamp - this.repStartTime : null,
    };

    this.reps.push(rep);
    return rep;
  }
}
