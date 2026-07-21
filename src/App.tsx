import '@/lib/sentry';
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorBusProvider } from '@/components/ErrorBus';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import WebkameraVerwaltungPage from '@/pages/WebkameraVerwaltungPage';
import WebkameraVerwaltungDetailPage from '@/pages/WebkameraVerwaltungDetailPage';
import BilderfassungPage from '@/pages/BilderfassungPage';
import BilderfassungDetailPage from '@/pages/BilderfassungDetailPage';
import PublicFormWebkameraVerwaltung from '@/pages/public/PublicForm_WebkameraVerwaltung';
import PublicFormBilderfassung from '@/pages/public/PublicForm_Bilderfassung';
// <public:imports>
// </public:imports>
// <custom:imports>
// </custom:imports>

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorBusProvider>
        <HashRouter>
          <ActionsProvider>
            <Routes>
              <Route path="public/69e1f9b9e099184b4f891185" element={<PublicFormWebkameraVerwaltung />} />
              <Route path="public/69e1f9bc1913ab36ef161891" element={<PublicFormBilderfassung />} />
              {/* <public:routes> */}
              {/* </public:routes> */}
              <Route element={<Layout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="webkamera-verwaltung" element={<WebkameraVerwaltungPage />} />
                <Route path="webkamera-verwaltung/:id" element={<WebkameraVerwaltungDetailPage />} />
                <Route path="bilderfassung" element={<BilderfassungPage />} />
                <Route path="bilderfassung/:id" element={<BilderfassungDetailPage />} />
                <Route path="admin" element={<AdminPage />} />
                {/* <custom:routes> */}
              {/* </custom:routes> */}
              </Route>
            </Routes>
          </ActionsProvider>
        </HashRouter>
      </ErrorBusProvider>
    </ErrorBoundary>
  );
}
