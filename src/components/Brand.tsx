import { useEffect, useMemo, useRef, useState } from 'react';
import { BRAND } from '../brand';

/** Text wordmark. Swaps to the official logo when BRAND.logoUrl is set. */
export function Wordmark({ size = 'md', light = false, sub = true }: { size?: 'sm' | 'md' | 'lg'; light?: boolean; sub?: boolean }) {
  const s = { sm: [18, 8], md: [24, 9.5], lg: [44, 12] }[size];
  const c = light ? '#fff' : BRAND.colors.blue;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'lg' ? 18 : 12 }}>
      {BRAND.logoUrl ? (
        <img src={BRAND.logoUrl} alt={BRAND.firm} style={{ height: s[0] * 1.5 }} />
      ) : (
        <span style={{ fontSize: s[0], fontWeight: 600, letterSpacing: '0.14em', color: c, lineHeight: 1 }}>{BRAND.short}</span>
      )}
      {sub && (
        <>
          <span style={{ width: 1, alignSelf: 'stretch', background: light ? 'rgba(255,255,255,.35)' : BRAND.colors.mist }} />
          <span style={{ lineHeight: 1.35 }}>
            <span style={{ display: 'block', whiteSpace: 'nowrap', fontSize: s[1], letterSpacing: size === 'sm' ? '0.12em' : '0.2em', textTransform: 'uppercase', fontWeight: 600, color: light ? 'rgba(255,255,255,.85)' : '#585858' }}>{BRAND.firm}</span>
            <span style={{ display: 'block', whiteSpace: 'nowrap', fontSize: s[1], letterSpacing: size === 'sm' ? '0.12em' : '0.2em', textTransform: 'uppercase', fontWeight: 500, color: light ? 'rgba(255,255,255,.6)' : BRAND.colors.slate }}>{BRAND.product}</span>
          </span>
        </>
      )}
    </div>
  );
}

const PALETTE = ['#03509F', '#57B7E8', '#C7C8CD', '#80848A', '#FFFFFF'];
const WEIGHTS = [0.17, 0.17, 0.2, 0.08, 0.38];

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
function pick(r: number, palette = PALETTE, weights = WEIGHTS) {
  let acc = 0;
  for (let i = 0; i < palette.length; i++) { acc += weights[i]; if (r <= acc) return palette[i]; }
  return palette[palette.length - 1];
}

/** Geometric triangle mosaic in SKK brand colors, optionally animated. */
export function Mosaic({
  cols = 24, rows = 14, cell = 40, seed = 7, animate = true, intro = false, origin = [0.5, 0.5], className, style, weights,
}: {
  cols?: number; rows?: number; cell?: number; seed?: number; animate?: boolean; intro?: boolean;
  origin?: [number, number]; className?: string; style?: React.CSSProperties; weights?: number[];
}) {
  const tris = useMemo(() => {
    const r = rng(seed);
    const out: { pts: string; d: number }[] = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const X = x * cell, Y = y * cell, flip = (x + y) % 2 === 0;
      const a = flip ? `${X},${Y} ${X + cell},${Y} ${X + cell},${Y + cell}` : `${X},${Y} ${X + cell},${Y} ${X},${Y + cell}`;
      const b = flip ? `${X},${Y} ${X},${Y + cell} ${X + cell},${Y + cell}` : `${X + cell},${Y} ${X + cell},${Y + cell} ${X},${Y + cell}`;
      const dist = Math.hypot(x / cols - origin[0], y / rows - origin[1]);
      out.push({ pts: a, d: dist + r() * 0.12 }, { pts: b, d: dist + r() * 0.12 });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, rows, cell, seed, origin[0], origin[1]]);

  const [colors, setColors] = useState(() => {
    const r = rng(seed * 3 + 1);
    return tris.map(() => pick(r(), PALETTE, weights));
  });

  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!animate) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    // Only shimmer while on screen and the tab is visible; saves CPU and battery on phones.
    let visible = true;
    const io = typeof IntersectionObserver !== 'undefined' && ref.current
      ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 })
      : null;
    if (io && ref.current) io.observe(ref.current);
    const id = setInterval(() => {
      if (!visible || document.visibilityState === 'hidden') return;
      setColors((prev) => {
        const next = prev.slice();
        const n = Math.max(3, Math.floor(prev.length * 0.04));
        for (let i = 0; i < n; i++) next[Math.floor(Math.random() * next.length)] = pick(Math.random(), PALETTE, weights);
        return next;
      });
    }, 900);
    return () => { clearInterval(id); io?.disconnect(); };
  }, [animate, weights]);

  return (
    <svg ref={ref} className={'mosaic ' + (className || '')} style={style} viewBox={`0 0 ${cols * cell} ${rows * cell}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {tris.map((t, i) => (
        <polygon
          key={i}
          points={t.pts}
          fill={colors[i]}
          style={intro ? { transformBox: 'fill-box', transformOrigin: 'center', animation: `tri-in .55s cubic-bezier(.2,.8,.3,1.2) ${(t.d * 1.1).toFixed(3)}s both` } : undefined}
        />
      ))}
    </svg>
  );
}
