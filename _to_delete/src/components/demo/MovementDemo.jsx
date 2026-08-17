import KeyframeAvatar from './KeyframeAvatar';
import {
  BODY_BONES,
  BODY_JOINTS,
  BODY_VIEWBOX,
  BODY_HEAD_JOINT,
  HAND_BONES,
  HAND_JOINTS,
  HAND_VIEWBOX,
  SHOULDER_RAISE_SEQUENCE,
  SIT_TO_STAND_SEQUENCE,
  HAND_TAP_SEQUENCE,
  GAIT_SEQUENCE,
} from '../../lib/avatarPoses';

const CONFIGS = {
  'shoulder-raise': {
    joints: BODY_JOINTS,
    bones: BODY_BONES,
    sequence: SHOULDER_RAISE_SEQUENCE,
    viewBox: BODY_VIEWBOX,
    headJoint: BODY_HEAD_JOINT,
    caption: 'Raise your arm out to the side, then lower it — smoothly, in one motion.',
  },
  'sit-to-stand': {
    joints: BODY_JOINTS,
    bones: BODY_BONES,
    sequence: SIT_TO_STAND_SEQUENCE,
    viewBox: BODY_VIEWBOX,
    headJoint: BODY_HEAD_JOINT,
    caption: 'Stand up fully, then sit back down — keep your hips, knees and ankles in frame.',
  },
  'hand-tap': {
    joints: HAND_JOINTS,
    bones: HAND_BONES,
    sequence: HAND_TAP_SEQUENCE,
    viewBox: HAND_VIEWBOX,
    headJoint: null,
    caption: 'Tap your thumb and index finger together, as fast and evenly as you can.',
  },
  gait: {
    joints: BODY_JOINTS,
    bones: BODY_BONES,
    sequence: GAIT_SEQUENCE,
    viewBox: BODY_VIEWBOX,
    headJoint: BODY_HEAD_JOINT,
    caption: 'Walk toward the camera at a steady pace — coming soon.',
  },
};

/**
 * Small looping reference animation showing the correct way to perform a
 * given exercise/assessment. Purely illustrative — a hand-authored keyframe
 * loop rendered with the same lines-and-dots visual language as the live
 * skeleton overlay, not a video or 3D model (see avatarPoses.js for why).
 */
export default function MovementDemo({ type, mirror = false, size = 'md', showCaption = true, className = '' }) {
  const config = CONFIGS[type];
  if (!config) return null;

  const dims = size === 'sm' ? 'h-24 w-24' : size === 'lg' ? 'h-56 w-56' : 'h-36 w-36';

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`overflow-hidden rounded-2xl border border-line bg-stage ${dims}`}>
        <KeyframeAvatar
          joints={config.joints}
          bones={config.bones}
          sequence={config.sequence}
          viewBox={config.viewBox}
          headJoint={config.headJoint}
          className="h-full w-full"
          style={mirror ? { transform: 'scaleX(-1)' } : undefined}
        />
      </div>
      {showCaption && <p className="max-w-[14rem] text-center text-[11px] leading-snug text-ink-faint">{config.caption}</p>}
    </div>
  );
}
