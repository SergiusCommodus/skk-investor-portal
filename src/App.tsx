import { AnimatePresence, LazyMotion, domAnimation } from './motion';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Gate, gateOn, unlocked } from './components/Gate';
import { Intro } from './components/Intro';
import { RequestProvider } from './components/Requests';
import { Shell } from './components/Shell';
import { HoldingDetail, Holdings } from './pages/Holdings';
import { Activity, Opportunities, Profile, Updates } from './pages/Investor';
import { Overview } from './pages/Overview';
import { Ask, Messages, Requests } from './pages/Service';
import { Welcome } from './pages/Welcome';
import { StoreProvider, useStore } from './store';

// Screens most visitors never open load on demand, so the first paint stays small.
const Documents = lazy(() => import('./pages/Documents').then((m) => ({ default: m.Documents })));
const TearSheet = lazy(() => import('./pages/TearSheet').then((m) => ({ default: m.TearSheet })));
const FirmOverview = lazy(() => import('./pages/Firm').then((m) => ({ default: m.FirmOverview })));
const FirmRequests = lazy(() => import('./pages/Firm').then((m) => ({ default: m.FirmRequests })));
const FirmInvestors = lazy(() => import('./pages/Firm').then((m) => ({ default: m.FirmInvestors })));
const FirmCalls = lazy(() => import('./pages/Firm').then((m) => ({ default: m.FirmCalls })));
const FirmPublish = lazy(() => import('./pages/Firm').then((m) => ({ default: m.FirmPublish })));
const FirmIntegrations = lazy(() => import('./pages/Integrations').then((m) => ({ default: m.FirmIntegrations })));

const seen = () => { try { return sessionStorage.getItem('skk-intro') === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem('skk-intro', '1'); } catch { /* ignore */ } };

function Routed() {
  const loc = useLocation();
  const { role } = useStore();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  if (loc.pathname === '/welcome') return <Welcome />;
  if (loc.pathname.startsWith('/firm') && role !== 'firm') return <Navigate to="/" replace />;
  return (
    <RequestProvider>
      <Shell>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
        <Routes location={loc} key={loc.pathname}>
          <Route path="/" element={<Overview />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/holdings/:id" element={<HoldingDetail />} />
          <Route path="/tearsheet/:id" element={<TearSheet />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/firm" element={<FirmOverview />} />
          <Route path="/firm/requests" element={<FirmRequests />} />
          <Route path="/firm/investors" element={<FirmInvestors />} />
          <Route path="/firm/calls" element={<FirmCalls />} />
          <Route path="/firm/integrations" element={<FirmIntegrations />} />
          <Route path="/firm/publish" element={<FirmPublish />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Shell>
    </RequestProvider>
  );
}

export default function App() {
  const [ok, setOk] = useState(!gateOn() || unlocked());
  if (!ok) return <LazyMotion features={domAnimation} strict><Gate onOk={() => setOk(true)} /></LazyMotion>;
  return <Inner />;
}

function Inner() {
  const [intro, setIntro] = useState(!seen());
  const done = useCallback(() => { markSeen(); setIntro(false); }, []);
  useEffect(() => {
    if (!seen() && (window.location.hash === '' || window.location.hash === '#/')) window.location.hash = '#/welcome';
  }, []);
  return (
    <LazyMotion features={domAnimation} strict>
      <StoreProvider>
        <HashRouter>
          <Routed />
        </HashRouter>
        <AnimatePresence>{intro && <Intro onDone={done} />}</AnimatePresence>
      </StoreProvider>
    </LazyMotion>
  );
}
