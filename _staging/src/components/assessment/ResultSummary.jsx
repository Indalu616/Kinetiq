import Icon from '../ui/icons';
import Badge from '../ui/Badge';
import MetricCard from '../ui/MetricCard';
import Disclaimer from '../ui/Disclaimer';
import Button from '../ui/Button';

/**
 * Shared results shell used by every assessment's summary screen: a status
 * header, a metrics grid, an optional custom visualization slot (symmetry
 * bars, etc.), a plain-language screening insight, the non-diagnostic
 * disclaimer, and a consistent set of next-step actions.
 */
export default function ResultSummary({
  assessmentName,
  statusGood,
  statusLabel,
  summaryLine,
  metrics = [],
  visual,
  insight,
  disclaimerVariant,
  onRepeat,
  onExit,
  onViewHistory,
  onExportJSON,
  onExportCSV,
}) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-5">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-success">
              <Icon name="checkCircle" className="h-5 w-5" />
              <span className="text-[13px] font-medium">Assessment complete</span>
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink">{assessmentName}</h2>
            {summaryLine && <p className="mt-1 text-[13.5px] text-ink-soft">{summaryLine}</p>}
          </div>
          {statusLabel && (
            <Badge tone={statusGood ? 'success' : 'warning'} icon={statusGood ? 'checkCircle' : 'alert'}>
              {statusLabel}
            </Badge>
          )}
        </div>

        {metrics.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        )}

        {visual && (
          <div className="mt-6 rounded-lg border border-border bg-bg-inset/50 p-4">
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Movement pattern</h3>
            {visual}
          </div>
        )}

        {insight && (
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-info/20 bg-info-soft/70 px-3.5 py-3">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-info" />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{insight}</p>
          </div>
        )}

        <Disclaimer variant={disclaimerVariant} className="mt-4" />

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          {onRepeat && (
            <Button variant="primary" onClick={onRepeat}>
              <Icon name="refresh" className="h-4 w-4" /> Repeat assessment
            </Button>
          )}
          {onExit && (
            <Button variant="secondary" onClick={onExit}>
              Continue to another assessment
            </Button>
          )}
          {onViewHistory && (
            <Button variant="secondary" onClick={onViewHistory}>
              <Icon name="history" className="h-4 w-4" /> View history
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            {onExportJSON && (
              <Button variant="ghost" size="sm" onClick={onExportJSON}>
                <Icon name="download" className="h-3.5 w-3.5" /> JSON
              </Button>
            )}
            {onExportCSV && (
              <Button variant="ghost" size="sm" onClick={onExportCSV}>
                <Icon name="download" className="h-3.5 w-3.5" /> CSV
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
