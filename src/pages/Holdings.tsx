import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Columns, CountUp, LineChart } from '../components/Charts';
import { Icon } from '../components/Icon';
import { useRequest } from '../components/Requests';
import { LogoTile, Page, PageHead, Reveal } from '../components/ui';
import { DOCS } from '../data/content';
import { AS_OF_LABEL, CAPITAL_CALL, ENTITIES, HOLDINGS, Holding } from '../data/portfolio';
import { holdingStats, portfolioStats } from '../lib/calc';
import { compact, date, monthYear, multiple, pct, usd } from '../lib/format';
import { useStore } from '../store';

export function Holdings() {
  const { entity, dispatch } = useStore();
  const [strat, setStrat] = useState<'All' | 'SKK Ventures' | 'SKK Real Estate'>('All');
  const [sort, setSort] = useState('value');
  const nav = useNavigate();
  const list = useMemo(() => {
    const l = HOLDINGS.filter((h) => (strat === 'All' || h.strategy === strat) && (entity === 'All entities' || h.entity === entity));
    const st = new Map(l.map((h) => [h.id, holdingStats(h)]));
    return l.sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'moic' ? st.get(b.id)!.moic - st.get(a.id)!.moic : sort === 'irr' ? (st.get(b.id)!.irr || 0) - (st.get(a.id)!.irr || 0) : b.value - a.value);
  }, [strat, entity, sort]);
  const tot = portfolioStats(list);

  return (
    <Page>
      <PageHead eyebrow={`As of ${AS_OF_LABEL}`} title="Holdings" sub={`${list.length} investments · ${usd(tot.value)} current value · ${multiple(tot.moic)} total value multiple`} />
      <Reveal i={0}>
        <div className="between wrap" style={{ marginBottom: 16 }}>
          <div className="chips">
            {(['All', 'SKK Ventures', 'SKK Real Estate'] as const).map((s) => (
              <button key={s} className={'chip' + (strat === s ? ' on' : '')} onClick={() => setStrat(s)}>{s}<span className="c">{HOLDINGS.filter((h) => s === 'All' || h.strategy === s).length}</span></button>
            ))}
          </div>
          <div className="row">
            <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: 13.5 }} value={entity} onChange={(e) => dispatch({ t: 'entity', entity: e.target.value })}>
              <option>All entities</option>{ENTITIES.map((e) => <option key={e}>{e}</option>)}
            </select>
            <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: 13.5 }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="value">Sort: Value</option><option value="moic">Sort: Multiple</option><option value="irr">Sort: IRR</option><option value="name">Sort: Name</option>
            </select>
          </div>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card flush hide-sm">
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Investment</th><th>Entity</th><th className="r">Contributed</th><th className="r">Distributions</th><th className="r">Current value</th><th className="r">Multiple</th><th className="r">IRR</th></tr></thead>
              <tbody>
                {list.map((h) => {
                  const st = holdingStats(h);
                  return (
                    <tr key={h.id} className="click" onClick={() => nav('/holdings/' + h.id)}>
                      <td><div className="row"><LogoTile h={h} /><div><div style={{ fontWeight: 600 }}>{h.name}</div><div className="muted tiny">{h.strategy} · {h.instrument}</div></div></div></td>
                      <td className="muted small">{h.entity.replace(' (Individual)', '')}</td>
                      <td className="r num">{usd(st.contributed)}</td>
                      <td className="r num">{st.distributed ? usd(st.distributed) : <span className="muted">—</span>}</td>
                      <td className="r num" style={{ fontWeight: 600 }}>{usd(h.value)}</td>
                      <td className={'r num ' + (st.moic >= 1 ? 'up' : 'down')}>{multiple(st.moic)}</td>
                      <td className={'r num ' + ((st.irr || 0) >= 0 ? '' : 'down')}>{pct(st.irr)}</td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#fafbfd' }}>
                  <td colSpan={2}><b>Total</b></td>
                  <td className="r num"><b>{usd(tot.contributed)}</b></td><td className="r num"><b>{usd(tot.distributed)}</b></td>
                  <td className="r num"><b>{usd(tot.value)}</b></td><td className="r num"><b>{multiple(tot.moic)}</b></td><td className="r num"><b>{pct(tot.irr)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <div className="show-sm stack">
        {list.map((h, i) => {
          const st = holdingStats(h);
          return (
            <Reveal key={h.id} i={i + 1}>
              <Link to={'/holdings/' + h.id} className="card hover" style={{ display: 'block', color: 'inherit', padding: 16 }}>
                <div className="row"><LogoTile h={h} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{h.name}</div><div className="muted tiny">{h.strategy} · {h.sector}</div></div><Icon name="chevron" size={18} style={{ color: 'var(--ink-3)' }} /></div>
                <div className="dl mt16" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div><div className="k">Value</div><div className="v num">{compact(h.value)}</div></div>
                  <div><div className="k">Multiple</div><div className={'v num ' + (st.moic >= 1 ? 'up' : 'down')}>{multiple(st.moic)}</div></div>
                  <div><div className="k">IRR</div><div className="v num">{pct(st.irr)}</div></div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Page>
  );
}

export function HoldingDetail() {
  const { id } = useParams();
  const h = HOLDINGS.find((x) => x.id === id);
  const [tab, setTab] = useState<'overview' | 'position' | 'docs' | 'updates'>('overview');
  const { openRequest } = useRequest();
  const { updates } = useStore();
  const nav = useNavigate();
  if (!h) return <div className="empty">Holding not found. <Link to="/holdings">Back to holdings</Link></div>;
  const st = holdingStats(h);
  const docs = DOCS.filter((d) => d.holdingId === h.id);
  const ups = updates.filter((u) => u.holdingId === h.id);
  const isVenture = h.strategy === 'SKK Ventures';

  return (
    <Page>
      <Link to="/holdings" className="row small" style={{ gap: 6, fontWeight: 600, marginBottom: 18 }}><Icon name="arrowLeft" size={16} />Holdings</Link>
      <Reveal i={0}>
        <div className="between wrap" style={{ alignItems: 'flex-start', marginBottom: 22 }}>
          <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
            <LogoTile h={h} lg />
            <div>
              <div className="row wrap" style={{ gap: 6 }}><span className="tag">{h.strategy}</span><span className="tag gray">{h.sector}</span><span className="tag gray">{h.instrument}</span></div>
              <h1 className="page mt8">{h.name}</h1>
              <div className="muted">{h.tagline}</div>
            </div>
          </div>
          <div className="row wrap">
            <button className="btn ghost" onClick={() => nav('/tearsheet/' + h.id)}><Icon name="print" />Tear sheet</button>
            <button className="btn ghost" onClick={() => openRequest({ type: 'Update request', holdingId: h.id })}><Icon name="pulse" />Request update</button>
            <button className="btn" onClick={() => openRequest({ type: 'Increase investment', holdingId: h.id })}><Icon name="arrowUp" />Increase investment</button>
          </div>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card hero" style={{ padding: '22px 24px' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 18 }}>
            <div><div className="eyebrow">Current value</div><div className="num" style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em' }}><CountUp value={h.value} format={(n) => usd(n)} /></div></div>
            <div><div className="eyebrow">Contributed</div><div className="num" style={{ fontSize: 20, marginTop: 6 }}>{usd(st.contributed)}</div></div>
            <div><div className="eyebrow">Distributions</div><div className="num" style={{ fontSize: 20, marginTop: 6 }}>{usd(st.distributed)}</div></div>
            <div><div className="eyebrow">Multiple</div><div className="num" style={{ fontSize: 20, marginTop: 6 }}>{multiple(st.moic)}</div></div>
            <div><div className="eyebrow">IRR</div><div className="num" style={{ fontSize: 20, marginTop: 6 }}>{pct(st.irr)}</div></div>
          </div>
        </div>
      </Reveal>

      {h.id === CAPITAL_CALL.holdingId && (
        <Reveal i={2}>
          <div className="card mt16 between wrap" style={{ borderLeft: '4px solid var(--sky)' }}>
            <div><span className="tag amber">Capital call {CAPITAL_CALL.number}</span><div style={{ fontWeight: 600, marginTop: 8 }}>{usd(CAPITAL_CALL.amount)} due {date(CAPITAL_CALL.due)}</div><div className="muted small">{CAPITAL_CALL.purpose}. Unfunded after this call: {usd(CAPITAL_CALL.remainingAfter)}.</div></div>
            <div className="row"><Link className="btn sm ghost" to="/documents?q=Capital%20Call%20Notice%204">Notice</Link><button className="btn sm" onClick={() => openRequest({ type: 'Schedule a call', holdingId: h.id })}>Confirm funding by phone</button></div>
          </div>
        </Reveal>
      )}

      <div className="utabs mt24">
        {([['overview', 'Tear sheet'], ['position', 'Your position'], ['docs', `Documents (${docs.length})`], ['updates', `Updates (${ups.length})`]] as const).map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && <TearSheetBody h={h} />}

      {tab === 'position' && (
        <Page>
          <div className="grid g2">
            <div className="card">
              <h3 className="card-title">Position details</h3>
              <div className="dl mt16">
                <div><div className="k">Investing entity</div><div className="v">{h.entity}</div></div>
                <div><div className="k">Vehicle</div><div className="v">{h.vehicle}</div></div>
                <div><div className="k">Security</div><div className="v">{h.instrument}</div></div>
                <div><div className="k">Ownership</div><div className="v num">{h.ownership}</div></div>
                {h.shares && <div><div className="k">Shares held</div><div className="v num">{h.shares.toLocaleString()}</div></div>}
                {h.entryPrice && <div><div className="k">Entry price</div><div className="v num">{usd(h.entryPrice, 2)}</div></div>}
                {h.currentPrice && <div><div className="k">Current mark</div><div className="v num">{usd(h.currentPrice, 2)}</div></div>}
                {h.commitment && <div><div className="k">Commitment</div><div className="v num">{usd(h.commitment)}</div></div>}
                {h.commitment && <div><div className="k">Unfunded</div><div className="v num">{usd(st.unfunded)}</div></div>}
                <div><div className="k">Cost basis</div><div className="v num">{usd(h.costBasis)}</div></div>
                <div><div className="k">Unrealized gain</div><div className={'v num ' + (st.unrealized >= 0 ? 'up' : 'down')}>{st.unrealized >= 0 ? '+' : ''}{usd(st.unrealized)}</div></div>
              </div>
            </div>
            <div className="card flush">
              <div style={{ padding: '20px 20px 6px' }}><h3 className="card-title">Cash flows</h3></div>
              <div className="table-wrap">
                <table className="tbl">
                  <thead><tr><th>Date</th><th>Type</th><th className="r">Amount</th></tr></thead>
                  <tbody>
                    {[...h.flows].reverse().map((f, i) => (
                      <tr key={i}><td className="num">{date(f.date)}</td><td>{f.kind === 'contribution' ? (h.commitment ? 'Capital call' : 'Investment') : f.kind === 'sale' ? 'Tender proceeds' : 'Distribution'}</td><td className={'r num ' + (f.amount > 0 ? 'up' : '')}>{f.amount > 0 ? '+' : ''}{usd(f.amount)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Page>
      )}

      {tab === 'docs' && (
        <Page>
          <div className="card flush">
            {docs.map((d) => (
              <Link key={d.id} to={'/documents?doc=' + d.id} className="list-row">
                <Icon name="file" size={22} style={{ color: 'var(--blue)' }} />
                <div className="grow"><div className="t">{d.title}</div><div className="m">{d.category} · {date(d.date)} · {d.pages} pages</div></div>
                {d.isNew && <span className="tag new">New</span>}
              </Link>
            ))}
            <div style={{ padding: 16, borderTop: '1px solid var(--line-2)' }}><button className="btn ghost sm" onClick={() => openRequest({ type: 'Paperwork', holdingId: h.id })}><Icon name="plus" />Request a document</button></div>
          </div>
        </Page>
      )}

      {tab === 'updates' && (
        <Page>
          <div className="card">
            {ups.length === 0 && <div className="empty">No updates yet.</div>}
            <div className="timeline">
              {ups.map((u) => <div key={u.id} className="ev"><div className="muted tiny">{date(u.date)} · {u.type}</div><div style={{ fontWeight: 600, marginTop: 2 }}>{u.title}</div><div className="muted small mt8">{u.body}</div></div>)}
            </div>
            <button className="btn ghost sm mt24" onClick={() => openRequest({ type: 'Update request', holdingId: h.id })}><Icon name="pulse" />Ask the deal team</button>
          </div>
        </Page>
      )}

      {isVenture && <div className="muted tiny mt24">Valuations reflect SKK marks based on the most recent financing or internal methodology and may differ from realizable value.</div>}
    </Page>
  );
}

export function TearSheetBody({ h, print }: { h: Holding; print?: boolean }) {
  const isVenture = h.strategy === 'SKK Ventures';
  const fmt = (n: number) => (isVenture ? '$' + n + 'M' : n.toFixed(2));
  return (
    <div className="stack">
      <div className="grid g2">
        <div className="card">
          <h2 className="sec">About</h2>
          <p style={{ fontSize: 14.5, color: 'var(--ink-2)' }}>{h.description}</p>
          <div className="dl mt16">
            <div><div className="k">{isVenture ? 'Headquarters' : 'Markets'}</div><div className="v">{h.hq}</div></div>
            <div><div className="k">{isVenture ? 'Founded' : 'Vintage'}</div><div className="v">{h.founded}</div></div>
            <div><div className="k">{h.leaderTitle}</div><div className="v">{h.leader}</div></div>
            <div><div className="k">{isVenture ? 'Employees' : 'Scale'}</div><div className="v">{h.team}</div></div>
            <div><div className="k">SKK role</div><div className="v">{h.skkRole}</div></div>
            <div><div className="k">Next event</div><div className="v">{h.nextEvent}</div></div>
          </div>
        </div>
        <div className="card">
          <h2 className="sec">{h.markUnit}</h2>
          {isVenture ? <Columns data={h.marks} format={fmt} height={print ? 170 : 210} /> : (
            <LineChart labels={h.marks.map((m) => m.label)} series={[{ name: 'NAV per unit', values: h.marks.map((m) => m.value), color: '#03509F', area: true }]} height={print ? 170 : 210} format={(n) => n.toFixed(2)} />
          )}
        </div>
      </div>
      <div className="card">
        <h2 className="sec">Key metrics</h2>
        <div className="metric-grid">
          {h.metrics.map((m) => <div key={m.label}><div className="eyebrow" style={{ fontSize: 9.5 }}>{m.label}</div><div className="v num">{m.value}</div>{m.note && <div className="muted tiny">{m.note}</div>}</div>)}
        </div>
      </div>
      <div className="grid g2">
        <div className="card"><h2 className="sec">Investment thesis</h2><ul className="bullets">{h.thesis.map((t) => <li key={t}>{t}</li>)}</ul></div>
        <div className="card"><h2 className="sec">Key risks</h2><ul className="bullets risk">{h.risks.map((t) => <li key={t}>{t}</li>)}</ul></div>
      </div>
      <div className="grid g2">
        {h.rounds ? (
          <div className="card flush">
            <div style={{ padding: '20px 20px 6px' }}><h2 className="sec">Financing history</h2></div>
            <div className="table-wrap"><table className="tbl">
              <thead><tr><th>Round</th><th>Date</th><th className="r">Raised</th><th className="r">Post money</th><th>Lead</th></tr></thead>
              <tbody>{h.rounds.map((r) => <tr key={r.round}><td><b style={{ fontWeight: 600 }}>{r.round}</b> {r.skk && <span className="tag" style={{ marginLeft: 4 }}>SKK</span>}</td><td className="num">{monthYear(r.date)}</td><td className="r num">{compact(r.raised)}</td><td className="r num">{compact(r.post)}</td><td className="muted small" style={{ whiteSpace: 'normal', minWidth: 120 }}>{r.lead}</td></tr>)}</tbody>
            </table></div>
          </div>
        ) : (
          <div className="card flush">
            <div style={{ padding: '20px 20px 6px' }}><h2 className="sec">Distribution history</h2></div>
            <div className="table-wrap"><table className="tbl">
              <thead><tr><th>Date</th><th className="r">Your distribution</th></tr></thead>
              <tbody>{h.flows.filter((f) => f.amount > 0).reverse().slice(0, 6).map((f) => <tr key={f.date}><td className="num">{date(f.date)}</td><td className="r num up">+{usd(f.amount)}</td></tr>)}</tbody>
            </table></div>
          </div>
        )}
        <div className="card"><h2 className="sec">Recent milestones</h2><div className="timeline">{h.milestones.map((m) => <div key={m.text} className="ev"><div className="muted tiny">{date(m.date)}</div><div style={{ fontSize: 14 }}>{m.text}</div></div>)}</div></div>
      </div>
    </div>
  );
}
