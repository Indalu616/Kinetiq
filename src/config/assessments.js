// Single source of truth for assessment metadata — what each assessment
// measures, why it matters clinically, how long it takes, what it needs,
// and how it's categorized for the Stroke Screening dashboard. The library
// page, detail page, screening dashboard, and history page all read from
// this registry instead of re-declaring copy per screen.

export const ASSESSMENTS = [
  {
    id: 'facial-symmetry',
    name: 'Facial Symmetry',
    shortName: 'Face',
    tagline: 'Facial movement & smile-symmetry screening',
    category: 'screening',
    screeningGroup: 'face',
    summary:
      'Analyzes facial landmark movement while you smile naturally, comparing the left and right side of your face for measurable differences.',
    measures: [
      'Smile symmetry (mouth-corner movement)',
      'Eyebrow-raise symmetry',
      'Overall left/right facial movement difference',
    ],
    why: 'Uneven facial movement — most visibly an asymmetric smile or drooping — is one of the earliest and most recognizable signs used in stroke early-sign screening protocols (the "F" in FAST).',
    durationLabel: '20–30 seconds',
    equipment: 'Camera',
    position: 'Face centered in frame, in even lighting, roughly arm\'s length from the camera',
    model: 'MediaPipe Face Landmarker (478 landmarks + facial-expression blendshapes)',
    videoKey: 'facial-symmetry',
    available: true,
    steps: [
      { title: 'Position', body: 'Center your face inside the on-screen guide and look directly at the camera.' },
      { title: 'Hold neutral', body: 'Keep a relaxed, neutral expression for a moment so we can read your baseline.' },
      { title: 'Smile naturally', body: 'Smile naturally and hold it — the screening reads peak movement on each side of your face.' },
    ],
  },
  {
    id: 'arm-movement',
    name: 'Arm Movement',
    shortName: 'Arms',
    tagline: 'Upper-limb range-of-motion & symmetry assessment',
    category: 'assessment',
    screeningGroup: 'arms',
    summary:
      'Tracks shoulder abduction on each arm in turn, measuring how high, how fast, and how consistently you raise it — then compares left against right.',
    measures: [
      'Maximum elevation (range of motion)',
      'Movement speed per repetition',
      'Left / right difference (asymmetry)',
      'Movement consistency across reps',
    ],
    why: 'A one-sided drop in arm strength or range of motion — the "A" in FAST — is one of the most common early motor signs of stroke, and asymmetry is easier to catch by direct comparison than by looking at one side alone.',
    durationLabel: '30–60 seconds',
    equipment: 'Camera',
    position: 'Stand or sit facing the camera with both shoulders, elbows and wrists visible',
    model: 'MediaPipe Pose Landmarker (33-point body pose)',
    videoKey: 'arm-movement',
    available: true,
    steps: [
      { title: 'Position', body: 'Step back so your shoulders, elbows and wrists are all visible in frame.' },
      { title: 'Left arm', body: 'Raise your left arm out to the side and lower it, for the selected number of reps.' },
      { title: 'Right arm', body: 'The test then automatically switches to your right arm for the same number of reps.' },
    ],
  },
  {
    id: 'hand-assessment',
    name: 'Hand Assessment',
    shortName: 'Hands',
    tagline: 'Finger-tapping speed & hand-movement assessment',
    category: 'assessment',
    screeningGroup: 'hands',
    summary:
      'Counts thumb-to-index finger taps on each hand over a timed window, measuring speed, amplitude, and the difference between hands.',
    measures: [
      'Finger-tapping speed (taps per second)',
      'Tapping amplitude / pinch distance',
      'Left / right hand difference',
      'Repetition count',
    ],
    why: 'Slowed or uneven fine-motor control in one hand can accompany the same motor pathways affected by stroke and other neuromotor conditions, and is a useful complement to the arm and facial checks.',
    durationLabel: '10–20 seconds',
    equipment: 'Camera',
    position: 'Hold one or both hands 30–50cm from the camera, fingers spread and visible',
    model: 'MediaPipe Hand Landmarker (21-point hand pose, up to 2 hands)',
    videoKey: 'hand-assessment',
    available: true,
    steps: [
      { title: 'Position', body: 'Hold your hand up, palm toward the camera, 30–50cm away.' },
      { title: 'Loosen up', body: 'Open and relax your hand once so the guide can find your fingers.' },
      { title: 'Tap', body: 'Tap your thumb and index finger together as evenly and quickly as you can until time is up.' },
    ],
  },
  {
    id: 'sit-to-stand',
    name: 'Sit-to-Stand',
    shortName: 'Mobility',
    tagline: 'Lower-body strength & postural-control assessment',
    category: 'assessment',
    screeningGroup: null,
    summary:
      'A standardized-style repeated sit-to-stand test that tracks knee extension, repetition timing, and postural sway while you stand up and sit back down.',
    measures: [
      'Repetitions completed',
      'Time per repetition',
      'Approximate knee extension at standing',
      'Approximate postural sway (stability)',
    ],
    why: 'Sit-to-stand performance is a well-established proxy for lower-body strength, balance and fall risk, and gives a general mobility baseline alongside the stroke-focused checks.',
    durationLabel: '30–90 seconds',
    equipment: 'Camera, a chair',
    position: 'Seated, with your hips, knees and ankles all visible to the camera',
    model: 'MediaPipe Pose Landmarker (33-point body pose)',
    videoKey: 'sit-to-stand',
    available: true,
    steps: [
      { title: 'Position', body: 'Sit toward the front of a chair, side-on or facing the camera, with hips, knees and ankles visible.' },
      { title: 'Stand fully', body: 'Stand up completely, then sit back down — as smoothly and quickly as is comfortable.' },
      { title: 'Repeat', body: 'Repeat for the selected number of reps; the test ends automatically.' },
    ],
  },
  {
    id: 'walking-gait',
    name: 'Walking / Gait',
    shortName: 'Gait',
    tagline: 'Step symmetry & walking-stability assessment',
    category: 'assessment',
    screeningGroup: null,
    summary:
      'Multi-frame trajectory analysis of walking speed, step symmetry and stride length from a fixed side-on camera.',
    measures: ['Step count', 'Walking speed', 'Step symmetry', 'Stride length'],
    why: 'Gait changes can reflect balance and motor-control issues, but reliable measurement needs a side-on camera and multi-frame trajectory tracking rather than a single stationary desk camera.',
    durationLabel: 'Coming soon',
    equipment: 'Camera on a tripod, side-on to a walking path',
    position: 'Side-on to the camera, full body in frame across several steps',
    model: 'Not yet implemented',
    videoKey: null,
    available: false,
    comingSoonNote:
      'Gait needs a fixed side-on camera and multi-frame trajectory analysis rather than a single stationary desk camera, so it ships as "coming soon" rather than a placeholder result.',
    steps: [],
  },
];

export function getAssessment(id) {
  return ASSESSMENTS.find((a) => a.id === id) ?? null;
}

export const AVAILABLE_ASSESSMENTS = ASSESSMENTS.filter((a) => a.available);

// The three camera-based checks that make up the Stroke Screening dashboard
// (face / arms / hands — the F/A of the FAST protocol, plus a hand check).
// Sit-to-Stand and Gait are general mobility assessments, not part of the
// stroke early-sign screen, so they're excluded here on purpose.
export const SCREENING_GROUPS = [
  { key: 'face', label: 'Face', assessmentId: 'facial-symmetry' },
  { key: 'arms', label: 'Arms', assessmentId: 'arm-movement' },
  { key: 'hands', label: 'Hands', assessmentId: 'hand-assessment' },
];

export const RECORD_TYPE_TO_ASSESSMENT_ID = {
  'facial-symmetry': 'facial-symmetry',
  'arm-movement': 'arm-movement',
  'hand-assessment': 'hand-assessment',
  'sit-to-stand': 'sit-to-stand',
  exercise: null,
};
