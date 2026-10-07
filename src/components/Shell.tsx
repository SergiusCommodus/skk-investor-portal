import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { DOCS } from '../data/content';
import { HOLDINGS, INVESTOR, TEAM } from '../data/portfolio';
import { relTime } from '../lib/format';
import { useStore } from '../store';
import { Mosaic, Wordmark } from './Brand';
import { Icon } from './Icon';
import { LogoTile, Modal } from './ui';

type NavDef = { to: string; label: string; icon: string; badge?: number; end?: boolean };

export function Shell({ children }: { children: ReactNode }) {
  const s = useStore();
  const loc = useLocation();
  const nav = useNavigate();
  const firm = s.role === 'firm';
  const [search, setSearch] = useState(false);
  const [bell, setBell] = useState(false);
  const [me, setMe] = useState(false);
  const [more, setMore] = useState(false);

  const unreadUpdates = s.updates.filter((u) => !s.readUpdates.includes(u.id)).length;
  const unreadMsgs = s.threads.filter((t) => t.unread).length;
  const openReqs = s.requests.filter((r) => r.status !== 'Completed').length;
  const newForFirm = s.requests.filter((r) => r.status === 'Submitted').length;
  const notices = s.notices.filter((n) => n.to === s.role);
  const unreadNotices = notices.filter((n) => !n.read).length;

  const investorNav: NavDef[] = [
    { to: '/', label: 'Overview', icon: 'home', end: true },
    { to: '/holdings', label: 'Holdings', icon: 'briefcase' },
    { to: '/opportunities', label: 'Opportunities', icon: 'star', badge: 2 },
    { to: '/activity', label: 'Capital activity', icon: 'flow' },
    { to: '/documents', label: 'Documents', icon: 'file' },
    { to: '/updates', label: 'Updates', icon: 'news', badge: unreadUpdates },
    { to: '/messages', label: 'Messages', icon: 'chat', badge: unreadMsgs },
    { to: '/requests', label: 'Concierge', icon: 'concierge', badge: openReqs },
    { to: '/ask', label: 'Ask SKK', icon: 'spark' },
  ];
  const firmNav: NavDef[] = [
    { to: '/firm', label: 'Firm overview', icon: 'home', end: true },
    { to: '/firm/requests', label: 'Request inbox', icon: 'inbox', badge: newForFirm },
    { to: '/firm/investors', label: 'Investors', icon: 'users' },
    { to: '/firm/calls', label: 'Capital calls', icon: 'flow' },
    { to: '/firm/publish', label: 'Publish update', icon: 'megaphone' },
  ];
  const items = firm ? firmNav : investorNav;

  useEffect(() => { setBell(false); setMe(false); setMore(false); }, [loc.pathname]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const switchRole = () => {
    const role = firm ? 'investor' : 'firm';
    s.dispatch({ t: 'role', role });
    nav(role === 'firm' ? '/firm' : '/');
    s.toast(role === 'firm' ? 'Viewing as the SKK team' : 'Viewing as Jonathan Ellery', 'info');
  };

  const tabs: NavDef[] = firm
    ? [firmNav[0], firmNav[1], firmNav[2], firmNav[4]]
    : [investorNav[0], investorNav[1], investorNav[4], investorNav[6]];

  return (
    <div>
      <div className="demo-strip"><b>Demo</b>Concept prototype · all investors, companies and figures are fictional</div>
      <div className="app">
        <aside className="side">
          <div className="side-head"><Link to={firm ? '/firm' : '/'}><Wordmark size="sm" /></Link></div>
          {firm && <div style={{ margin: '0 22px 6px' }}><span className="tag">SKK team view</span></div>}
          <nav>
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <Icon name={it.icon} />{it.label}{!!it.badge && <span className="nav-badge">{it.badge}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="side-foot">
            {!firm && (
              <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
                <div className="eyebrow" style={{ fontSize: 9.5 }}>Your relationship lead</div>
                <div className="row mt8"><div className="avatar">{TEAM[0].initials}</div><div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{TEAM[0].name}</div><div className="muted tiny">{TEAM[0].phone}</div></div></div>
                <div className="row mt12" style={{ gap: 8 }}>
                  <Link to="/messages" className="btn sm ghost" style={{ flex: 1 }}><Icon name="chat" />Message</Link>
                  <Link to="/requests" className="btn sm ghost" style={{ flex: 1 }}><Icon name="calendar" />Book</Link>
                </div>
              </div>
            )}
            <button className="btn ghost block mt12 sm" onClick={switchRole}><Icon name="swap" />{firm ? 'Switch to investor view' : 'Switch to SKK team view'}</button>
          </div>
          <Mosaic className="mosaic-bg" cols={10} rows={7} cell={40} seed={3} />
        </aside>

        <div className="main">
          <header className="topbar">
            <Link to={firm ? '/firm' : '/'} className="brand-sm"><Wordmark size="sm" sub={false} /></Link>
            <button className="search-btn" onClick={() => setSearch(true)}><Icon name="search" size={17} />Search holdings, documents…<kbd>Ctrl K</kbd></button>
            <div className="spacer" />
            <button className="icon-btn show-sm" onClick={() => setSearch(true)} aria-label="Search"><Icon name="search" /></button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" aria-label="Notifications" onClick={() => { setBell((b) => !b); setMe(false); if (!bell) setTimeout(() => s.dispatch({ t: 'readNotices', role: s.role }), 1500); }}>
                <Icon name="bell" />{unreadNotices > 0 && <span className="dot" />}
              </button>
              <AnimatePresence>
                {bell && (
                  <motion.div className="menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ width: 340, maxWidth: 'calc(100vw - 24px)', right: -50 }}>
                    <div className="between" style={{ padding: '14px 16px' }}><b style={{ fontSize: 14 }}>Notifications</b><span className="muted tiny">{unreadNotices} new</span></div>
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      {notices.length === 0 && <div className="empty">You're all caught up</div>}
                      {notices.slice(0, 12).map((n) => (
                        <button key={n.id} className="menu-item" onClick={() => n.link && nav(n.link)}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: n.read ? 'transparent' : 'var(--sky)' }} />
                          <span style={{ flex: 1 }}><span style={{ display: 'block' }}>{n.text}</span><span className="muted tiny">{relTime(n.at)}</span></span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" style={{ width: 'auto', padding: 2 }} onClick={() => { setMe((m) => !m); setBell(false); }} aria-label="Account">
                <div className={'avatar' + (firm ? ' alt' : '')}>{firm ? 'AR' : 'JE'}</div>
              </button>
              <AnimatePresence>
                {me && (
                  <motion.div className="menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ minWidth: 260 }}>
                    <div style={{ padding: '14px 16px' }}>
                      <b>{firm ? 'Alexandra Reyes' : `${INVESTOR.first} ${INVESTOR.last}`}</b>
                      <div className="muted tiny">{firm ? 'SKK Client Relationships' : `${INVESTOR.tier} since ${INVESTOR.since}`}</div>
                    </div>
                    {!firm && <button className="menu-item" onClick={() => nav('/profile')}><Icon name="user" size={17} />Profile and entities</button>}
                    <button className="menu-item" onClick={switchRole}><Icon name="swap" size={17} />{firm ? 'Switch to investor view' : 'Switch to SKK team view'}</button>
                    <button className="menu-item" onClick={() => { s.dispatch({ t: 'reset' }); s.toast('Demo data reset', 'info'); }}><Icon name="refresh" size={17} />Reset demo data</button>
                    <button className="menu-item" onClick={() => nav('/welcome')}><Icon name="logout" size={17} />Sign out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          <main className="content">{children}</main>
        </div>
      </div>

      <nav className="tabs">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name={t.icon} />{t.label.replace('Firm overview', 'Overview').replace('Request inbox', 'Inbox').replace('Publish update', 'Publish')}
            {!!t.badge && <span className="badge">{t.badge}</span>}
          </NavLink>
        ))}
        <button onClick={() => setMore(true)} className={more ? 'active' : ''}><Icon name="more" />More</button>
      </nav>

      <Modal open={more} onClose={() => setMore(false)}>
        <div style={{ padding: '20px 16px 24px' }}>
          <div className="between" style={{ padding: '0 6px 10px' }}><Wordmark size="sm" /><button className="icon-btn" onClick={() => setMore(false)}><Icon name="x" /></button></div>
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} onClick={() => setMore(false)} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <Icon name={it.icon} />{it.label}{!!it.badge && <span className="nav-badge">{it.badge}</span>}
            </NavLink>
          ))}
          {!firm && <NavLink to="/profile" onClick={() => setMore(false)} className="nav-item"><Icon name="user" />Profile and entities</NavLink>}
          <button className="btn ghost block mt16" onClick={() => { setMore(false); switchRole(); }}><Icon name="swap" />{firm ? 'Switch to investor view' : 'Switch to SKK team view'}</button>
        </div>
      </Modal>

      <SearchPalette open={search} onClose={() => setSearch(false)} />

      <div className="toasts">
        <AnimatePresence>
          {s.toasts.map((t) => (
            <motion.div key={t.id} className="toast" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}>
              <Icon name={t.tone === 'info' ? 'info' : 'check'} />{t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PAGES = [
  { label: 'Overview', to: '/' }, { label: 'Capital activity', to: '/activity' }, { label: 'Concierge requests', to: '/requests' },
  { label: 'Messages', to: '/messages' }, { label: 'Ask SKK', to: '/ask' }, { label: 'Opportunities', to: '/opportunities' }, { label: 'Profile and entities', to: '/profile' },
];

function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(''); setTimeout(() => ref.current?.focus(), 80); } }, [open]);
  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return { h: HOLDINGS.slice(0, 5), d: DOCS.filter((d) => d.isNew).slice(0, 4), p: PAGES.slice(0, 3) };
    return {
      h: HOLDINGS.filter((h) => (h.name + h.sector + h.tagline + h.strategy).toLowerCase().includes(t)).slice(0, 6),
      d: DOCS.filter((d) => (d.title + d.category).toLowerCase().includes(t)).slice(0, 6),
      p: PAGES.filter((p) => p.label.toLowerCase().includes(t)),
    };
  }, [q]);
  const go = (to: string) => { onClose(); nav(to); };
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--line)' }} className="row">
        <Icon name="search" size={20} style={{ color: 'var(--ink-3)' }} />
        <input ref={ref} className="input" style={{ border: 0, boxShadow: 'none', padding: 6, fontSize: 17 }} placeholder="Search holdings, documents, pages" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="icon-btn" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div style={{ padding: '8px 0 16px', maxHeight: '60vh', overflowY: 'auto' }}>
        {res.h.length > 0 && <div className="nav-label" style={{ padding: '12px 20px 6px' }}>Holdings</div>}
        {res.h.map((h) => (
          <button key={h.id} className="list-row" onClick={() => go('/holdings/' + h.id)}><LogoTile h={h} /><div className="grow"><div className="t">{h.name}</div><div className="m">{h.strategy} · {h.sector}</div></div><Icon name="chevron" size={16} /></button>
        ))}
        {res.d.length > 0 && <div className="nav-label" style={{ padding: '12px 20px 6px' }}>Documents</div>}
        {res.d.map((d) => (
          <button key={d.id} className="list-row" onClick={() => go('/documents?doc=' + d.id)}><Icon name="file" size={20} style={{ color: 'var(--blue)' }} /><div className="grow"><div className="t">{d.title}</div><div className="m">{d.category}</div></div></button>
        ))}
        {res.p.length > 0 && <div className="nav-label" style={{ padding: '12px 20px 6px' }}>Pages</div>}
        {res.p.map((p) => (
          <button key={p.to} className="list-row" onClick={() => go(p.to)}><Icon name="arrowRight" size={18} style={{ color: 'var(--ink-3)' }} /><div className="grow"><div className="t">{p.label}</div></div></button>
        ))}
        {!res.h.length && !res.d.length && !res.p.length && <div className="empty">No results for “{q}”</div>}
      </div>
    </Modal>
  );
}
