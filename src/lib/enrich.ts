import type { EnrichedAngebote, EnrichedProjekte, EnrichedRechnungen, EnrichedRechnungsliste } from '@/types/enriched';
import type { Angebote, Berater, Kunden, Leistungskatalog, Projekte, Rechnungen, Rechnungsliste } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface AngeboteMaps {
  projekteMap: Map<string, Projekte>;
  leistungskatalogMap: Map<string, Leistungskatalog>;
}

export function enrichAngebote(
  angebote: Angebote[],
  maps: AngeboteMaps
): EnrichedAngebote[] {
  return angebote.map(r => ({
    ...r,
    projektName: resolveDisplay(r.fields.projekt, maps.projekteMap, 'projektnummer'),
    leistungenName: resolveDisplay(r.fields.leistungen, maps.leistungskatalogMap, 'leistungsbezeichnung'),
  }));
}

interface RechnungenMaps {
  projekteMap: Map<string, Projekte>;
  leistungskatalogMap: Map<string, Leistungskatalog>;
}

export function enrichRechnungen(
  rechnungen: Rechnungen[],
  maps: RechnungenMaps
): EnrichedRechnungen[] {
  return rechnungen.map(r => ({
    ...r,
    projektName: resolveDisplay(r.fields.projekt, maps.projekteMap, 'projektnummer'),
    leistungenName: resolveDisplay(r.fields.leistungen, maps.leistungskatalogMap, 'leistungsbezeichnung'),
  }));
}

interface RechnungslisteMaps {
  rechnungenMap: Map<string, Rechnungen>;
  angeboteMap: Map<string, Angebote>;
  projekteMap: Map<string, Projekte>;
  kundenMap: Map<string, Kunden>;
}

export function enrichRechnungsliste(
  rechnungsliste: Rechnungsliste[],
  maps: RechnungslisteMaps
): EnrichedRechnungsliste[] {
  return rechnungsliste.map(r => ({
    ...r,
    rechnungName: resolveDisplay(r.fields.rechnung, maps.rechnungenMap, 'rechnungsnummer'),
    zugehoeriges_angebotName: resolveDisplay(r.fields.zugehoeriges_angebot, maps.angeboteMap, 'angebotsnummer'),
    projektName: resolveDisplay(r.fields.projekt, maps.projekteMap, 'projektnummer'),
    kundeName: resolveDisplay(r.fields.kunde, maps.kundenMap, 'organisation'),
  }));
}

interface ProjekteMaps {
  kundenMap: Map<string, Kunden>;
  beraterMap: Map<string, Berater>;
}

export function enrichProjekte(
  projekte: Projekte[],
  maps: ProjekteMaps
): EnrichedProjekte[] {
  return projekte.map(r => ({
    ...r,
    kundeName: resolveDisplay(r.fields.kunde, maps.kundenMap, 'organisation'),
    projektleiterName: resolveDisplay(r.fields.projektleiter, maps.beraterMap, 'vorname', 'nachname'),
  }));
}
