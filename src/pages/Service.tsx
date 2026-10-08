import { AnimatePresence, motion } from '../motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mosaic } from '../components/Brand';
import { Icon } from '../components/Icon';
import { REQ_TYPES, useRequest } from '../components/Requests';
import { Page, PageHead, Reveal, StatusTag } from '../components/ui';
import { DOCS, REQ_STEPS } from '../data/content';
import { CAPITAL_CALL, ENTITIES, HOLDINGS, TEAM } from '../data/portfolio';
import { holdingStats, portfolioStats, QTR_CHANGE, QTR_PCT, TOTAL } from '../lib/calc';
import { date, multiple, pct, relTime, usd } from '../lib/format';
import { useStore } from '../store';

/* ───────────── Messages ───────────── */
export function Messages() {
  const { threads, typing, dispatch, sendAndReply } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
  const active = threads.find((t) => t.id === (sel ?? (wide ? threads[0]?.id : null)));

  useEffect(() => { if (active?.unread) dispatch({ t: 'readThread', id: active.id }); }, [active, dispatch]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [active?.messages.length, typing]);

  const send = () => {
    if (!text.trim()) return;
    if (composing) {
      sendAndReply(null, text.trim(), subject.trim() || 'New message');
      setComposing(false);
      setTimeout(() => setSel(null), 0);
      setSubject('');
    } else if (active) sendAndReply(active.id, text.trim());
    setText('');
  };
  // After composing a new thread, focus the newest thread
  useEffect(() => { if (!composing && sel === null && wide) setSel(threads[0]?.id ?? null); }, [threads.length]); // eslint-disable-line

  const showList = wide || (!active && !composing);
  const showThread = wide || !!active || composing;

  return (
    <Page>
      <PageHead eyebrow="Secure messaging" title="Messages" sub="Your team replies within one business day, usually much sooner."
        actions={<button className="btn" onClick={() => { setComposing(true); setSel(null); }}><Icon name="plus" />New message</button>} />
      <div className="card flush" style={{ display: 'grid', gridTemplateColumns: wide ? '320px 1fr' : '1fr', minHeight: 560 }}>
        {showList && (
          <div style={{ borderRight: wide ? '1px solid var(--line)' : 0 }}>
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <button key={t.id} className="list-row" style={{ background: active?.id === t.id && wide ? 'var(--sky-soft)' : undefined, alignItems: 'flex-start' }} onClick={() => { setSel(t.id); setComposing(false); }}>
                  <div className="avatar">{t.with.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                  <div className="grow">
                    <div className="between"><div className="t" style={{ fontWeight: t.unread ? 700 : 600 }}>{t.subject}</div>{t.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sky)', flexShrink: 0 }} />}</div>
                    <div className="m">{last.author}: {last.text}</div>
                    <div className="tiny muted mt8">{relTime(last.at)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {showThread && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 560, background: '#fafbfd' }}>
            <div className="row" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', background: '#fff' }}>
              {!wide && <button className="icon-btn" onClick={() => { setSel(null); setComposing(false); }}><Icon name="arrowLeft" /></button>}
              {composing ? (
                <input className="input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus />
              ) : active ? (
                <><div className="avatar">{active.with.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div><div><div style={{ fontWeight: 600 }}>{active.subject}</div><div className="muted tiny">with {active.with} · SKK</div></div></>
              ) : null}
            </div>
            <div className="chat" style={{ flex: 1, padding: 18, overflowY: 'auto', maxHeight: 520 }}>
              {composing && <div className="empty">Start a conversation with {TEAM[0].name} and the team.</div>}
              {!composing && active?.messages.map((m) => (
                <motion.div key={m.id} className={'bubble ' + (m.from === 'investor' ? 'me' : 'them')} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                  {m.from === 'skk' && <div className="who">{m.author}</div>}
                  {m.text}
                  {m.attachment && <Link to={'/documents?q=' + encodeURIComponent(m.attachment)} className="row tiny" style={{ marginTop: 8, gap: 6, padding: '8px 10px', borderRadius: 8, background: 'var(--sky-soft)', fontWeight: 600 }}><Icon name="clip" size={14} />{m.attachment}</Link>}
                  <div className="tiny" style={{ opacity: 0.55, marginTop: 4, textAlign: 'right' }}>{relTime(m.at)}</div>
                </motion.div>
              ))}
              <AnimatePresence>{typing && !composing && <motion.div className="bubble them typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><i /><i /><i /></motion.div>}</AnimatePresence>
              <div ref={endRef} />
            </div>
            <div className="row" style={{ padding: 14, borderTop: '1px solid var(--line)', background: '#fff' }}>
              <textarea className="input" rows={1} style={{ minHeight: 46, resize: 'none' }} placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <button className="btn" onClick={send} disabled={!text.trim()} aria-label="Send"><Icon name="send" /></button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

/* ───────────── Concierge (requests) ───────────── */
export function Requests() {
  const { requests } = useStore();
  const { openRequest } = useRequest();
  const [tab, setTab] = useState<'open' | 'done'>('open');
  const [openLog, setOpenLog] = useState<string | null>(null);
  const list = requests.filter((r) => (tab === 'open' ? r.status !== 'Completed' : r.status === 'Completed'));
  return (
    <Page>
      <Reveal i={0}>
        <div className="card hero" style={{ padding: '28px 26px' }}>
          <Mosaic className="mosaic-bg" cols={20} rows={6} cell={40} seed={44} weights={[0.2, 0.28, 0.08, 0.04, 0.4]} />
          <div className="eyebrow">Concierge</div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '8px 0 0', maxWidth: 620 }}>White glove service. Ask once and your team handles the rest.</h1>
          <div className="row wrap mt16" style={{ gap: 10 }}>
            <span className="pill"><Icon name="check" size={14} />Typical response under 4 hours</span>
            <span className="pill"><Icon name="users" size={14} />Dedicated team of three</span>
          </div>
        </div>
      </Reveal>

      <h2 className="sec mt32">How can we help?</h2>
      <div className="grid g3">
        {REQ_TYPES.map((r, i) => (
          <Reveal key={r.type} i={i + 1}>
            <button className="card hover" style={{ width: '100%', height: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => openRequest({ type: r.type })}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sky-soft)', color: 'var(--blue)', display: 'grid', placeItems: 'center' }}><Icon name={r.icon} size={22} /></div>
              <div style={{ fontWeight: 600, fontSize: 16, marginTop: 14, color: 'var(--ink)' }}>{r.title}</div>
              <div className="muted small mt8">{r.blurb}</div>
            </button>
          </Reveal>
        ))}
      </div>

      <div className="utabs mt32">
        <button className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>Open ({requests.filter((r) => r.status !== 'Completed').length})</button>
        <button className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>Completed ({requests.filter((r) => r.status === 'Completed').length})</button>
      </div>
      {list.length === 0 && <div className="card empty">Nothing here yet.</div>}
      <div className="stack">
        <AnimatePresence initial={false}>
          {list.map((r) => {
            const idx = REQ_STEPS.indexOf(r.status as (typeof REQ_STEPS)[number]);
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card">
                <div className="between wrap" style={{ alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="row wrap" style={{ gap: 8 }}><span className="muted tiny num" style={{ fontWeight: 700 }}>{r.id}</span><span className="tag gray">{r.type}</span><StatusTag s={r.status} /></div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginTop: 8 }}>{r.title}</div>
                    {r.detail && <div className="muted small mt8">{r.detail}</div>}
                  </div>
                  <div className="small muted" style={{ textAlign: 'right' }}>Owner<br /><b style={{ color: 'var(--ink)' }}>{r.owner}</b></div>
                </div>
                <div className="stepper">
                  {REQ_STEPS.map((s, i) => <div key={s} className={'step' + (i < idx || r.status === 'Completed' ? ' done' : i === idx ? ' cur' : '')}><i />{s}</div>)}
                </div>
                <button className="btn ghost sm mt12" onClick={() => setOpenLog(openLog === r.id ? null : r.id)}>{openLog === r.id ? 'Hide activity' : `Activity (${r.log.length})`}</button>
                <AnimatePresence>
                  {openLog === r.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div className="timeline mt16">{[...r.log].reverse().map((l, i) => <div key={i} className="ev"><div className="muted tiny">{relTime(l.at)}</div><div className="small">{l.text}</div></div>)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Page>
  );
}

/* ───────────── Ask SKK ───────────── */
type Answer = { text: string; links?: { label: string; to: string }[] };

function answer(qRaw: string): Answer {
  const q = qRaw.toLowerCase();
  const h = HOLDINGS.find((x) => q.includes(x.name.toLowerCase()) || q.includes(x.name.split(' ')[0].toLowerCase()));
  if (h && !q.includes('k1')) {
    const st = holdingStats(h);
    const share = h.value / TOTAL.value;
    return {
      text: `Your ${h.name} position (${h.entity}) is valued at ${usd(h.value)}, ${pct(share)} of your portfolio. You've contributed ${usd(st.contributed)}${st.distributed ? ` and received ${usd(st.distributed)}` : ''}, a ${multiple(st.moic)} multiple and ${pct(st.irr)} IRR.` +
        (h.entryPrice ? ` You entered in the ${h.instrument.replace(' Preferred', '')} at ${usd(h.entryPrice, 2)} per share; the current mark is ${usd(h.currentPrice!, 2)}.` : '') + ` Next: ${h.nextEvent}.`,
      links: [{ label: `${h.name} tear sheet`, to: '/holdings/' + h.id }],
    };
  }
  if (/k-?1|tax/.test(q)) {
    const k = DOCS.filter((d) => d.title.startsWith('2025 Schedule K1'));
    return { text: `You have ${k.length} Schedule K1s for tax year 2025, all posted March 13, 2026: ${k.map((d) => d.title.split('· ')[1]).join('; ')}. Your CPA, Morgan & Pryce, already has read only access to the trust's tax documents.`, links: [{ label: 'Open tax documents', to: '/documents?q=2025%20Schedule%20K1' }] };
  }
  if (/capital call|unfunded|owe|due/.test(q)) {
    return { text: `One capital call is open: Harbor Point Industrial Fund call ${CAPITAL_CALL.number} for ${usd(CAPITAL_CALL.amount)}, due ${date(CAPITAL_CALL.due)}, from the Ellery Family Trust. Across all funds your unfunded commitments total ${usd(TOTAL.unfunded)}, and ${usd(CAPITAL_CALL.remainingAfter)} will remain at Harbor Point after this call.`, links: [{ label: 'Capital activity', to: '/activity' }] };
  }
  if (/distribut|income|cash back|paid/.test(q)) {
    const d = HOLDINGS.map((x) => ({ x, d: holdingStats(x).distributed })).filter((r) => r.d > 0).sort((a, b) => b.d - a.d);
    return { text: `You've received ${usd(TOTAL.distributed)} in total: ${d.map((r) => `${usd(r.d)} from ${r.x.name}`).join(', ')}. The most recent was ${usd(22000)} from Coastal Multifamily SPV II on September 18, 2026.`, links: [{ label: 'Transaction ledger', to: '/activity' }] };
  }
  if (/quarter|change|this q|recent/.test(q)) {
    return { text: `Your portfolio rose ${usd(QTR_CHANGE)} (${pct(QTR_PCT, 1, true)}) in Q3 2026. The biggest driver was Lumora AI's Series C at $342M, which lifted your position by roughly $340,000 from the prior $260M mark. Brightwater added about $34,000 after its 3PL partnership, and you received a $22,000 distribution from Coastal.`, links: [{ label: 'Q3 investor letter', to: '/documents?q=Q3%202026%20Investor%20Letter' }] };
  }
  if (/irr|return|perform|best|worst|multiple/.test(q)) {
    const s = HOLDINGS.map((x) => ({ x, s: holdingStats(x) })).sort((a, b) => b.s.moic - a.s.moic);
    return { text: `Since 2022 your portfolio has a ${pct(TOTAL.irr)} net IRR and a ${multiple(TOTAL.moic)} total value multiple. Best performer: ${s[0].x.name} at ${multiple(s[0].s.moic)}. Weakest: ${s[s.length - 1].x.name} at ${multiple(s[s.length - 1].s.moic)}, marked down in March after a trial protocol amendment.`, links: [{ label: 'All holdings', to: '/holdings' }] };
  }
  if (/entit|trust|llc|individual/.test(q)) {
    return { text: ENTITIES.map((e) => { const st = portfolioStats(HOLDINGS.filter((x) => x.entity === e)); return `${e}: ${usd(st.value)} across ${st.count} holdings`; }).join('. ') + '.', links: [{ label: 'Profile and entities', to: '/profile' }] };
  }
  if (/invest|contribut|put in|how much/.test(q)) {
    const v = portfolioStats(HOLDINGS.filter((x) => x.strategy === 'SKK Ventures'));
    const r = portfolioStats(HOLDINGS.filter((x) => x.strategy === 'SKK Real Estate'));
    return { text: `You've contributed ${usd(TOTAL.contributed)} with SKK: ${usd(v.contributed)} across ${v.count} SKK Ventures companies and ${usd(r.contributed)} across ${r.count} SKK Real Estate investments. Today that capital is worth ${usd(TOTAL.value)} plus ${usd(TOTAL.distributed)} already distributed.`, links: [{ label: 'Overview', to: '/' }] };
  }
  if (/real estate|property|propert/.test(q)) {
    const r = portfolioStats(HOLDINGS.filter((x) => x.strategy === 'SKK Real Estate'));
    return { text: `Your SKK Real Estate investments are worth ${usd(r.value)} with ${usd(r.distributed)} distributed to date, a ${multiple(r.moic)} multiple and ${pct(r.irr)} IRR.`, links: [{ label: 'Holdings', to: '/holdings' }] };
  }
  return { text: `I can answer questions about your holdings, performance, distributions, capital calls, entities and documents. For anything else, I'll pass it straight to ${TEAM[0].name}.`, links: [{ label: 'Message your team', to: '/messages' }] };
}

const SUGGEST = ['How much have I invested with SKK?', 'What is my exposure to Lumora AI?', 'What changed this quarter?', 'How much have I received in distributions?', 'Show me my 2025 K1s', 'Do I have any capital calls due?', "What's my IRR?"];

export function Ask() {
  const [chat, setChat] = useState<{ q: string; a: Answer }[]>([]);
  const [q, setQ] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [chat.length, thinking]);
  const ask = (text: string) => {
    if (!text.trim() || thinking) return;
    setQ(''); setThinking(true);
    setTimeout(() => { setChat((c) => [...c, { q: text, a: answer(text) }]); setThinking(false); }, 900);
  };
  const pending = useMemo(() => thinking, [thinking]);
  return (
    <Page>
      <PageHead eyebrow="Answers from your actual records" title="Ask SKK" sub="Ask anything about your portfolio. Answers are drawn from your statements, holdings and documents." />
      <div className="card" style={{ minHeight: 420, display: 'flex', flexDirection: 'column' }}>
        {chat.length === 0 && !pending && (
          <div style={{ textAlign: 'center', padding: '30px 10px 10px' }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, margin: '0 auto', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#03509F,#57B7E8)', color: '#fff' }}><Icon name="spark" size={28} /></div>
            <div style={{ fontSize: 22, fontWeight: 300, color: 'var(--blue)', marginTop: 16 }}>What would you like to know?</div>
          </div>
        )}
        <div className="chat" style={{ flex: 1 }}>
          {chat.map((c, i) => (
            <div key={i} className="chat">
              <div className="bubble me">{c.q}</div>
              <TypedAnswer a={c.a} animate={i === chat.length - 1} />
            </div>
          ))}
          {pending && <div className="bubble them typing"><i /><i /><i /></div>}
          <div ref={endRef} />
        </div>
        <div className="chips mt16">{SUGGEST.map((s) => <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>)}</div>
        <form className="row mt16" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
          <input className="input" placeholder="Ask about a holding, distribution, K1…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn" disabled={!q.trim()}><Icon name="send" /></button>
        </form>
      </div>
      <div className="muted tiny mt12">Demo assistant with prepared answers. In production it would answer only from the firm's records for your accounts.</div>
    </Page>
  );
}

function TypedAnswer({ a, animate }: { a: Answer; animate: boolean }) {
  const [n, setN] = useState(animate ? 0 : a.text.length);
  useEffect(() => {
    if (!animate) return;
    let i = 0;
    const id = setInterval(() => { i += 3; setN(Math.min(a.text.length, i)); if (i >= a.text.length) clearInterval(id); }, 14);
    return () => clearInterval(id);
  }, [a, animate]);
  return (
    <div className="bubble them">
      <div className="who row" style={{ gap: 5 }}><Icon name="spark" size={13} />Ask SKK</div>
      {a.text.slice(0, n)}
      {n >= a.text.length && a.links && (
        <motion.div className="row wrap mt8" style={{ gap: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {a.links.map((l) => <Link key={l.to} to={l.to} className="tag" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12 }}><Icon name="arrowRight" size={12} />{l.label}</Link>)}
        </motion.div>
      )}
    </div>
  );
}
