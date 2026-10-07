import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mosaic } from '../components/Brand';
import { Icon } from '../components/Icon';
import { useRequest } from '../components/Requests';
import { LogoTile, Page, PageHead, Reveal } from '../components/ui';
import { CAPITAL_CALL, ENTITIES, HOLDINGS, INVESTOR, OPPORTUNITIES, TEAM } from '../data/portfolio';
import { holdingStats, ledger, portfolioStats, TOTAL } from '../lib/calc';
import { date, multiple, pct, usd } from '../lib/format';
import { useStore } from '../store';

export function Activity() {
  const [kind, setKind] = useState<'All' | 'Contributions' | 'Distributions'>('All');
  const rows = ledger().filter((r) => kind === 'All' || (kind === 'Contributions' ? r.amount < 0 : r.amount > 0));
  const funds = HOLDINGS.filter((h) => h.commitment);
  const years = [...new Set(ledger().map((r) => r.date.slice(0, 4)))].sort();
  const byYear = years.map((y) => ({ y, c: -ledger().filter((r) => r.date.startsWith(y) && r.amount < 0).reduce((s, r) => s + r.amount, 0), d: ledger().filter((r) => r.date.startsWith(y) && r.amount > 0).reduce((s, r) => s + r.amount, 0) }));
  const maxY = Math.max(...byYear.flatMap((b) => [b.c, b.d]));
  return (
    <Page>
      <PageHead eyebrow="Cash in and cash out" title="Capital activity" sub="Every contribution, capital call and distribution across your entities." />
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {[['Contributed', usd(TOTAL.contributed)], ['Distributions received', usd(TOTAL.distributed)], ['Net cash invested', usd(TOTAL.contributed - TOTAL.distributed)], ['Unfunded commitments', usd(TOTAL.unfunded)]].map(([k, v], i) => (
          <Reveal key={k} i={i}><div className="card kpi"><div className="eyebrow">{k}</div><div className="v num">{v}</div></div></Reveal>
        ))}
      </div>

      <div className="grid g-main mt16">
        <Reveal i={4}>
          <div className="card" style={{ height: '100%' }}>
            <div className="between"><h3 className="card-title">Cash flows by year</h3><div className="row tiny muted" style={{ gap: 14 }}><span className="row" style={{ gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: '#03509F' }} />Contributed</span><span className="row" style={{ gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: '#57B7E8' }} />Distributed</span></div></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 200, marginTop: 20 }}>
              {byYear.map((b, i) => (
                <div key={b.y} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160 }}>
                    {[[b.c, '#03509F'], [b.d, '#57B7E8']].map(([v, c], j) => (
                      <div key={j} title={usd(v as number)} style={{ width: 18, height: Math.max(3, ((v as number) / maxY) * 160), background: c as string, borderRadius: '5px 5px 2px 2px', transformOrigin: 'bottom', animation: `growY .9s cubic-bezier(.2,.7,.3,1) ${i * 0.08 + j * 0.05}s both` }} />
                    ))}
                  </div>
                  <div className="tiny muted num">{b.y}</div>
                </div>
              ))}
            </div>
            <style>{'@keyframes growY{from{transform:scaleY(0)}}'}</style>
          </div>
        </Reveal>
        <Reveal i={5}>
          <div className="card" style={{ height: '100%', borderTop: '3px solid var(--sky)' }}>
            <span className="tag amber">Upcoming</span>
            <h3 className="card-title mt12">Capital call {CAPITAL_CALL.number} · Harbor Point</h3>
            <div className="num" style={{ fontSize: 30, fontWeight: 300, color: 'var(--blue)', marginTop: 6 }}>{usd(CAPITAL_CALL.amount)}</div>
            <div className="muted small">Due {date(CAPITAL_CALL.due)} · Ellery Family Trust</div>
            <div className="card mt16" style={{ background: 'var(--sky-soft)', border: 0, boxShadow: 'none', padding: 12, fontSize: 13 }}>
              <div className="row" style={{ alignItems: 'flex-start' }}><Icon name="shield" size={17} style={{ color: 'var(--blue)', flexShrink: 0 }} />Funding instructions are confirmed by phone with your relationship team. SKK never changes wire instructions by email.</div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal i={6}>
        <h2 className="sec mt32">Commitments</h2>
        <div className="card flush"><div className="table-wrap"><table className="tbl">
          <thead><tr><th>Fund</th><th className="r">Commitment</th><th className="r">Called</th><th>Progress</th><th className="r">Unfunded</th></tr></thead>
          <tbody>{funds.map((h) => { const st = holdingStats(h); return (
            <tr key={h.id}><td><div className="row"><LogoTile h={h} /><b style={{ fontWeight: 600 }}>{h.name}</b></div></td><td className="r num">{usd(h.commitment!)}</td><td className="r num">{usd(st.contributed)}</td><td style={{ minWidth: 140 }}><div className="bar"><i style={{ width: `${(st.contributed / h.commitment!) * 100}%` }} /></div><div className="tiny muted mt8">{pct(st.contributed / h.commitment!, 0)} called</div></td><td className="r num">{usd(st.unfunded)}</td></tr>
          ); })}</tbody>
        </table></div></div>
      </Reveal>

      <Reveal i={7}>
        <div className="between wrap mt32" style={{ marginBottom: 12 }}>
          <h2 className="sec" style={{ margin: 0 }}>Transaction ledger</h2>
          <div className="chips">{(['All', 'Contributions', 'Distributions'] as const).map((k) => <button key={k} className={'chip' + (kind === k ? ' on' : '')} onClick={() => setKind(k)}>{k}</button>)}</div>
        </div>
        <div className="card flush"><div className="table-wrap"><table className="tbl">
          <thead><tr><th>Date</th><th>Investment</th><th>Type</th><th>Entity</th><th className="r">Amount</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}><td className="num">{date(r.date)}</td><td><Link to={'/holdings/' + r.holding.id} style={{ fontWeight: 600 }}>{r.holding.name}</Link></td><td>{r.amount < 0 ? (r.holding.commitment ? 'Capital call' : 'Investment') : r.kind === 'sale' ? 'Tender proceeds' : 'Distribution'}</td><td className="muted small">{r.holding.entity.replace(' (Individual)', '')}</td><td className={'r num ' + (r.amount > 0 ? 'up' : '')} style={{ fontWeight: 600 }}>{r.amount > 0 ? '+' : ''}{usd(r.amount)}</td></tr>
          ))}</tbody>
        </table></div></div>
      </Reveal>
    </Page>
  );
}

export function Opportunities() {
  const { openRequest } = useRequest();
  return (
    <Page>
      <PageHead eyebrow="For existing SKK investors" title="Opportunities" sub="Pro rata allocations, follow on rounds and new funds offered to you first." />
      <div className="grid g2">
        {OPPORTUNITIES.map((o, i) => {
          const h = HOLDINGS.find((x) => x.id === o.holdingId)!;
          return (
            <Reveal key={o.id} i={i}>
              <div className="card flush hover" style={{ height: '100%' }}>
                <div style={{ position: 'relative', background: 'linear-gradient(135deg,#023a75,#03509F)', color: '#fff', padding: 22, overflow: 'hidden' }}>
                  <Mosaic className="mosaic-bg" cols={14} rows={5} cell={40} seed={30 + i} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }} />
                  <div style={{ position: 'relative' }}>
                    <span className="tag" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{o.strategy}</span>
                    <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: '-0.02em', marginTop: 12 }}>{o.title}</div>
                    <div style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>{o.summary}</div>
                  </div>
                </div>
                <div style={{ padding: 22 }}>
                  <div className="dl">{o.terms.map(([k, v]) => <div key={k}><div className="k">{k}</div><div className="v num">{v}</div></div>)}</div>
                  <div className="row mt24 wrap">
                    <button className="btn" onClick={() => openRequest({ type: 'Increase investment', opportunityId: o.id })}><Icon name="arrowUp" />Indicate interest</button>
                    <Link className="btn ghost" to={'/holdings/' + h.id}>View {h.name.split(' ')[0]}</Link>
                    <button className="btn ghost" onClick={() => openRequest({ type: 'Schedule a call', holdingId: h.id })}><Icon name="calendar" />Discuss</button>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <div className="muted tiny mt24">Offered only to accredited investors through definitive offering documents. Indicating interest is not a commitment to invest. Demo content.</div>
    </Page>
  );
}

const TYPES = ['All', 'Firm', 'Company', 'Valuation', 'Distribution', 'Capital call', 'Tax', 'Opportunity'] as const;

export function Updates() {
  const { updates, readUpdates, dispatch } = useStore();
  const [type, setType] = useState<(typeof TYPES)[number]>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const list = updates.filter((u) => type === 'All' || u.type === type);
  return (
    <Page>
      <PageHead eyebrow="From SKK and your companies" title="Updates" sub={`${updates.filter((u) => !readUpdates.includes(u.id)).length} unread`}
        actions={<button className="btn ghost" onClick={() => updates.forEach((u) => dispatch({ t: 'readUpdate', id: u.id }))}><Icon name="check" />Mark all read</button>} />
      <div className="chips" style={{ marginBottom: 16 }}>{TYPES.map((t) => <button key={t} className={'chip' + (type === t ? ' on' : '')} onClick={() => setType(t)}>{t}</button>)}</div>
      <div className="stack">
        {list.map((u, i) => {
          const h = HOLDINGS.find((x) => x.id === u.holdingId);
          const unread = !readUpdates.includes(u.id);
          const open = openId === u.id || i === 0;
          return (
            <Reveal key={u.id} i={i}>
              <button className="card hover" style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: unread ? '3px solid var(--sky)' : undefined }}
                onClick={() => { setOpenId(open && openId === u.id ? null : u.id); dispatch({ t: 'readUpdate', id: u.id }); }}>
                {h ? <LogoTile h={h} /> : <div className="logo-tile" style={{ background: 'var(--sky-soft)', color: 'var(--blue)' }}><Icon name="megaphone" size={18} /></div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row wrap" style={{ gap: 8 }}><span className={'tag ' + (u.type === 'Capital call' ? 'amber' : u.type === 'Distribution' ? 'green' : u.type === 'Firm' ? 'gray' : '')}>{u.type}</span><span className="muted tiny">{date(u.date)} · {u.author}</span></div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 6, color: 'var(--ink)' }}>{u.title}</div>
                  {open ? <div className="mt8" style={{ color: 'var(--ink-2)', fontSize: 14.5 }}>{u.body}</div> : <div className="muted small mt8" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.body}</div>}
                  {open && h && <Link to={'/holdings/' + h.id} className="small mt12" style={{ display: 'inline-flex', gap: 4, fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>Open {h.name} <Icon name="chevron" size={14} /></Link>}
                </div>
                {unread && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--sky)', flexShrink: 0, marginTop: 6 }} />}
              </button>
            </Reveal>
          );
        })}
      </div>
    </Page>
  );
}

export function Profile() {
  const { toast, dispatch } = useStore();
  const { openRequest } = useRequest();
  return (
    <Page>
      <PageHead eyebrow={`${INVESTOR.tier} since ${INVESTOR.since}`} title={`${INVESTOR.first} ${INVESTOR.last}`} sub={INVESTOR.email} />
      <div className="grid g2">
        <Reveal i={0}>
          <div className="card">
            <h3 className="card-title">Investing entities</h3>
            {ENTITIES.map((e) => { const st = portfolioStats(HOLDINGS.filter((h) => h.entity === e)); return (
              <div key={e} className="between" style={{ padding: '14px 0', borderTop: '1px solid var(--line-2)' }}>
                <div><div style={{ fontWeight: 600 }}>{e}</div><div className="muted tiny num">{st.count} holdings · {multiple(st.moic)}</div></div>
                <b className="num">{usd(st.value)}</b>
              </div>
            ); })}
            <button className="btn ghost sm mt12" onClick={() => openRequest({ type: 'Account change' })}><Icon name="plus" />Add or change an entity</button>
          </div>
        </Reveal>
        <Reveal i={1}>
          <div className="card">
            <h3 className="card-title">Delegates</h3>
            <div className="muted small">People who can view documents on your behalf.</div>
            {[['Morgan & Pryce CPAs', 'Read only · Tax documents · Ellery Family Trust'], ['Hannah Ellery', 'Read only · All entities']].map(([n, r]) => (
              <div key={n} className="row" style={{ padding: '14px 0', borderTop: '1px solid var(--line-2)', marginTop: 12 }}><div className="avatar alt">{n.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{n}</div><div className="muted tiny">{r}</div></div></div>
            ))}
            <button className="btn ghost sm mt12" onClick={() => openRequest({ type: 'Account change' })}><Icon name="plus" />Add a delegate</button>
          </div>
        </Reveal>
        <Reveal i={2}>
          <div className="card">
            <h3 className="card-title">Notifications</h3>
            {['New documents', 'Capital calls and distributions', 'Company updates', 'Messages from my team'].map((n) => (
              <label key={n} className="between" style={{ padding: '12px 0', borderTop: '1px solid var(--line-2)', cursor: 'pointer' }}>
                <span>{n}</span><input type="checkbox" defaultChecked onChange={() => toast('Preference saved')} style={{ width: 18, height: 18, accentColor: '#03509F' }} />
              </label>
            ))}
          </div>
        </Reveal>
        <Reveal i={3}>
          <div className="card">
            <h3 className="card-title">Security</h3>
            {[['Two factor authentication', 'On · authenticator app'], ['Last sign in', 'Today · Boston, MA'], ['Wire instruction changes', 'Phone verification required']].map(([k, v]) => (
              <div key={k} className="between" style={{ padding: '12px 0', borderTop: '1px solid var(--line-2)' }}><span>{k}</span><span className="muted small">{v}</span></div>
            ))}
            <div className="row mt16 wrap">
              <button className="btn ghost sm" onClick={() => { dispatch({ t: 'reset' }); toast('Demo data reset', 'info'); }}><Icon name="refresh" />Reset demo data</button>
            </div>
            <div className="muted tiny mt12">Relationship lead: {TEAM[0].name}, {TEAM[0].phone}</div>
          </div>
        </Reveal>
      </div>
    </Page>
  );
}
