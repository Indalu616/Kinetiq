// Central video-asset registry. Every demonstration clip used anywhere in
// the app is imported once here and referenced by key — components never
// import a video file directly. This is the single place that maps a
// physical file in src/assets/videos/ to the assessment it demonstrates.
//
// Source clips (src/assets/videos/), identified by inspecting each file's
// frames before wiring anything up:
//   left_right_arm_exercise.mp4  — single-arm raise out to the side and back
//                                   down, matches the Arm Movement assessment
//   hand _test.mp4                — raised hand, thumb-to-index tapping motion,
//                                   matches the Hand Assessment
//   stretch_hand.mp4              — both arms raised/opened, a loosen-up
//                                   stretch; used as the hand assessment's
//                                   "before you start" preparation clip
//   sit_to_stand.mp4              — full squat-to-stand cycle, matches
//                                   Sit-to-Stand
//   facial_smile_demo.mp4         — face landmark mesh over a natural smile,
//                                   matches Facial Symmetry screening

import armMovement from '../assets/videos/left_right_arm_exercise.mp4';
import handTap from '../assets/videos/hand _test.mp4';
import handStretch from '../assets/videos/stretch_hand.mp4';
import sitToStand from '../assets/videos/sit_to_stand.mp4';
import facialSmile from '../assets/videos/facial_smile_demo.mp4';

export const ASSESSMENT_VIDEOS = {
  'arm-movement': armMovement,
  'hand-assessment': handTap,
  'hand-assessment-prep': handStretch,
  'sit-to-stand': sitToStand,
  'facial-symmetry': facialSmile,
};

export function getAssessmentVideo(id) {
  return ASSESSMENT_VIDEOS[id] ?? null;
}
