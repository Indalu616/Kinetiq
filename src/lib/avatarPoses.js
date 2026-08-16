/**
 * Data for the "movement demo" avatars — small looping stick-figure/hand
 * animations that show the correct way to perform each exercise/assessment,
 * rendered by <KeyframeAvatar>. Everything here is hand-authored coordinate
 * data (normalized to each avatar's own SVG viewBox), not a 3D model or
 * video asset: there is no stock source for these movements (they're
 * protocols this app defines), so the demo is drawn with the same
 * lines-and-dots language already used for the live skeleton overlay and the
 * landing-page hero illustration.
 *
 * A "sequence" is a loop of keyframes: [{ pose, duration }, ...]. Each pose
 * is a full snapshot of every named joint's [x, y] position; KeyframeAvatar
 * linearly interpolates between consecutive keyframes and loops forever.
 */

// ---------------------------------------------------------------- body ---

export const BODY_VIEWBOX = '0 0 200 260';
export const BODY_HEAD_JOINT = 'head';

export const BODY_BONES = [
  ['head', 'chest'],
  ['chest', 'shoulderL'],
  ['chest', 'shoulderR'],
  ['shoulderL', 'elbowL'],
  ['elbowL', 'wristL'],
  ['shoulderR', 'elbowR'],
  ['elbowR', 'wristR'],
  ['chest', 'hipMid'],
  ['hipMid', 'hipL'],
  ['hipMid', 'hipR'],
  ['hipL', 'kneeL'],
  ['kneeL', 'ankleL'],
  ['hipR', 'kneeR'],
  ['kneeR', 'ankleR'],
];

export const BODY_JOINTS = Array.from(new Set(BODY_BONES.flat()));

const STANDING = {
  head: [100, 30],
  chest: [100, 74],
  shoulderL: [78, 82],
  shoulderR: [122, 82],
  elbowL: [68, 122],
  elbowR: [132, 122],
  wristL: [64, 160],
  wristR: [136, 160],
  hipMid: [100, 162],
  hipL: [85, 168],
  hipR: [115, 168],
  kneeL: [82, 208],
  kneeR: [118, 208],
  ankleL: [80, 248],
  ankleR: [120, 248],
};

// Right arm raised straight out to the side, elbow near shoulder height —
// the target pose for the shoulder-raise coach and the arm-movement test.
const ARM_RAISED = {
  ...STANDING,
  elbowR: [166, 82],
  wristR: [204, 78],
};

// Deep knee bend, hips lowered toward a seated height — the "down" phase of
// sit-to-stand. Torso stays roughly upright with a slight forward lean.
const SEATED = {
  head: [104, 112],
  chest: [103, 152],
  shoulderL: [84, 158],
  shoulderR: [122, 158],
  elbowL: [70, 172],
  elbowR: [136, 172],
  wristL: [64, 188],
  wristR: [142, 188],
  hipMid: [102, 190],
  hipL: [87, 194],
  hipR: [117, 194],
  kneeL: [80, 194],
  kneeR: [120, 194],
  ankleL: [78, 248],
  ankleR: [122, 248],
};

export const SHOULDER_RAISE_SEQUENCE = [
  { pose: STANDING, duration: 650 },
  { pose: ARM_RAISED, duration: 750 },
  { pose: ARM_RAISED, duration: 350 },
  { pose: STANDING, duration: 650 },
  { pose: STANDING, duration: 250 },
];

export const SIT_TO_STAND_SEQUENCE = [
  { pose: SEATED, duration: 200 },
  { pose: STANDING, duration: 800 },
  { pose: STANDING, duration: 350 },
  { pose: SEATED, duration: 800 },
];

// Simple alternating-stride walk cycle for the "coming soon" gait card —
// purely illustrative (the test itself isn't wired up yet), built from the
// same body rig so it costs nothing extra to add.
const WALK_A = {
  ...STANDING,
  hipL: [85, 168],
  hipR: [115, 168],
  kneeL: [70, 205],
  kneeR: [130, 212],
  ankleL: [58, 246],
  ankleR: [128, 250],
  wristL: [148, 150],
  wristR: [52, 150],
  elbowL: [140, 118],
  elbowR: [60, 118],
};
const WALK_B = {
  ...STANDING,
  hipL: [85, 168],
  hipR: [115, 168],
  kneeL: [130, 212],
  kneeR: [70, 205],
  ankleL: [128, 250],
  ankleR: [58, 246],
  wristL: [52, 150],
  wristR: [148, 150],
  elbowL: [60, 118],
  elbowR: [140, 118],
};

export const GAIT_SEQUENCE = [
  { pose: WALK_A, duration: 420 },
  { pose: WALK_B, duration: 420 },
  { pose: WALK_A, duration: 420 },
];

// ---------------------------------------------------------------- hand ---

export const HAND_VIEWBOX = '0 0 160 170';
export const HAND_ROOT_JOINT = 'wrist';

export const HAND_BONES = [
  ['wrist', 'palm'],
  ['palm', 'thumbBase'],
  ['thumbBase', 'thumbTip'],
  ['palm', 'indexBase'],
  ['indexBase', 'indexTip'],
  ['palm', 'middleBase'],
  ['middleBase', 'middleTip'],
  ['palm', 'ringBase'],
  ['ringBase', 'ringTip'],
  ['palm', 'pinkyBase'],
  ['pinkyBase', 'pinkyTip'],
];

export const HAND_JOINTS = Array.from(new Set(HAND_BONES.flat()));

const HAND_OPEN = {
  wrist: [80, 155],
  palm: [80, 102],
  thumbBase: [54, 96],
  thumbTip: [30, 74],
  indexBase: [64, 58],
  indexTip: [56, 16],
  middleBase: [80, 52],
  middleTip: [80, 8],
  ringBase: [96, 58],
  ringTip: [102, 18],
  pinkyBase: [109, 68],
  pinkyTip: [120, 34],
};

const HAND_PINCH = {
  ...HAND_OPEN,
  thumbTip: [60, 42],
  indexTip: [58, 38],
};

export const HAND_TAP_SEQUENCE = [
  { pose: HAND_OPEN, duration: 320 },
  { pose: HAND_PINCH, duration: 220 },
  { pose: HAND_PINCH, duration: 90 },
  { pose: HAND_OPEN, duration: 320 },
];
