import { FaceLandmarker, FilesetResolver, HandLandmarker, PoseLandmarker } from '@mediapipe/tasks-vision';
import poseModelAssetPath from '../models/pose_landmarker_full.task?url';
import handModelAssetPath from '../models/hand_landmarker.task?url';
import faceModelAssetPath from '../models/face_landmarker.task?url';

// Self-hosted WASM runtime (copied from node_modules/@mediapipe/tasks-vision/wasm
// into /public/wasm) so the app works fully offline and isn't pinned to a CDN.
const WASM_BASE_PATH = '/wasm';

let visionFilesetPromise = null;
function getFileset() {
  if (!visionFilesetPromise) {
    visionFilesetPromise = FilesetResolver.forVisionTasks(WASM_BASE_PATH).catch((err) => {
      visionFilesetPromise = null;
      throw err;
    });
  }
  return visionFilesetPromise;
}

/** Try the GPU delegate first, fall back to CPU for devices/browsers that can't run it. */
async function createWithFallback(TaskClass, baseOptions, taskOptions) {
  const vision = await getFileset();
  try {
    return await TaskClass.createFromOptions(vision, {
      baseOptions: { ...baseOptions, delegate: 'GPU' },
      ...taskOptions,
    });
  } catch (gpuError) {
    console.warn(`GPU delegate unavailable for ${TaskClass.name}, falling back to CPU`, gpuError);
    return TaskClass.createFromOptions(vision, {
      baseOptions: { ...baseOptions, delegate: 'CPU' },
      ...taskOptions,
    });
  }
}

let poseLandmarkerPromise = null;

/**
 * Lazily creates a single shared PoseLandmarker instance (video running
 * mode). Creating the WASM runtime + model is expensive (network + compile),
 * so we memoize the promise across the app's lifetime.
 */
export function getPoseLandmarker() {
  if (!poseLandmarkerPromise) {
    poseLandmarkerPromise = createWithFallback(
      PoseLandmarker,
      { modelAssetPath: poseModelAssetPath },
      {
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      },
    ).catch((err) => {
      poseLandmarkerPromise = null;
      throw err;
    });
  }
  return poseLandmarkerPromise;
}

let handLandmarkerPromise = null;

/** Lazily creates a single shared HandLandmarker instance (video running mode, up to 2 hands). */
export function getHandLandmarker() {
  if (!handLandmarkerPromise) {
    handLandmarkerPromise = createWithFallback(
      HandLandmarker,
      { modelAssetPath: handModelAssetPath },
      {
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      },
    ).catch((err) => {
      handLandmarkerPromise = null;
      throw err;
    });
  }
  return handLandmarkerPromise;
}

let faceLandmarkerPromise = null;

/**
 * Lazily creates a single shared FaceLandmarker instance (video running
 * mode, blendshapes enabled). Blendshapes give per-side facial-expression
 * scores (e.g. mouthSmileLeft/Right) directly, which is a much more robust
 * symmetry signal than trying to hand-derive it from raw mesh geometry.
 */
export function getFaceLandmarker() {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = createWithFallback(
      FaceLandmarker,
      { modelAssetPath: faceModelAssetPath },
      {
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      },
    ).catch((err) => {
      faceLandmarkerPromise = null;
      throw err;
    });
  }
  return faceLandmarkerPromise;
}

export { PoseLandmarker, HandLandmarker, FaceLandmarker };
