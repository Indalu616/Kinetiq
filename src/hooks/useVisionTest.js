import { useCallback, useEffect, useRef, useState } from 'react';
import { DrawingUtils } from '@mediapipe/tasks-vision';
import { useCamera } from './useCamera';

/**
 * Shared camera + MediaPipe landmarker + detection-loop + base-skeleton-draw
 * plumbing, factored out of the Phase-1 exercise hook so the Motor
 * Assessment tests (sit-to-stand, arm assessment, hand assessment) don't
 * each re-implement the same camera/RAF/drawing boilerplate. Test-specific
 * tracking logic (angles, rep counting, etc.) lives in the caller, wired in
 * via `onFrame`.
 *
 * @param {() => Promise<object>} getLandmarker - resolves the shared PoseLandmarker/HandLandmarker instance
 * @param {Array} connections - Connection[] used to draw the base skeleton (e.g. PoseLandmarker.POSE_CONNECTIONS)
 * @param {(entities: Array, result: object, timestamp: number) => void} onFrame - called once per detected frame with the raw `result.landmarks` entities
 * @param {(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, entities: Array, result: object) => void} [drawExtra] - optional extra overlay drawing on top of the base skeleton
 */
export function useVisionTest({ getLandmarker, connections, onFrame, drawExtra }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const camera = useCamera(videoRef);

  const [modelStatus, setModelStatus] = useState('loading'); // loading | ready | error
  const [modelError, setModelError] = useState(null);
  const [running, setRunning] = useState(false);
  const [detected, setDetected] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const landmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const rafRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const startTimeRef = useRef(null);
  const onFrameRef = useRef(onFrame);
  const drawExtraRef = useRef(drawExtra);

  useEffect(() => {
    onFrameRef.current = onFrame;
    drawExtraRef.current = drawExtra;
  }, [onFrame, drawExtra]);

  useEffect(() => {
    let cancelled = false;
    getLandmarker()
      .then((lm) => {
        if (cancelled) return;
        landmarkerRef.current = lm;
        setModelStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load vision model', err);
        setModelError(err?.message ?? 'Failed to load the detection model.');
        setModelStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawFrame = useCallback((entities, result) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!drawingUtilsRef.current) drawingUtilsRef.current = new DrawingUtils(ctx);
    const drawingUtils = drawingUtilsRef.current;

    for (const entity of entities) {
      drawingUtils.drawConnectors(entity, connections, {
        color: 'rgba(241, 236, 221, 0.45)',
        lineWidth: 3,
      });
      drawingUtils.drawLandmarks(entity, {
        color: 'rgba(241, 236, 221, 0.45)',
        fillColor: '#e2e8f0',
        radius: 3,
      });
    }

    drawExtraRef.current?.(ctx, canvas, entities, result);
    ctx.restore();
  }, [connections]);

  const processResult = useCallback(
    (result, timestamp) => {
      const entities = result.landmarks ?? [];
      setDetected(entities.length > 0);
      onFrameRef.current?.(entities, result, timestamp);
      drawFrame(entities, result);
    },
    [drawFrame],
  );

  useEffect(() => {
    if (!running) return undefined;
    let cancelled = false;

    function loop() {
      if (cancelled) return;
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (video && landmarker && video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const timestamp = performance.now();
        const result = landmarker.detectForVideo(video, timestamp);
        processResult(result, timestamp);
        if (startTimeRef.current !== null) setElapsedMs(timestamp - startTimeRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, processResult]);

  const start = useCallback(
    async (preferredDeviceId) => {
      await camera.start(preferredDeviceId);
      if (modelStatus !== 'ready') return;
      lastVideoTimeRef.current = -1;
      setElapsedMs(0);
      startTimeRef.current = performance.now();
      setRunning(true);
    },
    [camera, modelStatus],
  );

  const stop = useCallback(() => {
    setRunning(false);
    camera.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [camera]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => camera.stop(), [camera.stop]);

  return {
    videoRef,
    canvasRef,
    camera,
    modelStatus,
    modelError,
    running,
    detected,
    elapsedMs,
    start,
    stop,
  };
}
