import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import KundenPage from '@/pages/KundenPage';
import BeraterPage from '@/pages/BeraterPage';
import LeistungskatalogPage from '@/pages/LeistungskatalogPage';
import ProjektePage from '@/pages/ProjektePage';
import AngebotePage from '@/pages/AngebotePage';
import RechnungenPage from '@/pages/RechnungenPage';
import RechnungslistePage from '@/pages/RechnungslistePage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="kunden" element={<KundenPage />} />
          <Route path="berater" element={<BeraterPage />} />
          <Route path="leistungskatalog" element={<LeistungskatalogPage />} />
          <Route path="projekte" element={<ProjektePage />} />
          <Route path="angebote" element={<AngebotePage />} />
          <Route path="rechnungen" element={<RechnungenPage />} />
          <Route path="rechnungsliste" element={<RechnungslistePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}