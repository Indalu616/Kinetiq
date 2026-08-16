import TestToast from './TestToast';

/**
 * Generic camera + skeleton overlay stage shared by all Motor Assessment
 * tests — same visual shell as Phase 1's CameraStage, parameterized so each
 * test can show its own "not detected" copy and an optional status badge
 * (e.g. a phase indicator or a countdown timer).
 */
export default function TestStage({
  videoRef,
  canvasRef,
  modelStatus,
  modelError,
  cameraStatus,
  cameraError,
  running,
  detected,
  notDetectedLabel = 'Nothing detected — step into frame',
  toastEvent,
  badge,
}) {
  const showOverlayMessage =
    modelStatus === 'loading' || modelStatus === 'error' || cameraStatus === 'error' || cameraStatus === 'idle';

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-stage shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <video ref={videoRef} className="absolute inset-0 h-full w-full -scale-x-100 object-cover" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />

      <TestToast event={toastEvent} />

      {badge && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-line bg-panel/90 px-4 py-1.5 text-xs font-medium text-ink backdrop-blur">
          {badge}
        </div>
      )}

      {running && !detected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-amber/30 bg-amber-soft/90 px-4 py-1.5 text-xs font-medium text-amber backdrop-blur">
          {notDetectedLabel}
        </div>
      )}

      {showOverlayMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stage/95 px-6 text-center">
          {modelStatus === 'loading' && (
            <>
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-stage-accent" />
              <p className="text-sm text-stage-fg/70">Loading detection model…</p>
            </>
          )}
          {modelStatus === 'error' && (
            <p className="max-w-sm text-sm text-clay">{modelError ?? 'Failed to load the detection model.'}</p>
          )}
          {modelStatus === 'ready' && cameraStatus === 'idle' && (
            <p className="max-w-sm text-sm text-stage-fg/60">
              Camera is off. Press <span className="font-medium text-stage-fg">Start test</span> to begin.
            </p>
          )}
          {cameraStatus === 'error' && <p className="max-w-sm text-sm text-clay">{cameraError}</p>}
        </div>
      )}
    </div>
  );
}
