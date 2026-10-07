import { useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal, ModalHead, Page, PageHead, Reveal } from '../components/ui';
import { CARTA_SCOPES, EXPORTS, ExportKey, Recon, download, reconcile, sampleRecon, syncCounts } from '../integrations/carta';
import { relTime, usd } from '../lib/format';
import { useStore } from '../store';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function FirmIntegrations() {
  const { carta, dispatch, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [text, setText] = useState('');
  const [tol, setTol] = useState(0.5);
  const [res, setRes] = useState<Recon | null>(null);
  const [preview, setPreview] = useState<{ file: string; text: string } | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const sync = async () => {
    if (syncing) return;
    setSyncing(true);
    const c = syncCounts();
    const steps: [string, string][] = [
      ['read_investor_funds', 'Funds and vehicles checked'],
      ['read_investor_partners', `${c.partners} investor relationships matched`],
      ['read_portfolio_securities', `${c.holdings} positions matched`],
      ['read_portfolio_transactions', `${c.transactions} transactions matched`],
      ['read_portfolio_issuervaluations', `${c.valuations} valuation marks matched`],
      ['read_portfolio_fundinvestmentdocuments', `${c.documents} documents indexed`],
    ];
    dispatch({ t: 'cartaLog', text: 'Sync started (simulated, no data leaves this page)' });
    for (const [scope, msg] of steps) { await wait(520); dispatch({ t: 'cartaLog', text: `${scope}: ${msg}` }); }
    await wait(400);
    dispatch({ t: 'cartaLog', text: 'Sync complete with 0 breaks', done: true });
    setSyncing(false);
    toast('Sync complete (simulated)');
  };

  const run = (t = text) => setRes(reconcile(t, tol));
  const onFile = async (f?: File) => { if (!f) return; const t = await f.text(); setText(t); run(t); };
  const exp = (k: ExportKey) => {
    const text = EXPORTS[k].build();
    try { download(EXPORTS[k].file, text); } catch { /* downloads can be blocked in embedded viewers */ }
    setPreview({ file: EXPORTS[k].file, text });
  };

  return (
    <Page>
      <PageHead eyebrow="SKK team view" title="Data sync" sub="Keep the portal tied to your Carta records. Everything on this page runs in demo mode."
        actions={carta.connected
          ? <><button className="btn" onClick={sync} disabled={syncing}><Icon name="refresh" />{syncing ? 'Syncing' : 'Sync now'}</button><button className="btn ghost" onClick={() => dispatch({ t: 'carta', connected: false })}>Disconnect</button></>
          : <button className="btn" onClick={() => setOpen(true)}><Icon name="lock" />Connect Carta</button>} />

      <div className="grid g-main">
        <Reveal i={0}>
          <div className="card" style={{ height: '100%' }}>
            <div className="between wrap" style={{ gap: 12 }}>
              <div className="row" style={{ gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--sky-soft)', color: 'var(--blue)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 20 }}>C</div>
                <div><h3 className="card-title">Carta</h3><div className="muted small">Fund administration source of record</div></div>
              </div>
              <span className={'tag ' + (carta.connected ? 'green' : 'amber')}>{carta.connected ? 'Connected (simulated)' : 'Not connected'}</span>
            </div>
            <div className="small mt16" style={{ lineHeight: 1.6 }}>
              In production, the portal would read from Carta through its API using OAuth 2.0. Carta stays the source of record, and the portal becomes the investor facing layer on top of it: branded, with requests, messaging and a document vault.
            </div>
            <div className="row wrap mt16" style={{ gap: 24 }}>
              <div><div className="eyebrow">Last sync</div><div className="num" style={{ fontWeight: 600 }}>{carta.lastSync ? relTime(carta.lastSync) : 'Never'}</div></div>
              <div><div className="eyebrow">Mode</div><div style={{ fontWeight: 600 }}>Demo, no live data</div></div>
              <div><div className="eyebrow">Auth</div><div style={{ fontWeight: 600 }}>OAuth 2.0</div></div>
            </div>
          </div>
        </Reveal>
        <Reveal i={1}>
          <div className="card" style={{ height: '100%' }}>
            <h3 className="card-title">Sync log</h3>
            {carta.log.length === 0 && <div className="muted small mt12">Nothing yet. Connect Carta, then run a sync.</div>}
            <div className="mt12" style={{ display: 'grid', gap: 10, maxHeight: 220, overflow: 'auto' }}>
              {carta.log.map((l, i) => (
                <div key={l.at + i} className="small" style={{ display: 'flex', gap: 10 }}>
                  <span className="muted num" style={{ flexShrink: 0, minWidth: 64 }}>{relTime(l.at)}</span><span style={{ minWidth: 0, wordBreak: 'break-word' }}>{l.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal i={2}>
        <div className="card flush mt16">
          <div style={{ padding: '20px 22px 4px' }}><h3 className="card-title">What each Carta scope feeds</h3><div className="muted small">Scope names are from Carta's published API documentation. Confirm access for your account before building.</div></div>
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th>Carta scope</th><th>Data</th><th>Feeds this portal</th><th>Status</th></tr></thead>
            <tbody>{CARTA_SCOPES.map((s) => (
              <tr key={s.scope}><td><code style={{ fontSize: 12 }}>{s.scope}</code></td><td>{s.feeds}</td><td>{s.page}</td><td><span className={'tag ' + (s.confidence === 'Documented scope' ? 'green' : 'amber')}>{s.confidence}</span></td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </Reveal>

      <div className="grid g2 mt16">
        <Reveal i={3}>
          <div className="card" style={{ height: '100%' }}>
            <h3 className="card-title">Export files</h3>
            <div className="muted small">Plain CSV files in a layout that maps one to one onto the Carta resources above. Use them to load a real data source later or to check numbers in a spreadsheet.</div>
            <div className="mt16" style={{ display: 'grid', gap: 10 }}>
              {(Object.keys(EXPORTS) as ExportKey[]).map((k) => (
                <button key={k} className="btn ghost" style={{ justifyContent: 'space-between' }} onClick={() => exp(k)}>
                  <span className="row" style={{ gap: 8 }}><Icon name="download" />{EXPORTS[k].label}</span><span className="muted small">{EXPORTS[k].file}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal i={4}>
          <div className="card" style={{ height: '100%' }}>
            <h3 className="card-title">Tie out to a Carta file</h3>
            <div className="muted small">Paste or upload a valuation export with a holding column and a value column. Differences above the tolerance are flagged as breaks.</div>
            <div className="row wrap mt12" style={{ gap: 8 }}>
              <button className="btn ghost sm" onClick={() => file.current?.click()}><Icon name="clip" />Upload CSV</button>
              <button className="btn ghost sm" onClick={() => { const t = sampleRecon(); setText(t); run(t); }}>Load sample</button>
              <label className="row small" style={{ gap: 6, marginLeft: 'auto' }}>Tolerance %<input className="input" type="number" min={0} step={0.1} value={tol} onChange={(e) => setTol(Math.max(0, Number(e.target.value)))} style={{ width: 72, padding: '6px 8px' }} /></label>
              <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
            <textarea className="input mt12" style={{ minHeight: 110, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} placeholder={'holding_id,current_value\nlumora,1425003'} value={text} onChange={(e) => setText(e.target.value)} aria-label="Valuation CSV" />
            <button className="btn mt12" onClick={() => run()} disabled={!text.trim()}>Run tie out</button>
          </div>
        </Reveal>
      </div>

      {res && (
        <div className="card flush mt16">
          <div className="between wrap" style={{ padding: '20px 22px 4px', gap: 8 }}>
            <h3 className="card-title">Tie out result</h3>
            {res.errors.length === 0 && <span className={'tag ' + (res.breaks ? 'amber' : 'green')}>{res.matched} matched, {res.breaks} to review</span>}
          </div>
          {res.errors.length > 0
            ? <div className="small" style={{ padding: '8px 22px 22px', color: 'var(--red)' }}>{res.errors.map((e) => <div key={e}>{e}</div>)}</div>
            : <div className="table-wrap"><table className="tbl">
              <thead><tr><th>Holding</th><th className="r">Portal</th><th className="r">Uploaded</th><th className="r">Difference</th><th>Status</th></tr></thead>
              <tbody>{res.rows.map((r, i) => (
                <tr key={r.ref + i}>
                  <td><b style={{ fontWeight: 600 }}>{r.name || r.ref}</b></td>
                  <td className="r num">{r.portal == null ? '' : usd(r.portal)}</td>
                  <td className="r num">{r.uploaded == null ? '' : usd(r.uploaded)}</td>
                  <td className="r num">{r.diff == null ? '' : r.diff === 0 ? '$0' : `${r.diff > 0 ? '+' : ''}${usd(r.diff)} (${r.pct!.toFixed(2)}%)`}</td>
                  <td><span className={'tag ' + (r.status === 'Match' ? 'green' : r.status === 'Break' ? 'red' : 'amber')}>{r.status}</span></td>
                </tr>
              ))}</tbody>
            </table></div>}
        </div>
      )}

      <Reveal i={5}>
        <div className="card mt16">
          <h3 className="card-title">To go live with Carta</h3>
          <ol className="small" style={{ lineHeight: 1.7, paddingLeft: 18, margin: '10px 0 0' }}>
            <li>SKK administers its funds on Carta and an administrator approves API access for the portal.</li>
            <li>Register an application with Carta to get a client ID and secret. Keep both on a server, never in the browser.</li>
            <li>Use the authorization code flow so SKK grants only the read scopes listed above. Tokens expire after one hour and are renewed on the server.</li>
            <li>Build a small server that pulls each resource on a schedule, stores it, and serves it to the portal after investor sign in.</li>
            <li>Confirm with Carta whether capital account statements and K1s are available through the API or only through the LP portal.</li>
          </ol>
        </div>
      </Reveal>

      <Modal open={!!preview} onClose={() => setPreview(null)} wide>
        <ModalHead icon="download" title={preview?.file || ''} sub="If the file did not download, copy the text below into a .csv file." onClose={() => setPreview(null)} />
        <div className="modal-body">
          <textarea className="input" readOnly style={{ minHeight: 260, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} value={preview?.text || ''} onFocus={(e) => e.currentTarget.select()} aria-label="CSV contents" />
        </div>
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHead icon="lock" title="Connect Carta" sub="Demo only. No credentials are collected." onClose={() => setOpen(false)} />
        <div className="modal-body">
          <div className="small" style={{ lineHeight: 1.65 }}>
            A real connection sends an SKK administrator to Carta to approve read access, then returns a short lived token to the portal's server. This demo skips that step and marks the connection as simulated so you can see the sync experience.
          </div>
          <div className="mt16" style={{ display: 'grid', gap: 8 }}>
            {['Carta asks an administrator to approve the requested scopes', 'The portal server receives a token, never the investor', 'Data syncs on a schedule and every sync is logged'].map((t, i) => (
              <div key={t} className="row small" style={{ gap: 10 }}><span className="tag gray">{i + 1}</span>{t}</div>
            ))}
          </div>
          <button className="btn block mt16" onClick={() => { dispatch({ t: 'carta', connected: true }); setOpen(false); toast('Carta connected (simulated)'); }}>Simulate approval</button>
        </div>
      </Modal>
    </Page>
  );
}
