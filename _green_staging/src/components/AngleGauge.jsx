// Semicircular gauge showing a 0-180° joint angle with a target marker.
export default function AngleGauge({ label, angle, target, tolerance = 12, accent = '#15803d', size = 140 }) {
  const clamped = angle === null || angle === undefined ? 0 : Math.max(0, Math.min(180, angle));
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  const toXY = (deg) => {
    const rad = (Math.PI * (180 - deg)) / 180;
    return [cx + radius * Math.cos(rad), cy - radius * Math.sin(rad)];
  };

  const describeArc = (startDeg, endDeg) => {
    const [x1, y1] = toXY(startDeg);
    const [x2, y2] = toXY(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const [needleX, needleY] = toXY(clamped);
  const [targetX, targetY] = toXY(Math.min(180, target));
  const reached = angle !== null && angle !== undefined && angle >= target - tolerance;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
        <path
          d={describeArc(0, 180)}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={describeArc(0, clamped)}
          fill="none"
          stroke={reached ? 'var(--color-success)' : accent}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* target marker */}
        <line
          x1={targetX}
          y1={targetY}
          x2={cx + (targetX - cx) * 0.7}
          y2={cy + (targetY - cy) * 0.7}
          stroke="var(--color-warning)"
          strokeWidth="3"
        />
        {/* needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="var(--color-ink-soft)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="4" fill="var(--color-ink-soft)" />
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fontWeight="600" fill="var(--color-ink)">
          {angle === null || angle === undefined ? '--' : `${Math.round(angle)}°`}
        </text>
      </svg>
      <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
    </div>
  );
}
