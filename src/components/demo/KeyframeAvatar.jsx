import { useEffect, useRef } from 'react';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Smooth ease-in-out so the loop doesn't feel like a linear metronome.
function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Generic looping stick-figure animator: interpolates a named set of 2D
 * joints between keyframes and renders them as SVG circles + connecting
 * lines. Positions are written directly to DOM attributes inside the RAF
 * loop (not React state), the same "hot loop bypasses re-renders" pattern
 * used by the live pose-detection canvas — a handful of these can run at
 * once (e.g. one per assessment card) without each frame triggering React.
 *
 * `joints`/`bones`/`sequence` are expected to be stable module-level
 * constants (see src/lib/avatarPoses.js) so the effect doesn't restart on
 * every render.
 */
export default function KeyframeAvatar({
  joints,
  bones,
  sequence,
  viewBox,
  headJoint,
  accent = '#d9a441',
  boneColor = 'rgba(241, 236, 221, 0.55)',
  jointColor = '#f1ecdd',
  className = '',
  style,
}) {
  const jointRefs = useRef({});
  const boneRefs = useRef([]);

  useEffect(() => {
    let rafId;
    let start = null;
    const total = sequence.reduce((sum, kf) => sum + kf.duration, 0);

    function paint(cur, next, t) {
      for (const name of joints) {
        const [x0, y0] = cur.pose[name];
        const [x1, y1] = next.pose[name];
        const el = jointRefs.current[name];
        if (!el) continue;
        el.setAttribute('cx', String(lerp(x0, x1, t)));
        el.setAttribute('cy', String(lerp(y0, y1, t)));
      }
      bones.forEach(([a, b], idx) => {
        const el = boneRefs.current[idx];
        if (!el) return;
        const [ax0, ay0] = cur.pose[a];
        const [ax1, ay1] = next.pose[a];
        const [bx0, by0] = cur.pose[b];
        const [bx1, by1] = next.pose[b];
        el.setAttribute('x1', String(lerp(ax0, ax1, t)));
        el.setAttribute('y1', String(lerp(ay0, ay1, t)));
        el.setAttribute('x2', String(lerp(bx0, bx1, t)));
        el.setAttribute('y2', String(lerp(by0, by1, t)));
      });
    }

    function frame(ts) {
      if (start === null) start = ts;
      const elapsed = (ts - start) % total;

      let acc = 0;
      let i = 0;
      for (; i < sequence.length; i++) {
        if (elapsed < acc + sequence[i].duration) break;
        acc += sequence[i].duration;
      }
      const cur = sequence[i] ?? sequence[sequence.length - 1];
      const next = sequence[(i + 1) % sequence.length];
      const localT = ease(Math.min(1, (elapsed - acc) / cur.duration));

      paint(cur, next, localT);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [joints, bones, sequence]);

  const initial = sequence[0].pose;

  return (
    <svg viewBox={viewBox} className={className} style={style} aria-hidden="true">
      {bones.map(([a, b]) => {
        const [x1, y1] = initial[a];
        const [x2, y2] = initial[b];
        return (
          <line
            key={`${a}-${b}`}
            ref={(el) => {
              boneRefs.current[bones.findIndex(([ba, bb]) => ba === a && bb === b)] = el;
            }}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={boneColor}
            strokeWidth={5}
            strokeLinecap="round"
          />
        );
      })}
      {joints.map((name) => {
        const [x, y] = initial[name];
        return (
          <circle
            key={name}
            ref={(el) => {
              jointRefs.current[name] = el;
            }}
            cx={x}
            cy={y}
            r={name === headJoint ? 15 : 5.5}
            fill={name === headJoint ? accent : jointColor}
          />
        );
      })}
    </svg>
  );
}
