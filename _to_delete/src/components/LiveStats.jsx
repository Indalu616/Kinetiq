import AngleGauge from './AngleGauge';
import StatCard from './StatCard';
import { DEFAULT_CONFIG } from '../lib/exerciseEngine';

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LiveStats({ side, targetAngle, liveSides, elapsedMs }) {
  const leftReps = liveSides.left.reps;
  const rightReps = liveSides.right.reps;
  const showLeft = side === 'left' || side === 'both';
  const showRight = side === 'right' || side === 'both';

  const allReps = [...leftReps, ...rightReps];
  const totalReps = allReps.length;
  const correctReps = allReps.filter((r) => r.correct).length;
  const formScore = totalReps ? Math.round((correctReps / totalReps) * 100) : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[15px] text-ink">Live stats</h2>
        <span className="rounded-full border border-line bg-cream-soft px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink-soft">
          {formatTime(elapsedMs)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6">
        {showLeft && (
          <AngleGauge
            label="Left shoulder"
            angle={liveSides.left.visible ? liveSides.left.angle : null}
            target={targetAngle}
            tolerance={DEFAULT_CONFIG.targetTolerance}
            accent="#d9a441"
          />
        )}
        {showRight && (
          <AngleGauge
            label="Right shoulder"
            angle={liveSides.right.visible ? liveSides.right.angle : null}
            target={targetAngle}
            tolerance={DEFAULT_CONFIG.targetTolerance}
            accent="#c1704e"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total reps" value={totalReps} accent="text-ink" />
        <StatCard label="Form score" value={`${formScore}%`} accent={formScore >= 70 ? 'text-forest' : 'text-amber'} />
        <StatCard label="Correct" value={correctReps} accent="text-forest" />
        <StatCard label="Needs work" value={totalReps - correctReps} accent="text-amber" />
      </div>

      {(showLeft || showRight) && (
        <div className="grid grid-cols-2 gap-3 text-xs text-ink-soft">
          {showLeft && (
            <div className="rounded-lg border border-line px-3 py-2">
              <div className="font-medium" style={{ color: '#a4681f' }}>
                Left
              </div>
              <div>{leftReps.length} reps</div>
            </div>
          )}
          {showRight && (
            <div className="rounded-lg border border-line px-3 py-2">
              <div className="font-medium" style={{ color: '#a4522e' }}>
                Right
              </div>
              <div>{rightReps.length} reps</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
