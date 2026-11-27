import { useEffect } from 'react';
import { Guide } from './pages/Guide';
import { CamelWelcome } from './components/CamelWelcome';
import { VietnamWelcome } from './components/VietnamWelcome';
import { CodesSync } from './components/CodesSync';
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Banners } from './components/Banners';
import { ViewerGate } from './components/ViewerGate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Overview } from './pages/Overview';
import { DayPage, DayRedirect } from './pages/DayPage';
import { MapPage } from './pages/MapPage';
import { Reservations } from './pages/Reservations';
import { Expenses } from './pages/Expenses';
import { OfflineProvider } from './state/offline';
import { PrivateProvider } from './state/privateData';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { if (!pathname.startsWith('/day/')) window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

// The claude.ai preview frame has no real URL paths: keep routes in memory there.
const Router = __PREVIEW__ ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <Router>
      <OfflineProvider>
        <PrivateProvider>
          <ScrollTop />
          <Banners />
          <main className="mx-auto min-h-dvh max-w-xl pb-[calc(76px+env(safe-area-inset-bottom))]">
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/day" element={<DayRedirect />} />
              <Route path="/day/:date" element={<DayPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/vietna-101" element={<Guide />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </ErrorBoundary>
          </main>
          <BottomNav />
          <ViewerGate />
          <CamelWelcome />
          <VietnamWelcome />
          <CodesSync />
        </PrivateProvider>
      </OfflineProvider>
    </Router>
  );
}
