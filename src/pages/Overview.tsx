import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mosaic } from '../components/Brand';
import { CountUp, Donut, LineChart } from '../components/Charts';
import { Icon } from '../components/Icon';
import { REQ_TYPES, useRequest } from '../components/Requests';
import { LogoTile, Page, Reveal, SyncBadge } from '../components/ui';
import { AS_OF_LABEL, CAPITAL_CALL, ENTITIES, HOLDINGS, INVESTOR, NAV_HISTORY, OPPORTUNITIES, TEAM } from '../data/portfolio';
import { bySector, holdingStats, portfolioStats, QTR_CHANGE, QTR_PCT, TOTAL } from '../lib/calc';
import { compact, date, multiple, pct, relTime, usd } from '../lib/format';
import { useStore } from '../store';

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const SECTOR_COLORS = ['#03509F', '#57B7E8', '#2E86C1', '#80848A', '#C7C8CD', '#0B3D73', '#9fd3f0', '#5b6b80', '#dfe3e8'];

export function Overview() {
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  const [range, setRange] = useState<'1Y' | '3Y' | 'All'>('3Y');
  const { openRequest } = useRequest();
  const { updates, readUpdates } = useStore();
  const nav = useNavigate();
  const pts = range === '1Y' ? NAV_HISTORY.slice(-5) : range === '3Y' ? NAV_HISTORY.slice(-13) : NAV_HISTORY;
  const hp = HOLDINGS.find((h) => h.id === CAPITAL_CALL.holdingId)!;
  const hpStats = holdingStats(hp);
  const days = Math.max(0, Math.ceil((new Date(CAPITAL_CALL.due + 'T17:00:00').getTime() - Date.now()) / 86400000));
  const top = [...HOLDINGS].sort((a, b) => b.value - a.value).slice(0, 6);
  const strat = [
    { label: 'SKK Ventures', value: HOLDINGS.filter((h) => h.strategy === 'SKK Ventures').reduce((s, h) => s + h.value, 0), color: '#03509F' },
    { label: 'SKK Real Estate', value: HOLDINGS.filter((h) => h.strategy === 'SKK Real Estate').reduce((s, h) => s + h.value, 0), color: '#57B7E8' },
  ];
  const sectors = bySector();

  const kpis = [
    { k: 'Contributed', v: usd(TOTAL.contributed), s: 'Since 2022' },
    { k: 'Distributions', v: usd(TOTAL.distributed), s: 'Cash returned' },
    { k: 'Unrealized gain', v: '+' + usd(TOTAL.unrealized), s: pct(TOTAL.unrealized / (TOTAL.value - TOTAL.unrealized), 1, true) + ' on cost', up: true },
    { k: 'Net IRR', v: pct(TOTAL.irr), s: 'Since inception' },
    { k: 'Total value multiple', v: multiple(TOTAL.moic), s: 'Value plus distributions' },
    { k: 'Unfunded', v: usd(TOTAL.unfunded), s: 'Remaining commitments' },
  ];

  return (
    <Page>
      <Reveal i={0}>
        <div className="between wrap" style={{ marginBottom: 22, alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow row wrap" style={{ marginBottom: 8, gap: 10 }}>Valuations as of {AS_OF_LABEL}<SyncBadge /></div>
            <h1 className="page">{greet()}, {INVESTOR.first}</h1>
          </div>
          <div className="row">
            <button className="btn ghost" onClick={() => nav('/messages')}><Icon name="chat" />Message team</button>
            <button className="btn" onClick={() => nav('/requests')}><Icon name="concierge" />New request</button>
          </div>
        </div>
      </Reveal>

      <div className="grid g-main">
        <Reveal i={1}>
          <div className="card hero" style={{ height: '100%' }}>
            <Mosaic className="mosaic-bg" cols={20} rows={8} cell={40} seed={5} weights={[0.22, 0.25, 0.08, 0.05, 0.4]} />
            <div className="between wrap" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="eyebrow">Total portfolio value</div>
                <div className="hero-value num"><CountUp value={TOTAL.value} format={(n) => usd(n)} /></div>
                <div className="row wrap" style={{ gap: 8 }}>
                  <span className="pill green"><Icon name="arrowUp" size={13} />{usd(QTR_CHANGE)} ({pct(QTR_PCT, 1, true)}) this quarter</span>
                  <span className="pill">{TOTAL.count} investments · 3 entities</span>
                </div>
              </div>
              <div className="seg" style={{ background: 'rgba(255,255,255,.12)', width: 168 }}>
                {(['1Y', '3Y', 'All'] as const).map((r) => (
                  <button key={r} onClick={() => setRange(r)} style={range === r ? { background: '#fff', color: '#03509F' } : { color: 'rgba(255,255,255,.8)' }}>{r}</button>
                ))}
              </div>
            </div>
            <div className="mt16" key={range}>
              <LineChart light height={wide ? 330 : 210} labels={pts.map((p) => p.q)} format={(n) => compact(n)}
                series={[{ name: 'Value', values: pts.map((p) => p.value), color: '#ffffff', area: true }, { name: 'Invested', values: pts.map((p) => p.invested), color: '#57B7E8', dashed: true }]} />
            </div>
            <div className="row tiny" style={{ gap: 16, color: 'rgba(255,255,255,.7)' }}>
              <span className="row" style={{ gap: 6 }}><i style={{ width: 14, height: 2, background: '#fff', display: 'inline-block' }} />Portfolio value</span>
              <span className="row" style={{ gap: 6 }}><i style={{ width: 14, height: 0, borderTop: '2px dashed #57B7E8', display: 'inline-block' }} />Capital invested</span>
            </div>
          </div>
        </Reveal>

        <div className="stack">
          <Reveal i={2}>
            <div className="card" style={{ borderTop: '3px solid var(--sky)' }}>
              <div className="between"><span className="tag amber">Action required</span><span className="muted tiny">{days} days left</span></div>
              <h3 className="card-title mt12">Harbor Point capital call {CAPITAL_CALL.number}</h3>
              <div className="between mt8"><span className="muted small">Due {date(CAPITAL_CALL.due)}</span><b className="num" style={{ fontSize: 20 }}>{usd(CAPITAL_CALL.amount)}</b></div>
              <div className="muted small mt8">{CAPITAL_CALL.purpose}.</div>
              <div className="mt16">
                <div className="between tiny muted"><span>Commitment called</span><span className="num">{usd(hpStats.contributed + CAPITAL_CALL.amount)} of {usd(hp.commitment!)}</span></div>
                <div className="bar mt8"><i style={{ width: `${((hpStats.contributed + CAPITAL_CALL.amount) / hp.commitment!) * 100}%` }} /></div>
              </div>
              <div className="row mt16" style={{ gap: 8 }}>
                <Link to="/holdings/harborpoint" className="btn sm" style={{ flex: 1 }}>View details</Link>
                <button className="btn sm ghost" style={{ flex: 1 }} onClick={() => openRequest({ type: 'Schedule a call', holdingId: 'harborpoint' })}>Talk it through</button>
              </div>
            </div>
          </Reveal>
          <Reveal i={3}>
            <div className="card">
              <div className="card-head"><h2 className="sec" style={{ margin: 0 }}>Open opportunities</h2><Link className="link" to="/opportunities">View all <Icon name="chevron" size={14} /></Link></div>
              {OPPORTUNITIES.map((o) => (
                <div key={o.id} className="between" style={{ padding: '10px 0', borderTop: '1px solid var(--line-2)' }}>
                  <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{o.title}</div><div className="muted tiny">Closes {date(o.deadline)}</div></div>
                  <button className="btn sm ghost" onClick={() => openRequest({ type: 'Increase investment', opportunityId: o.id })}>Indicate</button>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="kpis mt16">
        {kpis.map((k, i) => (
          <Reveal key={k.k} i={4 + i}>
            <div className="card kpi"><div className="eyebrow">{k.k}</div><div className={'v num' + (k.up ? ' up' : '')}>{k.v}</div><div className="s">{k.s}</div></div>
          </Reveal>
        ))}
      </div>

      <div className="grid g-main mt16">
        <Reveal i={10}>
          <div className="card flush">
            <div className="card-head" style={{ padding: '18px 20px 0' }}><h3 className="card-title">Largest holdings</h3><Link className="link" to="/holdings">All {HOLDINGS.length} holdings <Icon name="chevron" size={14} /></Link></div>
            <div className="mt8">
              {top.map((h) => {
                const st = holdingStats(h);
                return (
                  <Link key={h.id} to={'/holdings/' + h.id} className="list-row">
                    <LogoTile h={h} />
                    <div className="grow"><div className="t">{h.name}</div><div className="m">{h.strategy} · {h.sector}</div></div>
                    <div className="r"><div className="num" style={{ fontWeight: 600 }}>{usd(h.value)}</div><div className={'tiny num ' + (st.moic >= 1 ? 'up' : 'down')}>{multiple(st.moic)}</div></div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Reveal>
        <Reveal i={11}>
          <div className="card" style={{ height: '100%' }}>
            <h3 className="card-title">Allocation</h3>
            <div className="row mt16" style={{ gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <Donut data={strat} size={150} center={<div><div className="eyebrow" style={{ fontSize: 9 }}>Total</div><div className="num" style={{ fontSize: 18, fontWeight: 500, color: 'var(--blue)' }}>{compact(TOTAL.value)}</div></div>} />
              <div style={{ flex: 1, minWidth: 140 }}>
                {strat.map((s) => (
                  <div key={s.label} style={{ marginBottom: 12 }}>
                    <div className="row small" style={{ gap: 8 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} /><b style={{ fontWeight: 600 }}>{s.label}</b></div>
                    <div className="muted small num" style={{ paddingLeft: 18 }}>{usd(s.value)} · {pct(s.value / TOTAL.value, 0)}</div>
                  </div>
                ))}
              </div>
            </div>
            <h2 className="sec mt24">By sector</h2>
            {sectors.slice(0, 6).map((s, i) => (
              <div key={s.label} style={{ marginBottom: 10 }}>
                <div className="between small"><span>{s.label}</span><span className="muted num">{pct(s.value / TOTAL.value, 0)}</span></div>
                <div className="bar mt8" style={{ height: 6 }}><i style={{ width: `${(s.value / sectors[0].value) * 100}%`, background: SECTOR_COLORS[i], animationDelay: `${i * 0.08}s` }} /></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="grid g-main mt16">
        <Reveal i={12}>
          <div className="card flush">
            <div className="card-head" style={{ padding: '18px 20px 0' }}><h3 className="card-title">Latest updates</h3><Link className="link" to="/updates">See all <Icon name="chevron" size={14} /></Link></div>
            <div className="mt8">
              {updates.slice(0, 5).map((u) => {
                const h = HOLDINGS.find((x) => x.id === u.holdingId);
                return (
                  <Link key={u.id} to="/updates" className="list-row">
                    {h ? <LogoTile h={h} /> : <div className="logo-tile" style={{ background: 'var(--sky-soft)', color: 'var(--blue)' }}><Icon name="megaphone" size={18} /></div>}
                    <div className="grow"><div className="t">{u.title}</div><div className="m">{u.type} · {relTime(u.date + 'T12:00:00')}</div></div>
                    {!readUpdates.includes(u.id) && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sky)' }} />}
                  </Link>
                );
              })}
            </div>
          </div>
        </Reveal>
        <Reveal i={13}>
          <div className="card" style={{ height: '100%' }}>
            <h3 className="card-title">Your SKK team</h3>
            <div className="muted small">White glove service, one message away.</div>
            {TEAM.map((t) => (
              <div key={t.name} className="row mt16"><div className="avatar">{t.initials}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div><div className="muted tiny">{t.role}</div></div><a className="icon-btn" href="#/messages" aria-label="Message"><Icon name="chat" size={18} /></a></div>
            ))}
            <h2 className="sec mt24">Quick requests</h2>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {REQ_TYPES.slice(0, 4).map((r) => (
                <button key={r.type} className="btn ghost sm" style={{ justifyContent: 'flex-start' }} onClick={() => openRequest({ type: r.type })}><Icon name={r.icon} />{r.title.replace('Request a company update', 'Company update').replace('Request paperwork', 'Paperwork').replace('Increase an investment', 'Invest more')}</button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal i={14}>
        <div className="card mt16">
          <h3 className="card-title">By entity</h3>
          <div className="grid g3 mt16">
            {ENTITIES.map((e) => {
              const st = portfolioStats(HOLDINGS.filter((h) => h.entity === e));
              return (
                <Link key={e} to="/holdings" className="card hover" style={{ boxShadow: 'none', color: 'inherit' }}>
                  <div className="eyebrow">{e.includes('Trust') ? 'Trust' : e.includes('LLC') ? 'LLC' : 'Individual'}</div>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{e}</div>
                  <div className="num mt8" style={{ fontSize: 22, color: 'var(--blue)', fontWeight: 400 }}>{usd(st.value)}</div>
                  <div className="muted tiny num">{st.count} holdings · {multiple(st.moic)} · IRR {pct(st.irr)}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>
    </Page>
  );
}
