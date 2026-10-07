import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Wordmark, Mosaic } from './Brand';
import { Icon } from './Icon';

/** Light access screen for the shared demo link. It keeps casual visitors out; it is not real security. */
const SALT = 'skk-demo:';
const EXPECTED = '1pf1b88bx6n';

export const hash = (s: string) => {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};

export const gateOn = () => import.meta.env.VITE_GATE === '1';
export const unlocked = () => { try { return sessionStorage.getItem('skk-gate') === '1'; } catch { return false; } };

export function Gate({ onOk }: { onOk: () => void }) {
  const [v, setV] = useState('');
  const [bad, setBad] = useState(false);
  const [tries, setTries] = useState(0);
  const lock = useRef(0);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lock.current) return;
    if (hash(SALT + v.trim()) === EXPECTED) {
      try { sessionStorage.setItem('skk-gate', '1'); } catch { /* ignore */ }
      onOk();
    } else {
      setBad(true); setV(''); setTries((t) => t + 1);
      if (tries >= 2) lock.current = Date.now() + 3000;
    }
  };
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20, position: 'relative', overflow: 'hidden', background: 'linear-gradient(140deg,#023a75,#03509F 55%,#1a6fc2)' }}>
      <Mosaic cols={24} rows={14} cell={40} seed={9} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }} />
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="card" style={{ position: 'relative', width: 'min(400px, 100%)', padding: '30px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Wordmark size="md" /></div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sky-soft)', color: 'var(--blue)', display: 'grid', placeItems: 'center', margin: '22px auto 12px' }}><Icon name="lock" size={22} /></div>
        <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0 }}>Private demo</h1>
        <div className="muted small mt8">Enter the passcode you were given to view the investor portal concept.</div>
        <input className="input mt16" type="password" inputMode="numeric" autoComplete="off" autoFocus maxLength={12} value={v} aria-label="Passcode"
          onChange={(e) => { setV(e.target.value); setBad(false); }} style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: 20 }} />
        <div role="alert" className="small" style={{ minHeight: 20, marginTop: 8, color: 'var(--red)' }}>{bad ? 'That passcode is not right.' : ''}</div>
        <button className="btn block" type="submit" disabled={!v}>Enter</button>
        <div className="muted" style={{ fontSize: 11, marginTop: 14 }}>Concept prototype. All investors, companies and figures are fictional.</div>
      </motion.form>
    </div>
  );
}
