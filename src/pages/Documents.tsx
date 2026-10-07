import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useRequest } from '../components/Requests';
import { Modal, ModalHead, Page, PageHead, Reveal, SyncBadge } from '../components/ui';
import { DOCS, Doc, DocCategory } from '../data/content';
import { AS_OF_LABEL, ENTITIES, HOLDINGS, INVESTOR } from '../data/portfolio';
import { holdingStats } from '../lib/calc';
import { date, monthYear, multiple, usd } from '../lib/format';
import { useStore } from '../store';

const CATS: ('All' | DocCategory)[] = ['All', 'Statements', 'Tax', 'Reports', 'Notices', 'Legal'];
const ICON: Record<DocCategory, string> = { Statements: 'flow', Tax: 'layers', Reports: 'news', Notices: 'bell', Legal: 'shield' };

export function Documents() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState<'All' | DocCategory>('All');
  const { entity, dispatch, toast } = useStore();
  const { openRequest } = useRequest();
  const open = DOCS.find((d) => d.id === params.get('doc')) || null;

  useEffect(() => { const pq = params.get('q'); if (pq) setQ(pq); }, [params]);

  const list = useMemo(() => DOCS.filter((d) =>
    (cat === 'All' || d.category === cat) &&
    (entity === 'All entities' || !d.entity || d.entity === entity) &&
    (!q || (d.title + d.summary).toLowerCase().includes(q.toLowerCase()))), [cat, entity, q]);

  const groups = useMemo(() => {
    const m = new Map<string, Doc[]>();
    list.forEach((d) => { const k = monthYear(d.date); m.set(k, [...(m.get(k) || []), d]); });
    return [...m.entries()];
  }, [list]);

  const setOpen = (d: Doc | null) => {
    const p = new URLSearchParams(params);
    if (d) p.set('doc', d.id); else p.delete('doc');
    setParams(p, { replace: true });
  };

  return (
    <Page>
      <PageHead eyebrow="Document vault" title="Documents" sub={<>{`${DOCS.length} documents across 3 entities · encrypted and available any time`} <SyncBadge /></>}
        actions={<button className="btn" onClick={() => openRequest({ type: 'Paperwork' })}><Icon name="plus" />Request a document</button>} />
      <Reveal i={0}>
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div className="row wrap" style={{ gap: 10 }}>
            <div className="row" style={{ flex: 1, minWidth: 220, border: '1px solid var(--line)', borderRadius: 10, padding: '0 12px' }}>
              <Icon name="search" size={18} style={{ color: 'var(--ink-3)' }} />
              <input className="input" style={{ border: 0, boxShadow: 'none', padding: '10px 4px' }} placeholder="Search documents" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setQ('')}><Icon name="x" size={16} /></button>}
            </div>
            <select className="input" style={{ width: 'auto' }} value={entity} onChange={(e) => dispatch({ t: 'entity', entity: e.target.value })}>
              <option>All entities</option>{ENTITIES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div className="chips mt12">
            {CATS.map((c) => <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}<span className="c">{DOCS.filter((d) => c === 'All' || d.category === c).length}</span></button>)}
          </div>
        </div>
      </Reveal>

      {groups.length === 0 && <div className="card empty">No documents match. Try another search, or request it from your team.</div>}
      {groups.map(([month, docs], gi) => (
        <Reveal key={month} i={gi + 1}>
          <h2 className="sec mt24">{month}</h2>
          <div className="card flush">
            {docs.map((d) => (
              <button key={d.id} className="list-row" onClick={() => setOpen(d)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--sky-soft)', color: 'var(--blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={ICON[d.category]} size={19} /></div>
                <div className="grow"><div className="t">{d.title}</div><div className="m">{d.category} · {date(d.date)} · {d.pages} {d.pages === 1 ? 'page' : 'pages'}{d.entity ? ' · ' + d.entity : ''}</div></div>
                {d.isNew && <span className="tag new">New</span>}
                <Icon name="chevron" size={16} style={{ color: 'var(--ink-3)' }} />
              </button>
            ))}
          </div>
        </Reveal>
      ))}

      <Modal open={!!open} onClose={() => setOpen(null)} wide>
        {open && (
          <>
            <ModalHead icon={ICON[open.category]} title={open.title} sub={`${open.category} · ${date(open.date)} · ${open.size}`} onClose={() => setOpen(null)} />
            <div className="modal-body" style={{ background: 'var(--bg)', margin: '18px 0 0', padding: '22px' }}>
              <DocPaper d={open} />
            </div>
            <div className="modal-foot" style={{ paddingTop: 16, flexWrap: 'wrap' }}>
              <button className="btn ghost" onClick={() => toast('Shared with Morgan & Pryce CPAs (read only)')}><Icon name="users" />Share with my CPA</button>
              <button className="btn ghost" onClick={() => openRequest({ type: 'Tax question' })}><Icon name="chat" />Ask about this</button>
              <button className="btn" onClick={() => toast(`Downloading ${open.title}.pdf (demo)`)}><Icon name="download" />Download PDF</button>
            </div>
          </>
        )}
      </Modal>
    </Page>
  );
}

function DocPaper({ d }: { d: Doc }) {
  const h = HOLDINGS.find((x) => x.id === d.holdingId);
  const seed = Number(d.id.replace(/\D/g, '')) || 1;
  return (
    <div className="paper">
      <div className="lh">
        <div><div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--blue)' }}>SKK</div><div style={{ fontSize: 8.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#585858' }}>Shepherd Kaplan Krochuk</div></div>
        <div style={{ textAlign: 'right', fontSize: 10.5, color: '#8a8d93' }}>{date(d.date)}<br />{d.entity || `${INVESTOR.first} ${INVESTOR.last}`}</div>
      </div>
      <div style={{ fontSize: 17, color: 'var(--blue)', fontWeight: 400, letterSpacing: '-0.01em' }}>{d.title}</div>
      <div className="muted" style={{ marginTop: 6 }}>{d.summary}</div>

      {d.category === 'Statements' && (
        <table className="tbl" style={{ marginTop: 18, fontSize: 11.5 }}>
          <thead><tr><th>Investment</th><th className="r">Contributed</th><th className="r">Distributions</th><th className="r">Value</th><th className="r">Multiple</th></tr></thead>
          <tbody>{HOLDINGS.map((x) => { const st = holdingStats(x); return <tr key={x.id}><td>{x.name}</td><td className="r num">{usd(st.contributed)}</td><td className="r num">{usd(st.distributed)}</td><td className="r num">{usd(x.value)}</td><td className="r num">{multiple(st.moic)}</td></tr>; })}</tbody>
        </table>
      )}
      {d.category === 'Tax' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 18 }}>
          {[['Part III Box 1 · Ordinary business income', -1200 + seed * 731], ['Box 5 · Interest income', 300 + seed * 97], ['Box 9a · Net long term capital gain', seed * 1450], ['Box 13 · Other deductions', -(400 + seed * 113)], ['Box 19 · Distributions', h ? holdingStats(h).distributed : 0], ['Box 21 · Foreign taxes paid', 0]].map(([k, v]) => (
            <div key={k as string} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px' }}><div style={{ fontSize: 9.5, color: '#8a8d93' }}>{k}</div><div className="num" style={{ fontWeight: 600 }}>{usd(v as number)}</div></div>
          ))}
        </div>
      )}
      {d.category === 'Notices' && h && (
        <div style={{ marginTop: 18, lineHeight: 1.7, fontSize: 12.5 }}>
          <p>Dear Limited Partner,</p>
          <p className="mt8">This notice relates to your interest in {h.vehicle} held by {h.entity}. Please review the amount and date below. Funding instructions will be confirmed by your relationship team by phone; SKK will never change wire instructions by email.</p>
          <div className="card mt16" style={{ boxShadow: 'none', padding: 14, display: 'flex', justifyContent: 'space-between' }}><span>{d.title.replace(h.name, '').trim()}</span><b className="num">{d.summary.match(/\$[\d,]+/)?.[0]}</b></div>
        </div>
      )}
      {(d.category === 'Reports' || d.category === 'Legal' || (d.category === 'Notices' && !h)) && (
        <div style={{ marginTop: 18 }}>
          {Array.from({ length: 14 }).map((_, i) => <div key={i} className="line" style={{ width: `${70 + ((i * 37 + seed) % 30)}%` }} />)}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 16, left: 30, right: 30, borderTop: '1px solid var(--line)', paddingTop: 8, fontSize: 9.5, color: '#8a8d93', display: 'flex', justifyContent: 'space-between' }}>
        <span>Page 1 of {d.pages} · Valuations as of {AS_OF_LABEL}</span><span>Demo document</span>
      </div>
    </div>
  );
}
