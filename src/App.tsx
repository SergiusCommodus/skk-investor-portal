import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Intro } from './components/Intro';
import { RequestProvider } from './components/Requests';
import { Shell } from './components/Shell';
import { Documents } from './pages/Documents';
import { FirmCalls, FirmInvestors, FirmOverview, FirmPublish, FirmRequests } from './pages/Firm';
import { HoldingDetail, Holdings } from './pages/Holdings';
import { Activity, Opportunities, Profile, Updates } from './pages/Investor';
import { Overview } from './pages/Overview';
import { Ask, Messages, Requests } from './pages/Service';
import { TearSheet } from './pages/TearSheet';
import { Welcome } from './pages/Welcome';
import { StoreProvider } from './store';

const seen = () => { try { return sessionStorage.getItem('skk-intro') === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem('skk-intro', '1'); } catch { /* ignore */ } };

function Routed() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  if (loc.pathname === '/welcome') return <Welcome />;
  return (
    <RequestProvider>
      <Shell>
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
          <Route path="/firm/publish" element={<FirmPublish />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </RequestProvider>
  );
}

export default function App() {
  const [intro, setIntro] = useState(!seen());
  const done = useCallback(() => { markSeen(); setIntro(false); }, []);
  useEffect(() => {
    if (!seen() && (window.location.hash === '' || window.location.hash === '#/')) window.location.hash = '#/welcome';
  }, []);
  return (
    <StoreProvider>
      <HashRouter>
        <Routed />
      </HashRouter>
      <AnimatePresence>{intro && <Intro onDone={done} />}</AnimatePresence>
    </StoreProvider>
  );
}
