import { useEffect, useId, useRef, useState } from 'react';

export function useCountUp(target: number, ms = 1400, delay = 150) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / ms));
      const e = 1 - Math.pow(1 - p, 4);
      setV(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, delay]);
  return v;
}

export function CountUp({ value, format, ms, delay }: { value: number; format: (n: number) => string; ms?: number; delay?: number }) {
  const v = useCountUp(value, ms, delay);
  return <>{format(v)}</>;
}

type Series = { values: number[]; color: string; dashed?: boolean; area?: boolean; name: string };

export function LineChart({
  labels, series, height = 220, light = false, format = (n: number) => String(n),
}: { labels: string[]; series: Series[]; height?: number; light?: boolean; format?: (n: number) => string }) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const padL = 6, padR = 6, padT = 14, padB = 26;
  const all = series.flatMap((s) => s.values);
  const min = Math.min(...all) * 0.92, max = Math.max(...all) * 1.04;
  const x = (i: number) => padL + (i * (w - padL - padR)) / (labels.length - 1);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (height - padT - padB);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const axis = light ? 'rgba(255,255,255,.55)' : '#8a8d93';
  const grid = light ? 'rgba(255,255,255,.1)' : '#eef1f5';
  const ticks = labels.map((l, i) => ({ l, i })).filter(({ i }) => i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / (w < 420 ? 4 : 7)) === 0);

  const onMove = (e: React.PointerEvent) => {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * w;
    const i = Math.round(((px - padL) / (w - padL - padR)) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} onPointerMove={onMove} onPointerLeave={() => setHover(null)} style={{ display: 'block', touchAction: 'pan-y' }}>
        <defs>
          {series.map((s, k) => (
            <linearGradient key={k} id={`${id}g${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity={light ? 0.35 : 0.22} />
              <stop offset="1" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={padL} x2={w - padR} y1={padT + f * (height - padT - padB)} y2={padT + f * (height - padT - padB)} stroke={grid} />
        ))}
        {series.map((s, k) => (
          <g key={k}>
            {s.area && <path className="chart-area" d={`${path(s.values)} L${x(s.values.length - 1)},${height - padB} L${x(0)},${height - padB} Z`} fill={`url(#${id}g${k})`} />}
            <path className={s.dashed ? 'chart-area' : 'chart-line'} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={s.dashed ? 1.5 : 2.4} strokeDasharray={s.dashed ? '4 5' : undefined} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}
        {ticks.map(({ l, i }) => (
          <text key={i} x={x(i)} y={height - 6} fontSize="11" fill={axis} textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'} fontFamily="inherit">{l}</text>
        ))}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={height - padB} stroke={light ? 'rgba(255,255,255,.4)' : '#c7c8cd'} strokeDasharray="3 3" />
            {series.map((s, k) => <circle key={k} cx={x(hover)} cy={y(s.values[hover])} r={4.5} fill={light ? '#fff' : s.color} stroke={light ? s.color : '#fff'} strokeWidth={2} />)}
          </g>
        )}
        {hover == null && series[0] && (
          <circle cx={x(series[0].values.length - 1)} cy={y(series[0].values[series[0].values.length - 1])} r={4.5} fill={light ? '#fff' : series[0].color} className="chart-area">
            <animate attributeName="r" values="4.5;7;4.5" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
      {hover != null && (
        <div style={{
          position: 'absolute', top: 0, left: Math.min(Math.max(x(hover) - 80, 0), w - 170), width: 170, pointerEvents: 'none',
          background: light ? 'rgba(2,30,62,.88)' : '#fff', color: light ? '#fff' : '#222', border: light ? '1px solid rgba(255,255,255,.15)' : '1px solid #e4e8ee',
          borderRadius: 10, padding: '8px 11px', fontSize: 12, boxShadow: '0 8px 24px rgba(11,46,87,.18)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{labels[hover]}</div>
          {series.map((s, k) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ opacity: 0.75 }}>{s.name}</span><b>{format(s.values[hover])}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Donut({ data, size = 170, thickness = 18, center }: { data: { label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: React.ReactNode }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness - 6) / 2;
  const c = 2 * Math.PI * r;
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 120); return () => clearTimeout(t); }, []);
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f5" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle key={i} className="donut-seg" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${on ? Math.max(0, len - 2) : 0} ${c}`} strokeDashoffset={-acc}
              style={{ transition: `stroke-dasharray 1s cubic-bezier(.2,.7,.3,1) ${i * 0.12}s` }}>
              <title>{d.label}</title>
            </circle>
          );
          acc += len;
          return seg;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{center}</div>
    </div>
  );
}

export function Columns({ data, height = 180, highlight, format }: { data: { label: string; value: number }[]; height?: number; highlight?: number; format: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, paddingTop: 22 }}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 46);
        const isHi = i === (highlight ?? data.length - 1);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: isHi ? '#03509F' : '#585858', whiteSpace: 'nowrap' }}>{format(d.value)}</div>
            <div style={{
              width: '100%', maxWidth: 54, height: h, borderRadius: '8px 8px 3px 3px', transformOrigin: 'bottom',
              background: isHi ? 'linear-gradient(180deg,#57B7E8,#03509F)' : 'linear-gradient(180deg,#e4ecf5,#c7d6e8)',
              animation: `growY .9s cubic-bezier(.2,.7,.3,1) ${i * 0.08}s both`,
            }} />
            <div style={{ fontSize: 11, color: '#8a8d93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{d.label}</div>
          </div>
        );
      })}
      <style>{'@keyframes growY{from{transform:scaleY(0)}}'}</style>
    </div>
  );
}
