import { Link, useParams } from 'react-router-dom';
import { Wordmark } from '../components/Brand';
import { Columns, LineChart } from '../components/Charts';
import { Icon } from '../components/Icon';
import { LogoTile, Page } from '../components/ui';
import { AS_OF_LABEL, HOLDINGS, INVESTOR } from '../data/portfolio';
import { holdingStats } from '../lib/calc';
import { compact, date, monthYear, multiple, pct, usd } from '../lib/format';

export function TearSheet() {
  const { id } = useParams();
  const h = HOLDINGS.find((x) => x.id === id);
  if (!h) return <div className="empty">Not found</div>;
  const st = holdingStats(h);
  const isV = h.strategy === 'SKK Ventures';
  const S: Record<string, React.CSSProperties> = {
    k: { fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8a8d93', fontWeight: 600 },
    sec: { fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#03509F', fontWeight: 700, borderBottom: '1px solid #e4e8ee', paddingBottom: 5, marginBottom: 8 },
  };
  return (
    <Page>
      <div className="between wrap no-print" style={{ marginBottom: 16 }}>
        <Link to={'/holdings/' + h.id} className="row small" style={{ gap: 6, fontWeight: 600 }}><Icon name="arrowLeft" size={16} />{h.name}</Link>
        <button className="btn" onClick={() => window.print()}><Icon name="download" />Save as PDF</button>
      </div>
      <div className="sheet card" style={{ maxWidth: 860, margin: '0 auto', padding: 0, overflow: 'hidden', fontSize: 12 }}>
        <div style={{ background: 'linear-gradient(120deg,#023a75,#03509F 60%,#1a6fc2)', color: '#fff', padding: '22px 28px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="between wrap">
            <Wordmark size="sm" light />
            <div style={{ textAlign: 'right', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.8 }}>Investment tear sheet<br />As of {AS_OF_LABEL}</div>
          </div>
          <div className="row mt24" style={{ gap: 14 }}>
            <LogoTile h={h} lg />
            <div>
              <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{h.name}</div>
              <div style={{ opacity: 0.8, fontSize: 13 }}>{h.tagline}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '20px 28px 24px' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))', gap: 12, background: '#f4f8fc', borderRadius: 10, padding: 14, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {[['Strategy', h.strategy], ['Sector', h.sector], [isV ? 'HQ' : 'Markets', h.hq], [isV ? 'Founded' : 'Vintage', h.founded], [h.leaderTitle, h.leader], ['Security', h.instrument]].map(([k, v]) => (
              <div key={k}><div style={S.k}>{k}</div><div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          <div className="grid mt16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 22 }}>
            <div>
              <div style={S.sec}>Business overview</div>
              <p style={{ color: '#444', lineHeight: 1.55 }}>{h.description}</p>
              <div style={{ ...S.sec, marginTop: 16 }}>Key metrics</div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {h.metrics.map((m) => <div key={m.label}><div style={S.k}>{m.label}</div><div style={{ fontSize: 16, color: '#03509F', fontWeight: 500 }} className="num">{m.value}</div>{m.note && <div style={{ fontSize: 10, color: '#8a8d93' }}>{m.note}</div>}</div>)}
              </div>
              <div style={{ ...S.sec, marginTop: 16 }}>Investment thesis</div>
              <ul className="bullets" style={{ gap: 6 }}>{h.thesis.map((t) => <li key={t} style={{ fontSize: 12 }}>{t}</li>)}</ul>
              <div style={{ ...S.sec, marginTop: 16 }}>Key risks</div>
              <ul className="bullets risk" style={{ gap: 6 }}>{h.risks.map((t) => <li key={t} style={{ fontSize: 12 }}>{t}</li>)}</ul>
            </div>
            <div>
              <div style={{ border: '1px solid #03509F', borderRadius: 10, padding: 14 }}>
                <div style={{ ...S.sec, borderBottom: 0, marginBottom: 6 }}>Your position · {h.entity}</div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['Contributed', usd(st.contributed)], ['Distributions', usd(st.distributed)], ['Current value', usd(h.value)], ['Multiple', multiple(st.moic)], ['IRR', pct(st.irr)], ['Ownership', h.ownership]].map(([k, v]) => (
                    <div key={k}><div style={S.k}>{k}</div><div className="num" style={{ fontSize: 15, fontWeight: 600 }}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{ ...S.sec, marginTop: 16 }}>{h.markUnit}</div>
              {isV ? <Columns data={h.marks} height={150} format={(n) => '$' + n + 'M'} /> : <LineChart labels={h.marks.map((m) => m.label)} series={[{ name: 'NAV', values: h.marks.map((m) => m.value), color: '#03509F', area: true }]} height={150} format={(n) => n.toFixed(2)} />}
              {h.rounds && (
                <>
                  <div style={{ ...S.sec, marginTop: 16 }}>Financing history</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <tbody>{h.rounds.map((r) => <tr key={r.round} style={{ borderBottom: '1px solid #eef1f5' }}><td style={{ padding: '5px 0', fontWeight: 600 }}>{r.round}{r.skk ? ' · SKK' : ''}</td><td className="num">{monthYear(r.date)}</td><td className="num" style={{ textAlign: 'right' }}>{compact(r.raised)}</td><td className="num" style={{ textAlign: 'right' }}>{compact(r.post)} post</td></tr>)}</tbody>
                  </table>
                </>
              )}
              <div style={{ ...S.sec, marginTop: 16 }}>Recent milestones</div>
              {h.milestones.map((m) => <div key={m.text} style={{ marginBottom: 6 }}><span className="num" style={{ color: '#8a8d93', marginRight: 8 }}>{date(m.date)}</span>{m.text}</div>)}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e4e8ee', marginTop: 20, paddingTop: 10, fontSize: 9.5, color: '#8a8d93', lineHeight: 1.5 }}>
            Confidential. Prepared for {INVESTOR.first} {INVESTOR.last}. Valuations are SKK estimates and may not reflect realizable value. Past performance does not guarantee future results.
            <b style={{ color: '#03509F' }}> DEMONSTRATION ONLY: company, figures and people are fictional.</b>
          </div>
        </div>
      </div>
    </Page>
  );
}
