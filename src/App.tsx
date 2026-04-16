import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import LeistungskatalogPage from '@/pages/LeistungskatalogPage';
import AngebotePage from '@/pages/AngebotePage';
import RechnungenPage from '@/pages/RechnungenPage';
import KundenPage from '@/pages/KundenPage';
import RechnungslistePage from '@/pages/RechnungslistePage';
import BeraterPage from '@/pages/BeraterPage';
import ProjektePage from '@/pages/ProjektePage';
// <custom:imports>
// </custom:imports>

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ActionsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="leistungskatalog" element={<LeistungskatalogPage />} />
              <Route path="angebote" element={<AngebotePage />} />
              <Route path="rechnungen" element={<RechnungenPage />} />
              <Route path="kunden" element={<KundenPage />} />
              <Route path="rechnungsliste" element={<RechnungslistePage />} />
              <Route path="berater" element={<BeraterPage />} />
              <Route path="projekte" element={<ProjektePage />} />
              <Route path="admin" element={<AdminPage />} />
              {/* <custom:routes> */}
              {/* </custom:routes> */}
            </Route>
          </Routes>
        </ActionsProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
