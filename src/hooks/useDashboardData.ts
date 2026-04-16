import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Leistungskatalog, Angebote, Rechnungen, Kunden, Rechnungsliste, Berater, Projekte } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [leistungskatalog, setLeistungskatalog] = useState<Leistungskatalog[]>([]);
  const [angebote, setAngebote] = useState<Angebote[]>([]);
  const [rechnungen, setRechnungen] = useState<Rechnungen[]>([]);
  const [kunden, setKunden] = useState<Kunden[]>([]);
  const [rechnungsliste, setRechnungsliste] = useState<Rechnungsliste[]>([]);
  const [berater, setBerater] = useState<Berater[]>([]);
  const [projekte, setProjekte] = useState<Projekte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [leistungskatalogData, angeboteData, rechnungenData, kundenData, rechnungslisteData, beraterData, projekteData] = await Promise.all([
        LivingAppsService.getLeistungskatalog(),
        LivingAppsService.getAngebote(),
        LivingAppsService.getRechnungen(),
        LivingAppsService.getKunden(),
        LivingAppsService.getRechnungsliste(),
        LivingAppsService.getBerater(),
        LivingAppsService.getProjekte(),
      ]);
      setLeistungskatalog(leistungskatalogData);
      setAngebote(angeboteData);
      setRechnungen(rechnungenData);
      setKunden(kundenData);
      setRechnungsliste(rechnungslisteData);
      setBerater(beraterData);
      setProjekte(projekteData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [leistungskatalogData, angeboteData, rechnungenData, kundenData, rechnungslisteData, beraterData, projekteData] = await Promise.all([
          LivingAppsService.getLeistungskatalog(),
          LivingAppsService.getAngebote(),
          LivingAppsService.getRechnungen(),
          LivingAppsService.getKunden(),
          LivingAppsService.getRechnungsliste(),
          LivingAppsService.getBerater(),
          LivingAppsService.getProjekte(),
        ]);
        setLeistungskatalog(leistungskatalogData);
        setAngebote(angeboteData);
        setRechnungen(rechnungenData);
        setKunden(kundenData);
        setRechnungsliste(rechnungslisteData);
        setBerater(beraterData);
        setProjekte(projekteData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const leistungskatalogMap = useMemo(() => {
    const m = new Map<string, Leistungskatalog>();
    leistungskatalog.forEach(r => m.set(r.record_id, r));
    return m;
  }, [leistungskatalog]);

  const angeboteMap = useMemo(() => {
    const m = new Map<string, Angebote>();
    angebote.forEach(r => m.set(r.record_id, r));
    return m;
  }, [angebote]);

  const rechnungenMap = useMemo(() => {
    const m = new Map<string, Rechnungen>();
    rechnungen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [rechnungen]);

  const kundenMap = useMemo(() => {
    const m = new Map<string, Kunden>();
    kunden.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kunden]);

  const beraterMap = useMemo(() => {
    const m = new Map<string, Berater>();
    berater.forEach(r => m.set(r.record_id, r));
    return m;
  }, [berater]);

  const projekteMap = useMemo(() => {
    const m = new Map<string, Projekte>();
    projekte.forEach(r => m.set(r.record_id, r));
    return m;
  }, [projekte]);

  return { leistungskatalog, setLeistungskatalog, angebote, setAngebote, rechnungen, setRechnungen, kunden, setKunden, rechnungsliste, setRechnungsliste, berater, setBerater, projekte, setProjekte, loading, error, fetchAll, leistungskatalogMap, angeboteMap, rechnungenMap, kundenMap, beraterMap, projekteMap };
}