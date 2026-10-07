import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mosaic, Wordmark } from '../components/Brand';
import { Icon } from '../components/Icon';
import { BRAND } from '../brand';
import { useStore } from '../store';

export function Welcome() {
  const nav = useNavigate();
  const { dispatch } = useStore();
  const enter = (role: 'investor' | 'firm') => { dispatch({ t: 'role', role }); nav(role === 'firm' ? '/firm' : '/'); };
  const ease = [0.2, 0.7, 0.3, 1] as const;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="demo-strip"><b>Demo</b>Concept prototype · no credentials are collected · all data is fictional</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: BRAND.colors.blue, minHeight: 300, display: 'flex', alignItems: 'flex-end' }}>
          <Mosaic cols={16} rows={18} cell={50} seed={21} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }} weights={[0.32, 0.22, 0.08, 0.1, 0.28]} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(200deg, rgba(2,58,117,.2) 0%, rgba(2,58,117,.75) 55%, rgba(2,40,82,.96) 100%)' }} />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease }} style={{ position: 'relative', padding: '40px 36px', color: '#fff', maxWidth: 560 }}>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>SKK Ventures · SKK Real Estate</div>
            <div style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 300, letterSpacing: '-0.035em', lineHeight: 1.12, marginTop: 14 }}>
              Every investment, document and conversation, in one place.
            </div>
            <div style={{ marginTop: 18, color: 'rgba(255,255,255,.78)', fontSize: 15, maxWidth: 440 }}>
              Live valuations, tear sheets, K1s and a direct line to your team, with white glove service behind every request.
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', placeItems: 'center', padding: '40px 24px', background: '#fff', position: 'relative' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}><Wordmark size="md" /></motion.div>
            <motion.h1 className="h-display" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease }} style={{ fontSize: 36, marginTop: 44 }}>Welcome back</motion.h1>
            <motion.p className="muted mt8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>Choose a demo profile to explore the portal.</motion.p>

            {[
              { role: 'investor' as const, initials: 'JE', name: 'Jonathan Ellery', sub: 'Private client · 9 investments across 3 entities', cls: '' },
              { role: 'firm' as const, initials: 'AR', name: 'Alexandra Reyes', sub: 'SKK team · client relationships and requests', cls: ' alt' },
            ].map((p, i) => (
              <motion.button key={p.role} onClick={() => enter(p.role)} className="card hover"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.1, duration: 0.6, ease }}
                style={{ width: '100%', textAlign: 'left', marginTop: i ? 12 : 28, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                <div className={'avatar lg' + p.cls}>{p.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                  <div className="muted small">{p.sub}</div>
                </div>
                <Icon name="arrowRight" size={20} style={{ color: 'var(--blue)' }} />
              </motion.button>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt32" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', color: 'var(--ink-3)', fontSize: 12 }}>
              <span className="row" style={{ gap: 6 }}><Icon name="shield" size={15} />Two factor sign in</span>
              <span className="row" style={{ gap: 6 }}><Icon name="lock" size={15} />Encrypted document vault</span>
              <span className="row" style={{ gap: 6 }}><Icon name="users" size={15} />Read only access for your CPA</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
