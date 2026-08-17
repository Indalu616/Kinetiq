// Left/right comparison bar — the one "movement pattern" visualization used
// across Arm, Hand and Facial results. Two directly-labeled, fixed-identity
// series (Left is always blue, Right is always amber) so color never has to
// carry meaning alone, per the app's data-viz guidelines.
const LEFT_COLOR = 'var(--color-primary)';
const RIGHT_COLOR = '#c2660e';

export function SymmetryBar({ label, leftValue, rightValue, leftLabel = 'Left', rightLabel = 'Right', unit = '', max }) {
  const scaleMax = max ?? Math.max(leftValue, rightValue, 1) * 1.15;
  const leftPct = Math.max(2, Math.min(100, (leftValue / scaleMax) * 100));
  const rightPct = Math.max(2, Math.min(100, (rightValue / scaleMax) * 100));

  return (
    <div>
      {label && <div className="mb-2 text-[12.5px] font-medium text-ink-soft">{label}</div>}
      <div className="space-y-2">
        <Row swatchColor={LEFT_COLOR} name={leftLabel} value={leftValue} unit={unit} pct={leftPct} />
        <Row swatchColor={RIGHT_COLOR} name={rightLabel} value={rightValue} unit={unit} pct={rightPct} />
      </div>
    </div>
  );
}

function Row({ swatchColor, name, value, unit, pct }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-16 shrink-0 items-center gap-1.5 text-xs font-medium text-ink-soft">
        <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: swatchColor }} />
        {name}
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg-inset">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: swatchColor }} />
      </div>
      <div className="w-14 shrink-0 text-right text-xs font-semibold tabular text-ink">
        {value}
        {unit}
      </div>
    </div>
  );
}

export default SymmetryBar;
