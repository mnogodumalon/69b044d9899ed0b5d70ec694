import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Kunden, Berater, Leistungskatalog, Projekte, Angebote, Rechnungen, Rechnungsliste } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [kunden, setKunden] = useState<Kunden[]>([]);
  const [berater, setBerater] = useState<Berater[]>([]);
  const [leistungskatalog, setLeistungskatalog] = useState<Leistungskatalog[]>([]);
  const [projekte, setProjekte] = useState<Projekte[]>([]);
  const [angebote, setAngebote] = useState<Angebote[]>([]);
  const [rechnungen, setRechnungen] = useState<Rechnungen[]>([]);
  const [rechnungsliste, setRechnungsliste] = useState<Rechnungsliste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [kundenData, beraterData, leistungskatalogData, projekteData, angeboteData, rechnungenData, rechnungslisteData] = await Promise.all([
        LivingAppsService.getKunden(),
        LivingAppsService.getBerater(),
        LivingAppsService.getLeistungskatalog(),
        LivingAppsService.getProjekte(),
        LivingAppsService.getAngebote(),
        LivingAppsService.getRechnungen(),
        LivingAppsService.getRechnungsliste(),
      ]);
      setKunden(kundenData);
      setBerater(beraterData);
      setLeistungskatalog(leistungskatalogData);
      setProjekte(projekteData);
      setAngebote(angeboteData);
      setRechnungen(rechnungenData);
      setRechnungsliste(rechnungslisteData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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

  const leistungskatalogMap = useMemo(() => {
    const m = new Map<string, Leistungskatalog>();
    leistungskatalog.forEach(r => m.set(r.record_id, r));
    return m;
  }, [leistungskatalog]);

  const projekteMap = useMemo(() => {
    const m = new Map<string, Projekte>();
    projekte.forEach(r => m.set(r.record_id, r));
    return m;
  }, [projekte]);

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

  return { kunden, setKunden, berater, setBerater, leistungskatalog, setLeistungskatalog, projekte, setProjekte, angebote, setAngebote, rechnungen, setRechnungen, rechnungsliste, setRechnungsliste, loading, error, fetchAll, kundenMap, beraterMap, leistungskatalogMap, projekteMap, angeboteMap, rechnungenMap };
}