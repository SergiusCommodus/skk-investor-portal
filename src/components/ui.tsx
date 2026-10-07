import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Holding } from '../data/portfolio';
import { ReqStatus } from '../data/content';
import { Icon } from './Icon';

export function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Fades and lifts children in, staggered by index. */
export function Reveal({ i = 0, children, className, style }: { i?: number; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div className={className} style={style}
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.06 * i, ease: [0.2, 0.7, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

export function PageHead({ eyebrow, title, sub, actions }: { eyebrow?: string; title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="between wrap" style={{ marginBottom: 24, alignItems: 'flex-end' }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="page">{title}</h1>
        {sub && <div className="muted small mt8">{sub}</div>}
      </div>
      {actions && <div className="row wrap">{actions}</div>}
    </div>
  );
}

export function LogoTile({ h, lg }: { h: Pick<Holding, 'initials' | 'hue'>; lg?: boolean }) {
  const dark = h.hue === '#C7C8CD';
  return <div className={'logo-tile' + (lg ? ' lg' : '')} style={{ background: h.hue, color: dark ? '#03509F' : '#fff' }}>{h.initials}</div>;
}

export function StatusTag({ s }: { s: ReqStatus | string }) {
  const cls = s === 'Completed' ? 'green' : s === 'Submitted' ? 'gray' : s === 'In review' ? 'amber' : '';
  return <span className={'tag ' + cls}>{s}</span>;
}

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <motion.div className={'modal' + (wide ? ' wide' : '')} onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.3, 1] }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ModalHead({ icon, title, sub, onClose }: { icon?: string; title: string; sub?: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-head">
      {icon && <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sky-soft)', color: 'var(--blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={icon} size={22} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 className="card-title" style={{ fontSize: 21 }}>{title}</h3>
        {sub && <div className="muted small" style={{ marginTop: 2 }}>{sub}</div>}
      </div>
      <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
    </div>
  );
}

export function Success({ title, body, onClose, cta }: { title: string; body: ReactNode; onClose: () => void; cta?: ReactNode }) {
  return (
    <div style={{ padding: '36px 26px 28px', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#03509F,#57B7E8)', color: '#fff', boxShadow: '0 12px 30px rgba(3,80,159,.3)' }}>
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
        </svg>
      </motion.div>
      <h3 className="card-title" style={{ fontSize: 22 }}>{title}</h3>
      <div className="muted mt8" style={{ fontSize: 14.5, maxWidth: 400, margin: '8px auto 0' }}>{body}</div>
      <div className="row mt24" style={{ justifyContent: 'center' }}>
        {cta}
        <button className="btn ghost" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
