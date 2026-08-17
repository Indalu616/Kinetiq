import Icon from '../ui/icons';
import Button from '../ui/Button';
import { StageLoading } from '../ui/LoadingState';
import AssessmentToast from './AssessmentToast';

/**
 * The one camera stage used by every assessment (and the legacy free
 * session): a dark, rounded, bordered "photo card" with a live skeleton
 * overlay canvas, a detection-status pill, positioning guidance, and clean
 * model/camera error states — never raw technical logs.
 */
export default function CameraFrame({
  videoRef,
  canvasRef,
  modelStatus,
  modelError,
  cameraStatus,
  cameraError,
  running,
  detected,
  notDetectedLabel = 'Step into frame so the guide can find you',
  toastEvent,
  badge,
  positionHint,
  onStart,
  startLabel = 'Start assessment',
  canStart = true,
}) {
  const showOverlayMessage =
    modelStatus === 'loading' || modelStatus === 'error' || cameraStatus === 'error' || cameraStatus === 'idle';

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-stage shadow-sm">
      <video ref={videoRef} className="absolute inset-0 h-full w-full -scale-x-100 object-cover" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />

      <AssessmentToast event={toastEvent} />

      {/* Live detection status, top-left */}
      {!showOverlayMessage && (
        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-stage-fg backdrop-blur">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running ? (detected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse-dot') : 'bg-stage-fg-soft'
            }`}
          />
          {running ? (detected ? 'Person detected' : 'Searching…') : 'Camera ready'}
        </div>
      )}

      {badge && (
        <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-[12px] font-medium text-stage-fg backdrop-blur">
          {badge}
        </div>
      )}

      {running && !detected && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-warning/30 bg-warning-soft/95 px-4 py-1.5 text-xs font-medium text-warning backdrop-blur">
          {notDetectedLabel}
        </div>
      )}

      {showOverlayMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-stage/97 px-6 text-center">
          {modelStatus === 'loading' && <StageLoading message="Preparing movement analysis…" />}

          {modelStatus === 'error' && (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/15 text-danger">
                <Icon name="alert" className="h-5 w-5" />
              </span>
              <p className="max-w-sm text-sm text-stage-fg-soft">
                We couldn't initialize movement analysis. {modelError ? '' : 'Please try again.'}
              </p>
            </>
          )}

          {modelStatus === 'ready' && cameraStatus === 'idle' && (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-stage-fg">
                <Icon name="camera" className="h-5 w-5" />
              </span>
              <div>
                <p className="max-w-sm text-sm text-stage-fg">Camera is off</p>
                {positionHint && <p className="mx-auto mt-1.5 max-w-xs text-xs text-stage-fg-soft">{positionHint}</p>}
              </div>
              {onStart && (
                <Button variant="primary" onClick={onStart} disabled={!canStart}>
                  {startLabel}
                </Button>
              )}
            </>
          )}

          {cameraStatus === 'error' && (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/15 text-danger">
                <Icon name="camera" className="h-5 w-5" />
              </span>
              <div>
                <p className="max-w-sm text-sm text-stage-fg">Camera unavailable</p>
                <p className="mx-auto mt-1.5 max-w-sm text-xs text-stage-fg-soft">{cameraError}</p>
              </div>
              {onStart && (
                <Button variant="primary" onClick={onStart}>
                  Allow camera access
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
