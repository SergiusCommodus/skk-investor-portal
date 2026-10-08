import { motion } from '../motion';
import { useEffect, useState } from 'react';
import { BRAND } from '../brand';
import { Mosaic } from './Brand';

const STEPS = ['Establishing secure session', 'Loading portfolio valuations', 'Preparing your documents', 'Welcome'];

export function Intro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const ts = [550, 1150, 1750, 2350].map((t, i) => setTimeout(() => setStep(i + 1), t));
    const end = setTimeout(onDone, 2900);
    return () => { ts.forEach(clearTimeout); clearTimeout(end); };
  }, [onDone]);

  return (
    <motion.div
      onClick={onDone}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden' }}
    >
      <Mosaic cols={22} rows={14} cell={60} seed={11} intro animate weights={[0.12, 0.14, 0.16, 0.06, 0.52]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,.97) 0%, rgba(255,255,255,.9) 28%, rgba(255,255,255,0) 70%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }}
        style={{ position: 'relative', textAlign: 'center', padding: 24 }}
      >
        <motion.div
          initial={{ letterSpacing: '0.7em', opacity: 0 }} animate={{ letterSpacing: '0.16em', opacity: 1 }}
          transition={{ delay: 0.45, duration: 1.3, ease: [0.2, 0.7, 0.3, 1] }}
          style={{ fontSize: 'clamp(54px, 12vw, 92px)', fontWeight: 300, color: BRAND.colors.blue, lineHeight: 1, paddingLeft: '0.16em' }}
        >
          {BRAND.short}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.8 }}
          style={{ marginTop: 18, fontSize: 11, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#585858', fontWeight: 600 }}>
          {BRAND.firm}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
          style={{ marginTop: 6, fontSize: 10.5, letterSpacing: '0.3em', textTransform: 'uppercase', color: BRAND.colors.slate }}>
          {BRAND.product}
        </motion.div>
        <div style={{ width: 220, height: 2, background: '#eef1f5', margin: '30px auto 12px', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ delay: 0.4, duration: 2.3, ease: [0.6, 0, 0.3, 1] }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${BRAND.colors.blue}, ${BRAND.colors.sky})` }} />
        </div>
        <motion.div key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 12, color: BRAND.colors.slate, letterSpacing: '0.04em', minHeight: 18 }}>
          {STEPS[Math.min(step, STEPS.length - 1)]}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
