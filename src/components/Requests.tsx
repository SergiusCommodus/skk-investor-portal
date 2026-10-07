import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTITIES, HOLDINGS, OPPORTUNITIES, TEAM } from '../data/portfolio';
import { useStore } from '../store';
import { usd } from '../lib/format';
import { Icon } from './Icon';
import { Modal, ModalHead, Success } from './ui';

export type ReqType = 'Increase investment' | 'Paperwork' | 'Update request' | 'Schedule a call' | 'Tax question' | 'Account change';

export const REQ_TYPES: { type: ReqType; icon: string; title: string; blurb: string }[] = [
  { type: 'Increase investment', icon: 'arrowUp', title: 'Increase an investment', blurb: 'Add to a position, take a pro rata allocation or commit to a new fund. We prepare the subscription documents.' },
  { type: 'Paperwork', icon: 'file', title: 'Request paperwork', blurb: 'Subscription documents, statements, ownership letters, K1 reissues and transfer forms.' },
  { type: 'Update request', icon: 'pulse', title: 'Request a company update', blurb: 'Ask the deal team about performance, valuation, fundraising or exit plans for any holding.' },
  { type: 'Schedule a call', icon: 'calendar', title: 'Schedule a call', blurb: 'Book time with your relationship lead, the deal team or tax and reporting.' },
  { type: 'Tax question', icon: 'layers', title: 'Tax and K1 help', blurb: 'Estimates, K1 timing, state filings and anything your CPA needs from us.' },
  { type: 'Account change', icon: 'user', title: 'Account changes', blurb: 'Contact details, delegates for your CPA or attorney, beneficiaries and distribution preferences.' },
];

type Opts = { type: ReqType; holdingId?: string; opportunityId?: string };
const Ctx = createContext<{ openRequest: (o: Opts) => void } | null>(null);
export const useRequest = () => useContext(Ctx)!;

const PAPERWORK = ['Subscription documents for an additional investment', 'Custom capital account statement', 'Proof of ownership letter (for a lender)', 'K1 reissue or corrected K1', 'Accredited investor verification letter', 'Transfer or assignment forms', 'Beneficiary designation form', 'Audited financial statements'];
const TOPICS = ['Performance', 'Valuation', 'Fundraising', 'Exit outlook', 'Board meeting notes', 'Other'];
const CHANGES = ['Contact information', 'Mailing address', 'Add a delegate (CPA, attorney, advisor)', 'Beneficiary designation', 'Distribution preference (pay out or reinvest)'];

function slots() {
  const out: string[] = [];
  const d = new Date();
  while (out.length < 4) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    ['9:30 AM', '1:00 PM', '4:00 PM'].forEach((t) => out.push(`${day} · ${t}`));
  }
  return out.slice(0, 9);
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const { dispatch, requests } = useStore();
  const nav = useNavigate();
  const [opts, setOpts] = useState<Opts | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [f, setF] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const times = useMemo(slots, []);

  const openRequest = useCallback((o: Opts) => {
    const h = HOLDINGS.find((x) => x.id === o.holdingId);
    const opp = OPPORTUNITIES.find((x) => x.id === o.opportunityId);
    setF({
      target: opp ? opp.id : h ? h.id : '',
      entity: h?.entity || ENTITIES[0],
      timing: 'This quarter', format: 'Written summary', meet: 'Video', with: TEAM[0].name,
      doc: PAPERWORK[0], topic: TOPICS[0], change: CHANGES[0], delivery: 'Document vault',
      amount: opp?.id === 'opp-corvalis-c' ? '180000' : opp ? '250000' : '',
    });
    setDone(null);
    setOpts(o);
  }, []);
  const close = useCallback(() => setOpts(null), []);

  const targetName = (id: string) => OPPORTUNITIES.find((o) => o.id === id)?.title || HOLDINGS.find((h) => h.id === id)?.name || '';

  const submit = () => {
    if (!opts) return;
    const t = opts.type;
    let title = '', detail = f.notes || '';
    const holdingId = HOLDINGS.find((h) => h.id === f.target)?.id || OPPORTUNITIES.find((o) => o.id === f.target)?.holdingId;
    const amount = Number(f.amount) || undefined;
    if (t === 'Increase investment') { title = `${targetName(f.target) || 'New investment'}: ${amount ? usd(amount) : 'amount to confirm'}`; detail = `${f.timing}. ${detail}`.trim(); }
    if (t === 'Paperwork') title = `${f.doc}${f.target ? ' · ' + targetName(f.target) : ''}`;
    if (t === 'Update request') { title = `${targetName(f.target)}: ${f.topic.toLowerCase()} update`; detail = `${f.format}. ${detail}`.trim(); }
    if (t === 'Schedule a call') { title = `Call with ${f.with} · ${f.slot || 'time to confirm'}`; detail = `${f.meet}. ${detail}`.trim(); }
    if (t === 'Tax question') title = `Tax: ${f.taxTopic || 'K1 timing'}`;
    if (t === 'Account change') title = f.change;
    dispatch({ t: 'request', req: { type: t, title, detail, holdingId, amount, entity: f.entity } });
    setDone(title);
  };

  const valid = (() => {
    if (!opts) return false;
    if (opts.type === 'Increase investment') return !!f.target && Number(f.amount) > 0;
    if (opts.type === 'Update request') return !!f.target;
    if (opts.type === 'Schedule a call') return !!f.slot;
    return true;
  })();

  const meta = REQ_TYPES.find((r) => r.type === opts?.type);
  const nextId = 'REQ ' + (Math.max(...requests.map((r) => Number(r.id.split(' ')[1]) || 0), 1060));
  const allTargets = (
    <>
      <optgroup label="Open opportunities">{OPPORTUNITIES.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</optgroup>
      <optgroup label="Your holdings">{HOLDINGS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</optgroup>
    </>
  );

  return (
    <Ctx.Provider value={{ openRequest }}>
      {children}
      <Modal open={!!opts} onClose={close}>
        {opts && done ? (
          <Success
            title="Request received"
            body={<>{nextId} is with {opts.type === 'Tax question' ? 'Laura Chen' : opts.type === 'Paperwork' || opts.type === 'Account change' ? 'Ben Marsh' : 'Alexandra Reyes'}. You'll get a notification at every step{opts.type === 'Increase investment' ? ', and subscription documents typically arrive within one business day' : ''}.</>}
            onClose={close}
            cta={<button className="btn" onClick={() => { close(); nav('/requests'); }}>Track request</button>}
          />
        ) : opts && meta ? (
          <>
            <ModalHead icon={meta.icon} title={meta.title} sub={meta.blurb} onClose={close} />
            <div className="modal-body">
              {opts.type === 'Increase investment' && (
                <>
                  <div className="field"><label>Investment</label>
                    <select className="input" value={f.target} onChange={(e) => set('target', e.target.value)}><option value="">Select an investment</option>{allTargets}</select>
                  </div>
                  <div className="field"><label>Amount</label>
                    <input className="input num" inputMode="numeric" placeholder="$0" value={f.amount ? Number(f.amount).toLocaleString('en-US') : ''} onChange={(e) => set('amount', e.target.value.replace(/\D/g, ''))} />
                    <div className="chips mt8">{[50000, 100000, 250000, 500000].map((a) => <button key={a} type="button" className={'chip' + (Number(f.amount) === a ? ' on' : '')} onClick={() => set('amount', String(a))}>{usd(a)}</button>)}</div>
                  </div>
                  <div className="field"><label>Investing entity</label>
                    <select className="input" value={f.entity} onChange={(e) => set('entity', e.target.value)}>{ENTITIES.map((e) => <option key={e}>{e}</option>)}</select>
                  </div>
                  <div className="field"><label>Funding timing</label>
                    <div className="seg">{['This quarter', 'Next quarter', 'Flexible'].map((x) => <button key={x} type="button" className={f.timing === x ? 'on' : ''} onClick={() => set('timing', x)}>{x}</button>)}</div>
                  </div>
                  <div className="field"><label>Notes for your team (optional)</label><textarea className="input" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Anything we should know, such as splitting across entities" /></div>
                  <div className="card" style={{ background: 'var(--sky-soft)', borderColor: 'transparent', boxShadow: 'none', padding: 14, fontSize: 13 }}>
                    <div className="row" style={{ alignItems: 'flex-start' }}><Icon name="shield" size={18} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 1 }} />
                      <span>Your team confirms eligibility and allocation, sends subscription documents for e signature, and confirms funding instructions with you by phone. SKK never sends wire instructions by email.</span></div>
                  </div>
                </>
              )}
              {opts.type === 'Paperwork' && (
                <>
                  <div className="field"><label>What do you need?</label><select className="input" value={f.doc} onChange={(e) => set('doc', e.target.value)}>{PAPERWORK.map((p) => <option key={p}>{p}</option>)}</select></div>
                  <div className="field"><label>Related investment (optional)</label><select className="input" value={f.target} onChange={(e) => set('target', e.target.value)}><option value="">All investments</option>{allTargets}</select></div>
                  <div className="field"><label>Entity</label><select className="input" value={f.entity} onChange={(e) => set('entity', e.target.value)}>{ENTITIES.map((e) => <option key={e}>{e}</option>)}</select></div>
                  <div className="field"><label>Delivery</label><div className="seg">{['Document vault', 'Vault and mail', 'Send to my CPA'].map((x) => <button key={x} type="button" className={f.delivery === x ? 'on' : ''} onClick={() => set('delivery', x)}>{x}</button>)}</div></div>
                  <div className="field"><label>Notes (optional)</label><textarea className="input" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Dates, lender name or anything specific" /></div>
                </>
              )}
              {opts.type === 'Update request' && (
                <>
                  <div className="field"><label>Company or fund</label><select className="input" value={f.target} onChange={(e) => set('target', e.target.value)}><option value="">Select a holding</option>{HOLDINGS.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
                  <div className="field"><label>Topic</label><div className="chips">{TOPICS.map((t) => <button key={t} type="button" className={'chip' + (f.topic === t ? ' on' : '')} onClick={() => set('topic', t)}>{t}</button>)}</div></div>
                  <div className="field"><label>Your question</label><textarea className="input" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="What would you like to know?" /></div>
                  <div className="field"><label>Preferred format</label><div className="seg">{['Written summary', 'Call with deal team'].map((x) => <button key={x} type="button" className={f.format === x ? 'on' : ''} onClick={() => set('format', x)}>{x}</button>)}</div></div>
                </>
              )}
              {opts.type === 'Schedule a call' && (
                <>
                  <div className="field"><label>With</label><select className="input" value={f.with} onChange={(e) => set('with', e.target.value)}>{TEAM.map((t) => <option key={t.name} value={t.name}>{t.name} · {t.role}</option>)}<option value="SKK Ventures deal team">SKK Ventures deal team</option><option value="SKK Real Estate deal team">SKK Real Estate deal team</option></select></div>
                  <div className="field"><label>Pick a time (Eastern)</label><div className="chips">{times.map((t) => <button key={t} type="button" className={'chip' + (f.slot === t ? ' on' : '')} onClick={() => set('slot', t)}>{t}</button>)}</div></div>
                  <div className="field"><label>Format</label><div className="seg">{['Video', 'Phone', 'In person, Boston'].map((x) => <button key={x} type="button" className={f.meet === x ? 'on' : ''} onClick={() => set('meet', x)}>{x}</button>)}</div></div>
                  <div className="field"><label>Agenda (optional)</label><textarea className="input" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Topics you'd like to cover" /></div>
                </>
              )}
              {opts.type === 'Tax question' && (
                <>
                  <div className="field"><label>Topic</label><select className="input" value={f.taxTopic || 'K1 timing'} onChange={(e) => set('taxTopic', e.target.value)}>{['K1 timing', 'Estimated tax planning', 'State filing obligations', 'Corrected K1', 'Cost basis', 'Other'].map((x) => <option key={x}>{x}</option>)}</select></div>
                  <div className="field"><label>Entity</label><select className="input" value={f.entity} onChange={(e) => set('entity', e.target.value)}>{ENTITIES.map((e) => <option key={e}>{e}</option>)}</select></div>
                  <div className="field"><label>Question</label><textarea className="input" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Laura Chen and the tax team will reply in your messages" /></div>
                </>
              )}
              {opts.type === 'Account change' && (
                <>
                  <div className="field"><label>Change</label><select className="input" value={f.change} onChange={(e) => set('change', e.target.value)}>{CHANGES.map((c) => <option key={c}>{c}</option>)}</select></div>
                  <div className="field"><label>Entity</label><select className="input" value={f.entity} onChange={(e) => set('entity', e.target.value)}>{ENTITIES.map((e) => <option key={e}>{e}</option>)}</select></div>
                  <div className="field"><label>Details</label><textarea className="input" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Describe the change" /></div>
                  <div className="muted tiny row"><Icon name="lock" size={15} /> Bank account changes are completed by phone with verbal verification, for your protection.</div>
                </>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={close}>Cancel</button>
              <button className="btn" disabled={!valid} onClick={submit}><Icon name="send" /> Submit request</button>
            </div>
          </>
        ) : null}
      </Modal>
    </Ctx.Provider>
  );
}
