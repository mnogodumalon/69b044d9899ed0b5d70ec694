import '@/lib/sentry';
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorBusProvider } from '@/components/ErrorBus';
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
import PublicFormLeistungskatalog from '@/pages/public/PublicForm_Leistungskatalog';
import PublicFormAngebote from '@/pages/public/PublicForm_Angebote';
import PublicFormRechnungen from '@/pages/public/PublicForm_Rechnungen';
import PublicFormKunden from '@/pages/public/PublicForm_Kunden';
import PublicFormRechnungsliste from '@/pages/public/PublicForm_Rechnungsliste';
import PublicFormBerater from '@/pages/public/PublicForm_Berater';
import PublicFormProjekte from '@/pages/public/PublicForm_Projekte';
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
              <Route path="public/69b0449d2b38b929a62bf826" element={<PublicFormLeistungskatalog />} />
              <Route path="public/69b0449f1057da227ac2d5f0" element={<PublicFormAngebote />} />
              <Route path="public/69b044a030862338e09ce6de" element={<PublicFormRechnungen />} />
              <Route path="public/69b04492d5d4fe137f4a9821" element={<PublicFormKunden />} />
              <Route path="public/69b044a21918feff3a9b0843" element={<PublicFormRechnungsliste />} />
              <Route path="public/69b0449d6737c09ddb24e807" element={<PublicFormBerater />} />
              <Route path="public/69b0449ea6dca0c5c7b66201" element={<PublicFormProjekte />} />
              {/* <public:routes> */}
              {/* </public:routes> */}
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
      </ErrorBusProvider>
    </ErrorBoundary>
  );
}
