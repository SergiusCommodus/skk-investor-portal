import { AnimatePresence, motion } from '../motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart } from '../components/Charts';
import { Icon } from '../components/Icon';
import { LogoTile, Page, PageHead, Reveal, StatusTag } from '../components/ui';
import { CALL_TRACKER, FIRM_INVESTORS, REQ_STEPS, Update } from '../data/content';
import { HOLDINGS } from '../data/portfolio';
import { TOTAL } from '../lib/calc';
import { compact, relTime, usd } from '../lib/format';
import { useStore } from '../store';

const ENGAGE = [41, 44, 47, 52, 49, 58, 63, 61, 72, 79, 84, 96];
const WEEKS = ['Jul 20', 'Jul 27', 'Aug 3', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14', 'Sep 21', 'Sep 28', 'Oct 5'];

export function FirmOverview() {
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  const { requests } = useStore();
  const open = requests.filter((r) => r.status !== 'Completed');
  const paid = CALL_TRACKER.filter((c) => c.paid).reduce((s, c) => s + c.amount, 0);
  const due = CALL_TRACKER.reduce((s, c) => s + c.amount, 0);
  return (
    <Page>
      <PageHead eyebrow="SKK team view" title="Firm overview" sub="What your investors see, need and ask for, in one place." />
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[['Investors on portal', '142', '+18 this quarter'], ['Alternatives NAV', '$486M', 'Ventures and Real Estate'], ['Open requests', String(open.length), `${requests.filter((r) => r.status === 'Submitted').length} new`], ['Unfunded commitments', '$61.8M', 'Across 4 funds'], ['Avg response time', '3.4 hrs', 'Target under 4']].map(([k, v, s], i) => (
          <Reveal key={k} i={i}><div className="card kpi"><div className="eyebrow">{k}</div><div className="v num">{v}</div><div className="s">{s}</div></div></Reveal>
        ))}
      </div>
      <div className="grid g-main mt16">
        <Reveal i={5}>
          <div className="card" style={{ height: '100%' }}>
            <div className="between"><h3 className="card-title">Weekly active investors</h3><span className="tag green">+134% since launch</span></div>
            <div className="muted small">Investors who signed in at least once that week</div>
            <div className="mt16"><LineChart labels={WEEKS} series={[{ name: 'Active investors', values: ENGAGE, color: '#03509F', area: true }]} height={wide ? 300 : 220} /></div>
          </div>
        </Reveal>
        <Reveal i={6}>
          <div className="card" style={{ height: '100%' }}>
            <h3 className="card-title">Harbor Point call 4</h3>
            <div className="num" style={{ fontSize: 30, fontWeight: 300, color: 'var(--blue)', marginTop: 8 }}>{usd(paid)} <span className="muted" style={{ fontSize: 15 }}>of {usd(due)}</span></div>
            <div className="bar mt12" style={{ height: 10 }}><i style={{ width: `${(paid / due) * 100}%` }} /></div>
            <div className="muted small mt8">{CALL_TRACKER.filter((c) => c.paid).length} of {CALL_TRACKER.length} investors funded · due Oct 31</div>
            <Link to="/firm/calls" className="btn ghost sm mt16">Open tracker</Link>
            <h3 className="card-title mt24">Most viewed this week</h3>
            {[['Q3 2026 Investor Letter', 118], ['Lumora AI Tear Sheet', 74], ['Harbor Point Capital Call Notice 4', 61]].map(([t, n]) => (
              <div key={t as string} className="between small" style={{ padding: '8px 0', borderTop: '1px solid var(--line-2)' }}><span>{t}</span><b className="num">{n}</b></div>
            ))}
          </div>
        </Reveal>
      </div>
      <Reveal i={7}>
        <div className="card flush mt16">
          <div className="card-head" style={{ padding: '18px 20px 0' }}><h3 className="card-title">Request inbox</h3><Link className="link" to="/firm/requests">Open inbox <Icon name="chevron" size={14} /></Link></div>
          <div className="mt8">
            {open.slice(0, 5).map((r) => (
              <Link key={r.id} to="/firm/requests" className="list-row">
                <div className="avatar">JE</div>
                <div className="grow"><div className="t">{r.title}</div><div className="m">{r.id} · {r.type} · {relTime(r.created)}</div></div>
                <StatusTag s={r.status} />
              </Link>
            ))}
            {open.length === 0 && <div className="empty">Inbox zero.</div>}
          </div>
        </div>
      </Reveal>
    </Page>
  );
}

export function FirmRequests() {
  const { requests, dispatch, toast } = useStore();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'Open' | 'All'>('Open');
  const list = requests.filter((r) => filter === 'All' || r.status !== 'Completed');
  return (
    <Page>
      <PageHead eyebrow="SKK team view" title="Request inbox" sub="Advance a request and the investor is notified instantly. Try submitting one from the investor view, then work it here." />
      <div className="chips" style={{ marginBottom: 16 }}>{(['Open', 'All'] as const).map((f) => <button key={f} className={'chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>{f}</button>)}</div>
      <div className="stack">
        <AnimatePresence initial={false}>
          {list.map((r) => {
            const idx = REQ_STEPS.indexOf(r.status as (typeof REQ_STEPS)[number]);
            const next = r.status === 'Completed' ? null : REQ_STEPS[Math.min(REQ_STEPS.length - 1, (idx < 0 ? 1 : idx) + 1)];
            const h = HOLDINGS.find((x) => x.id === r.holdingId);
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card">
                <div className="between wrap" style={{ alignItems: 'flex-start' }}>
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    {h ? <LogoTile h={h} /> : <div className="avatar">JE</div>}
                    <div>
                      <div className="row wrap" style={{ gap: 8 }}><b className="tiny num">{r.id}</b><span className="tag gray">{r.type}</span><StatusTag s={r.status} /></div>
                      <div style={{ fontWeight: 600, fontSize: 16, marginTop: 6 }}>{r.title}</div>
                      <div className="muted small">Jonathan Ellery{r.entity ? ' · ' + r.entity : ''} · {relTime(r.created)}{r.amount ? ' · ' + usd(r.amount) : ''}</div>
                      {r.detail && <div className="small mt8" style={{ color: 'var(--ink-2)' }}>“{r.detail}”</div>}
                    </div>
                  </div>
                  <div className="small muted">Owner: <b style={{ color: 'var(--ink)' }}>{r.owner}</b></div>
                </div>
                {next && (
                  <div className="row wrap mt16" style={{ gap: 8 }}>
                    <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Note to investor (optional)" value={notes[r.id] || ''} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} />
                    <button className="btn" onClick={() => { dispatch({ t: 'advance', id: r.id, note: notes[r.id] }); setNotes((n) => ({ ...n, [r.id]: '' })); toast(`${r.id} moved to ${next}. Investor notified.`); }}>
                      <Icon name="arrowRight" />Move to {next}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Page>
  );
}

export function FirmInvestors() {
  const rows = FIRM_INVESTORS.map((r) => (r.name === 'Jonathan Ellery' ? { ...r, value: TOTAL.value } : r));
  return (
    <Page>
      <PageHead eyebrow="SKK team view" title="Investors" sub="142 investors · showing 8 sample relationships" />
      <Reveal i={0}>
        <div className="card flush"><div className="table-wrap"><table className="tbl">
          <thead><tr><th>Investor</th><th className="r">Entities</th><th className="r">Holdings</th><th className="r">Current value</th><th className="r">Since</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.name}><td><div className="row"><div className="avatar">{r.name.replace(/[^A-Z]/g, '').slice(0, 2)}</div><b style={{ fontWeight: 600 }}>{r.name}</b></div></td><td className="r num">{r.entities}</td><td className="r num">{r.holdings}</td><td className="r num">{compact(r.value)}</td><td className="r num">{r.since}</td><td><span className={'tag ' + (r.status === 'Active' ? 'green' : 'amber')}>{r.status}</span></td></tr>
          ))}</tbody>
        </table></div></div>
      </Reveal>
    </Page>
  );
}

export function FirmCalls() {
  const { toast } = useStore();
  const [rows, setRows] = useState(CALL_TRACKER);
  const paid = rows.filter((c) => c.paid).reduce((s, c) => s + c.amount, 0);
  const due = rows.reduce((s, c) => s + c.amount, 0);
  return (
    <Page>
      <PageHead eyebrow="SKK team view" title="Capital calls" sub="Harbor Point Industrial Fund · Call 4 · due October 31, 2026" />
      <Reveal i={0}>
        <div className="card">
          <div className="between wrap"><div className="num" style={{ fontSize: 34, fontWeight: 300, color: 'var(--blue)' }}>{usd(paid)} <span className="muted" style={{ fontSize: 16 }}>received of {usd(due)}</span></div>
            <button className="btn" onClick={() => toast(`Reminders sent to ${rows.filter((r) => !r.paid).length} investors`)}><Icon name="bell" />Remind unpaid</button></div>
          <div className="bar mt12" style={{ height: 12 }}><i style={{ width: `${(paid / due) * 100}%`, transition: 'width .6s' }} /></div>
        </div>
      </Reveal>
      <Reveal i={1}>
        <div className="card flush mt16"><div className="table-wrap"><table className="tbl">
          <thead><tr><th>Investor</th><th className="r">Amount</th><th>Status</th><th className="r">Action</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.name}><td><b style={{ fontWeight: 600 }}>{r.name}</b></td><td className="r num">{usd(r.amount)}</td><td><span className={'tag ' + (r.paid ? 'green' : 'amber')}>{r.paid ? 'Received' : 'Pending'}</span></td>
              <td className="r">{!r.paid && <button className="btn ghost sm" onClick={() => { setRows((x) => x.map((y, j) => (j === i ? { ...y, paid: true } : y))); toast(`Marked ${r.name} as received`); }}>Mark received</button>}</td></tr>
          ))}</tbody>
        </table></div></div>
      </Reveal>
    </Page>
  );
}

export function FirmPublish() {
  const { dispatch, toast, updates } = useStore();
  const [f, setF] = useState<{ holdingId: string; type: Update['type']; title: string; body: string }>({ holdingId: 'lumora', type: 'Company', title: '', body: '' });
  const h = HOLDINGS.find((x) => x.id === f.holdingId);
  const publish = () => {
    dispatch({ t: 'publish', update: { holdingId: f.holdingId || undefined, type: f.type, title: f.title, body: f.body, author: h ? h.strategy : 'SKK Investor Services' } });
    toast(`Published to ${h ? 'every investor in ' + h.name : 'all investors'}`);
    setF((x) => ({ ...x, title: '', body: '' }));
  };
  return (
    <Page>
      <PageHead eyebrow="SKK team view" title="Publish an update" sub="Write once. It lands on every relevant investor's timeline with a notification, instead of 100 separate emails." />
      <div className="grid g2">
        <Reveal i={0}>
          <div className="card">
            <div className="field"><label>Investment</label><select className="input" value={f.holdingId} onChange={(e) => setF({ ...f, holdingId: e.target.value })}><option value="">Firm wide (all investors)</option>{HOLDINGS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div className="field"><label>Type</label><div className="chips">{(['Company', 'Valuation', 'Distribution', 'Firm'] as const).map((t) => <button key={t} className={'chip' + (f.type === t ? ' on' : '')} onClick={() => setF({ ...f, type: t })}>{t}</button>)}</div></div>
            <div className="field"><label>Headline</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Lumora signs its largest health system to date" /></div>
            <div className="field"><label>Update</label><textarea className="input" rows={6} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="What happened and what it means for investors" /></div>
            <div className="row"><button className="btn" disabled={!f.title.trim()} onClick={publish}><Icon name="megaphone" />Publish</button><span className="muted small">{h ? `${h.name}: 31 investors` : 'All 142 investors'}</span></div>
          </div>
        </Reveal>
        <Reveal i={1}>
          <h2 className="sec">Investor preview</h2>
          <div className="card" style={{ display: 'flex', gap: 14 }}>
            {h ? <LogoTile h={h} /> : <div className="logo-tile" style={{ background: 'var(--sky-soft)', color: 'var(--blue)' }}><Icon name="megaphone" size={18} /></div>}
            <div style={{ minWidth: 0 }}><span className="tag">{f.type}</span><div style={{ fontWeight: 600, fontSize: 16, marginTop: 6 }}>{f.title || 'Your headline'}</div><div className="muted small mt8">{f.body || 'Your update text will appear here.'}</div></div>
          </div>
          <h2 className="sec mt24">Recently published</h2>
          <div className="card flush">{updates.slice(0, 4).map((u) => <div key={u.id} className="list-row"><div className="grow"><div className="t">{u.title}</div><div className="m">{u.type} · {u.date}</div></div></div>)}</div>
        </Reveal>
      </div>
    </Page>
  );
}
