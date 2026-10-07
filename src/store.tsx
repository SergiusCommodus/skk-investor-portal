import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { REQUESTS, REQ_STEPS, ServiceRequest, THREADS, Thread, UPDATES, Update, ReqStatus } from './data/content';

export type Role = 'investor' | 'firm';
export type Toast = { id: number; text: string; tone?: 'ok' | 'info' };
export type Notice = { id: string; at: string; text: string; to: Role; link?: string; read?: boolean };

type State = {
  role: Role;
  requests: ServiceRequest[];
  threads: Thread[];
  updates: Update[];
  readUpdates: string[];
  notices: Notice[];
  toasts: Toast[];
  entity: string;
  typing: string | null;
  seq: number;
};

const now = () => new Date().toISOString();

const initial: State = {
  role: 'investor',
  requests: REQUESTS,
  threads: THREADS,
  updates: UPDATES,
  readUpdates: ['u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12'],
  notices: [
    { id: 'n1', at: '2026-10-03T08:00:00', text: 'Q3 2026 investor letter is available', to: 'investor', link: '/updates' },
    { id: 'n2', at: '2026-10-01T14:05:00', text: 'Alexandra Reyes sent you a message', to: 'investor', link: '/messages' },
    { id: 'n3', at: '2026-10-01T09:00:00', text: 'Harbor Point capital call 4 issued: $150,000 due Oct 31', to: 'investor', link: '/holdings/harborpoint' },
    { id: 'n4', at: '2026-09-26T15:10:00', text: 'REQ 1051 updated: call with Vireo CEO scheduled', to: 'investor', link: '/requests', read: true },
  ],
  toasts: [],
  entity: 'All entities',
  typing: null,
  seq: 1060,
};

type Action =
  | { t: 'role'; role: Role }
  | { t: 'entity'; entity: string }
  | { t: 'request'; req: Omit<ServiceRequest, 'id' | 'status' | 'created' | 'updated' | 'log' | 'owner'> }
  | { t: 'advance'; id: string; note?: string }
  | { t: 'send'; threadId: string | null; subject?: string; text: string; from: 'investor' | 'skk'; author: string }
  | { t: 'typing'; who: string | null }
  | { t: 'readThread'; id: string }
  | { t: 'readUpdate'; id: string }
  | { t: 'readNotices'; role: Role }
  | { t: 'publish'; update: Omit<Update, 'id' | 'date'> }
  | { t: 'toast'; toast: Toast }
  | { t: 'untoast'; id: number }
  | { t: 'reset' };

const OWNERS: Record<string, string> = {
  'Increase investment': 'Alexandra Reyes', 'Paperwork': 'Ben Marsh', 'Update request': 'Alexandra Reyes',
  'Schedule a call': 'Alexandra Reyes', 'Tax question': 'Laura Chen, CPA', 'Account change': 'Ben Marsh',
};

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'role': return { ...s, role: a.role };
    case 'entity': return { ...s, entity: a.entity };
    case 'request': {
      const id = 'REQ ' + (s.seq + 1);
      const at = now();
      const req: ServiceRequest = { ...a.req, id, status: 'Submitted', created: at, updated: at, owner: OWNERS[a.req.type] || 'Ben Marsh', log: [{ at, text: 'Request submitted' }] };
      return {
        ...s, seq: s.seq + 1, requests: [req, ...s.requests],
        notices: [{ id: 'n' + at, at, to: 'firm', text: `New ${a.req.type.toLowerCase()} from Jonathan Ellery: ${a.req.title}`, link: '/firm/requests' }, ...s.notices],
      };
    }
    case 'advance': {
      const at = now();
      let changed: ServiceRequest | undefined;
      const requests = s.requests.map((r) => {
        if (r.id !== a.id || r.status === 'Completed') return r;
        const i = REQ_STEPS.indexOf(r.status as ReqStatus);
        const next = REQ_STEPS[Math.min(REQ_STEPS.length - 1, (i < 0 ? 1 : i) + 1)];
        const text = a.note || ({ 'In review': `Assigned to ${r.owner}`, 'In progress': r.type === 'Increase investment' ? 'Subscription documents prepared and sent for e signature' : 'Your team is working on this', Completed: r.type === 'Paperwork' ? 'Document delivered to your vault' : 'Request completed' } as Record<string, string>)[next] || next;
        changed = { ...r, status: next, updated: at, log: [...r.log, { at, text }] };
        return changed;
      });
      if (!changed) return s;
      return { ...s, requests, notices: [{ id: 'n' + at, at, to: 'investor', text: `${changed.id} is now ${changed.status.toLowerCase()}: ${changed.title}`, link: '/requests' }, ...s.notices] };
    }
    case 'send': {
      const at = now();
      const msg = { id: 'm' + at + Math.random(), from: a.from, author: a.author, text: a.text, at };
      const target = a.threadId === '__latest__' ? s.threads[0]?.id : a.threadId;
      if (target) {
        return { ...s, threads: s.threads.map((t) => (t.id === target ? { ...t, messages: [...t.messages, msg], unread: a.from === 'skk' } : t)) };
      }
      const t: Thread = { id: 't' + at, subject: a.subject || 'New message', with: 'Alexandra Reyes', messages: [msg] };
      return { ...s, threads: [t, ...s.threads] };
    }
    case 'typing': return { ...s, typing: a.who };
    case 'readThread': return { ...s, threads: s.threads.map((t) => (t.id === a.id ? { ...t, unread: false } : t)) };
    case 'readUpdate': return s.readUpdates.includes(a.id) ? s : { ...s, readUpdates: [...s.readUpdates, a.id] };
    case 'readNotices': return { ...s, notices: s.notices.map((n) => (n.to === a.role ? { ...n, read: true } : n)) };
    case 'publish': {
      const at = now();
      const u: Update = { ...a.update, id: 'u' + at, date: at.slice(0, 10) };
      return { ...s, updates: [u, ...s.updates], notices: [{ id: 'n' + at, at, to: 'investor', text: `New update: ${u.title}`, link: '/updates' }, ...s.notices] };
    }
    case 'toast': return { ...s, toasts: [...s.toasts, a.toast] };
    case 'untoast': return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case 'reset': return { ...initial, role: s.role };
  }
}

const KEY = 'skk-demo-state-v1';
function load(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw), toasts: [], typing: null };
  } catch { /* storage unavailable: run in memory */ }
  return initial;
}

type Ctx = State & {
  dispatch: React.Dispatch<Action>;
  toast: (text: string, tone?: Toast['tone']) => void;
  sendAndReply: (threadId: string | null, text: string, subject?: string) => string | null;
};
const StoreCtx = createContext<Ctx | null>(null);

const REPLIES = [
  'Thanks Jonathan. I\'ve got this and will come back to you today with details.',
  'Received, thank you. I\'ve looped in the deal team and will follow up shortly with what you need.',
  'Happy to help. I\'ll pull that together and drop it into your vault; you\'ll get a notification when it\'s there.',
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const toastId = useRef(0);
  const replyIdx = useRef(0);

  useEffect(() => {
    try {
      const { toasts: _t, typing: _y, ...persist } = state;
      window.localStorage.setItem(KEY, JSON.stringify(persist));
    } catch { /* ignore */ }
  }, [state]);

  const toast = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = ++toastId.current;
    dispatch({ t: 'toast', toast: { id, text, tone } });
    setTimeout(() => dispatch({ t: 'untoast', id }), 3200);
  }, []);

  const sendAndReply = useCallback((threadId: string | null, text: string, subject?: string) => {
    dispatch({ t: 'send', threadId, text, subject, from: 'investor', author: 'Jonathan Ellery' });
    // The new thread id is not known synchronously for new threads; reply lands in the newest thread.
    setTimeout(() => dispatch({ t: 'typing', who: 'Alexandra Reyes' }), 900);
    setTimeout(() => {
      dispatch({ t: 'typing', who: null });
      dispatch({ t: 'send', threadId: threadId ?? '__latest__', text: REPLIES[replyIdx.current++ % REPLIES.length], from: 'skk', author: 'Alexandra Reyes' });
    }, 3200);
    return threadId;
  }, []);

  const value = useMemo(() => ({ ...state, dispatch, toast, sendAndReply }), [state, toast, sendAndReply]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('StoreProvider missing');
  return c;
}
