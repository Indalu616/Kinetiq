import FeedbackToast from './FeedbackToast';

export default function CameraStage({
  videoRef,
  canvasRef,
  modelStatus,
  modelError,
  cameraStatus,
  cameraError,
  running,
  poseDetected,
  lastEvent,
}) {
  const showOverlayMessage =
    modelStatus === 'loading' || modelStatus === 'error' || cameraStatus === 'error' || cameraStatus === 'idle';

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-stage shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />

      <FeedbackToast event={lastEvent} />

      {running && !poseDetected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-amber/30 bg-amber-soft/90 px-4 py-1.5 text-xs font-medium text-amber backdrop-blur">
          No person detected — step into frame, facing the camera
        </div>
      )}

      {showOverlayMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stage/95 px-6 text-center">
          {modelStatus === 'loading' && (
            <>
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-stage-accent" />
              <p className="text-sm text-stage-fg/70">Loading pose detection model…</p>
            </>
          )}
          {modelStatus === 'error' && (
            <p className="max-w-sm text-sm text-clay">{modelError ?? 'Failed to load the pose model.'}</p>
          )}
          {modelStatus === 'ready' && cameraStatus === 'idle' && (
            <p className="max-w-sm text-sm text-stage-fg/60">
              Camera is off. Press <span className="font-medium text-stage-fg">Start session</span> to begin.
            </p>
          )}
          {cameraStatus === 'error' && <p className="max-w-sm text-sm text-clay">{cameraError}</p>}
        </div>
      )}
    </div>
  );
}
