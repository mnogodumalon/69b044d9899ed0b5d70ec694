import { useState, useMemo, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Kunden, Berater, Leistungskatalog, Projekte, Angebote, Rechnungen, Rechnungsliste } from '@/types/app';
import { LivingAppsService, extractRecordId, cleanFieldsForApi } from '@/services/livingAppsService';
import { KundenDialog } from '@/components/dialogs/KundenDialog';
import { KundenViewDialog } from '@/components/dialogs/KundenViewDialog';
import { BeraterDialog } from '@/components/dialogs/BeraterDialog';
import { BeraterViewDialog } from '@/components/dialogs/BeraterViewDialog';
import { LeistungskatalogDialog } from '@/components/dialogs/LeistungskatalogDialog';
import { LeistungskatalogViewDialog } from '@/components/dialogs/LeistungskatalogViewDialog';
import { ProjekteDialog } from '@/components/dialogs/ProjekteDialog';
import { ProjekteViewDialog } from '@/components/dialogs/ProjekteViewDialog';
import { AngeboteDialog } from '@/components/dialogs/AngeboteDialog';
import { AngeboteViewDialog } from '@/components/dialogs/AngeboteViewDialog';
import { RechnungenDialog } from '@/components/dialogs/RechnungenDialog';
import { RechnungenViewDialog } from '@/components/dialogs/RechnungenViewDialog';
import { RechnungslisteDialog } from '@/components/dialogs/RechnungslisteDialog';
import { RechnungslisteViewDialog } from '@/components/dialogs/RechnungslisteViewDialog';
import { BulkEditDialog } from '@/components/dialogs/BulkEditDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageShell } from '@/components/PageShell';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Plus, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, Search, Copy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function fmtDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

// Field metadata per entity for bulk edit and column filters
const KUNDEN_FIELDS = [
  { key: 'organisation', label: 'Organisation / Firma', type: 'string/text' },
  { key: 'ansprechperson_vorname', label: 'Vorname Ansprechpartner', type: 'string/text' },
  { key: 'ansprechperson_nachname', label: 'Nachname Ansprechpartner', type: 'string/text' },
  { key: 'email', label: 'E-Mail', type: 'string/email' },
  { key: 'telefon', label: 'Telefon', type: 'string/tel' },
  { key: 'strasse', label: 'Straße', type: 'string/text' },
  { key: 'hausnummer', label: 'Hausnummer', type: 'string/text' },
  { key: 'postleitzahl', label: 'Postleitzahl', type: 'string/text' },
  { key: 'stadt', label: 'Stadt', type: 'string/text' },
  { key: 'notizen', label: 'Notizen', type: 'string/textarea' },
];
const BERATER_FIELDS = [
  { key: 'vorname', label: 'Vorname', type: 'string/text' },
  { key: 'nachname', label: 'Nachname', type: 'string/text' },
  { key: 'kuerzel', label: 'Kürzel', type: 'string/text' },
  { key: 'rolle', label: 'Rolle', type: 'lookup/select', options: [{ key: 'geschaeftsfuehrer', label: 'Geschäftsführer' }, { key: 'berater', label: 'Berater' }, { key: 'coach', label: 'Coach' }, { key: 'projektentwickler', label: 'Projektentwickler' }, { key: 'interimsmanager', label: 'Interimsmanager' }, { key: 'moderator', label: 'Moderator' }, { key: 'externer_partner', label: 'Externer Partner' }] },
  { key: 'status', label: 'Status', type: 'lookup/select', options: [{ key: 'aktiv', label: 'Aktiv' }, { key: 'verfuegbar', label: 'Verfügbar' }, { key: 'ausgelastet', label: 'Ausgelastet' }, { key: 'inaktiv', label: 'Inaktiv' }] },
  { key: 'email', label: 'E-Mail', type: 'string/email' },
  { key: 'telefon', label: 'Telefon', type: 'string/tel' },
  { key: 'kompetenzen', label: 'Kompetenzen / Schwerpunkte', type: 'string/textarea' },
];
const LEISTUNGSKATALOG_FIELDS = [
  { key: 'kategorie', label: 'Kategorie', type: 'lookup/select', options: [{ key: 'sb', label: 'Strategieberatung (SB)' }, { key: 'co', label: 'Coaching (CO)' }, { key: 'pe', label: 'Personalprojekte (PE)' }, { key: 'ig', label: 'Interimsgeschäftsführung (IG)' }, { key: 'ib', label: 'Inklusionsbetriebe (IB)' }, { key: 'pi', label: 'Projekte Inklusion (PI)' }, { key: 'wo', label: 'Workshops/Seminare (WO)' }, { key: 'ip', label: 'Immobilienprojekte (IP)' }, { key: 'it', label: 'IT-Projekte (IT)' }, { key: 'so', label: 'Sonstiges (SO)' }] },
  { key: 'beschreibung', label: 'Beschreibung', type: 'string/textarea' },
  { key: 'standardpreis', label: 'Standardpreis (EUR)', type: 'number' },
  { key: 'einheit', label: 'Einheit', type: 'lookup/select', options: [{ key: 'stunde', label: 'pro Stunde' }, { key: 'tag', label: 'pro Tag' }, { key: 'pauschal', label: 'Pauschal' }, { key: 'monat', label: 'pro Monat' }] },
  { key: 'notizen', label: 'Interne Notizen', type: 'string/textarea' },
  { key: 'leistungsbezeichnung', label: 'Leistungsbezeichnung', type: 'string/text' },
];
const PROJEKTE_FIELDS = [
  { key: 'projektnummer', label: 'Projektnummer', type: 'string/text' },
  { key: 'projektname', label: 'Projektname', type: 'string/text' },
  { key: 'kunde', label: 'Kunde', type: 'applookup/select', targetEntity: 'kunden', targetAppId: 'KUNDEN', displayField: 'organisation' },
  { key: 'kategorie', label: 'Projektkategorie', type: 'lookup/select', options: [{ key: 'sb', label: 'Strategieberatung (SB)' }, { key: 'co', label: 'Coaching (CO)' }, { key: 'pe', label: 'Personalprojekte (PE)' }, { key: 'ig', label: 'Interimsgeschäftsführung (IG)' }, { key: 'ib', label: 'Inklusionsbetriebe (IB)' }, { key: 'pi', label: 'Projekte Inklusion (PI)' }, { key: 'wo', label: 'Workshops/Seminare (WO)' }, { key: 'ip', label: 'Immobilienprojekte (IP)' }, { key: 'it', label: 'IT-Projekte (IT)' }, { key: 'so', label: 'Sonstiges (SO)' }] },
  { key: 'projektleiter', label: 'Projektleiter', type: 'applookup/select', targetEntity: 'berater', targetAppId: 'BERATER', displayField: 'vorname' },
  { key: 'partner', label: 'Partner / Kooperationspartner', type: 'string/text' },
  { key: 'status', label: 'Projektstand', type: 'lookup/select', options: [{ key: 'aktuell', label: '1 - Aktuell' }, { key: 'akquise', label: '2 - Akquise' }, { key: 'abgeschlossen', label: '3 - Abgeschlossen' }] },
  { key: 'beginn', label: 'Projektbeginn', type: 'date/date' },
  { key: 'projektstand_beschreibung', label: 'Aktueller Projektstand', type: 'string/textarea' },
  { key: 'naechster_schritt', label: 'Nächster Schritt', type: 'string/textarea' },
  { key: 'beschreibung', label: 'Projektbeschreibung', type: 'string/textarea' },
  { key: 'eigene_rolle', label: 'Eigene Rolle im Projekt', type: 'string/text' },
];
const ANGEBOTE_FIELDS = [
  { key: 'angebotsnummer', label: 'Angebotsnummer', type: 'string/text' },
  { key: 'angebotsdatum', label: 'Angebotsdatum', type: 'date/date' },
  { key: 'projekt', label: 'Projekt', type: 'applookup/select', targetEntity: 'projekte', targetAppId: 'PROJEKTE', displayField: 'projektnummer' },
  { key: 'leistungen', label: 'Angebotene Leistungen', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsbezeichnung' },
  { key: 'gesamtpreis', label: 'Gesamtpreis (EUR)', type: 'number' },
  { key: 'gueltigkeitsdatum', label: 'Gültig bis', type: 'date/date' },
  { key: 'angebotsstatus', label: 'Status', type: 'lookup/select', options: [{ key: 'entwurf', label: 'Entwurf' }, { key: 'versendet', label: 'Versendet' }, { key: 'angenommen', label: 'Angenommen' }, { key: 'abgelehnt', label: 'Abgelehnt' }] },
  { key: 'bemerkungen', label: 'Bemerkungen', type: 'string/textarea' },
];
const RECHNUNGEN_FIELDS = [
  { key: 'rechnungsnummer', label: 'Rechnungsnummer', type: 'string/text' },
  { key: 'rechnungsdatum', label: 'Rechnungsdatum', type: 'date/date' },
  { key: 'projekt', label: 'Projekt', type: 'applookup/select', targetEntity: 'projekte', targetAppId: 'PROJEKTE', displayField: 'projektnummer' },
  { key: 'leistungen', label: 'Abgerechnete Leistungen', type: 'applookup/select', targetEntity: 'leistungskatalog', targetAppId: 'LEISTUNGSKATALOG', displayField: 'leistungsbezeichnung' },
  { key: 'rechnungsbetrag', label: 'Rechnungsbetrag (EUR)', type: 'number' },
  { key: 'faelligkeitsdatum', label: 'Fälligkeitsdatum', type: 'date/date' },
  { key: 'zahlungsstatus', label: 'Zahlungsstatus', type: 'lookup/select', options: [{ key: 'offen', label: 'Offen' }, { key: 'bezahlt', label: 'Bezahlt' }, { key: 'ueberfaellig', label: 'Überfällig' }, { key: 'teilweise_bezahlt', label: 'Teilweise bezahlt' }, { key: 'storniert', label: 'Storniert' }] },
  { key: 'zahlungsdatum', label: 'Zahlungsdatum', type: 'date/date' },
  { key: 'bemerkungen', label: 'Bemerkungen', type: 'string/textarea' },
];
const RECHNUNGSLISTE_FIELDS = [
  { key: 'rechnung', label: 'Rechnung', type: 'applookup/select', targetEntity: 'rechnungen', targetAppId: 'RECHNUNGEN', displayField: 'rechnungsnummer' },
  { key: 'zugehoeriges_angebot', label: 'Zugehöriges Angebot', type: 'applookup/select', targetEntity: 'angebote', targetAppId: 'ANGEBOTE', displayField: 'angebotsnummer' },
  { key: 'projekt', label: 'Projekt', type: 'applookup/select', targetEntity: 'projekte', targetAppId: 'PROJEKTE', displayField: 'projektnummer' },
  { key: 'kunde', label: 'Kunde', type: 'applookup/select', targetEntity: 'kunden', targetAppId: 'KUNDEN', displayField: 'organisation' },
  { key: 'rechnungsdatum', label: 'Rechnungsdatum', type: 'date/date' },
  { key: 'rechnungsbetrag', label: 'Rechnungsbetrag (EUR)', type: 'number' },
  { key: 'zahlungsstatus', label: 'Zahlungsstatus', type: 'lookup/select', options: [{ key: 'offen', label: 'Offen' }, { key: 'bezahlt', label: 'Bezahlt' }, { key: 'ueberfaellig', label: 'Überfällig' }, { key: 'teilweise_bezahlt', label: 'Teilweise bezahlt' }, { key: 'storniert', label: 'Storniert' }] },
  { key: 'bemerkungen', label: 'Bemerkungen', type: 'string/textarea' },
];

const ENTITY_TABS = [
  { key: 'kunden', label: 'Kunden', pascal: 'Kunden' },
  { key: 'berater', label: 'Berater', pascal: 'Berater' },
  { key: 'leistungskatalog', label: 'Leistungskatalog', pascal: 'Leistungskatalog' },
  { key: 'projekte', label: 'Projekte', pascal: 'Projekte' },
  { key: 'angebote', label: 'Angebote', pascal: 'Angebote' },
  { key: 'rechnungen', label: 'Rechnungen', pascal: 'Rechnungen' },
  { key: 'rechnungsliste', label: 'Rechnungsliste', pascal: 'Rechnungsliste' },
] as const;

type EntityKey = typeof ENTITY_TABS[number]['key'];

export default function AdminPage() {
  const data = useDashboardData();
  const { loading, error, fetchAll } = data;

  const [activeTab, setActiveTab] = useState<EntityKey>('kunden');
  const [selectedIds, setSelectedIds] = useState<Record<EntityKey, Set<string>>>(() => ({
    kunden: new Set(),
    berater: new Set(),
    leistungskatalog: new Set(),
    projekte: new Set(),
    angebote: new Set(),
    rechnungen: new Set(),
    rechnungsliste: new Set(),
  }));
  const [filters, setFilters] = useState<Record<EntityKey, Record<string, string>>>(() => ({
    kunden: {},
    berater: {},
    leistungskatalog: {},
    projekte: {},
    angebote: {},
    rechnungen: {},
    rechnungsliste: {},
  }));
  const [showFilters, setShowFilters] = useState(false);
  const [dialogState, setDialogState] = useState<{ entity: EntityKey; record: any } | null>(null);
  const [createEntity, setCreateEntity] = useState<EntityKey | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<{ entity: EntityKey; ids: string[] } | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState<EntityKey | null>(null);
  const [viewState, setViewState] = useState<{ entity: EntityKey; record: any } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const getRecords = useCallback((entity: EntityKey) => {
    switch (entity) {
      case 'kunden': return (data as any).kunden as Kunden[] ?? [];
      case 'berater': return (data as any).berater as Berater[] ?? [];
      case 'leistungskatalog': return (data as any).leistungskatalog as Leistungskatalog[] ?? [];
      case 'projekte': return (data as any).projekte as Projekte[] ?? [];
      case 'angebote': return (data as any).angebote as Angebote[] ?? [];
      case 'rechnungen': return (data as any).rechnungen as Rechnungen[] ?? [];
      case 'rechnungsliste': return (data as any).rechnungsliste as Rechnungsliste[] ?? [];
      default: return [];
    }
  }, [data]);

  const getLookupLists = useCallback((entity: EntityKey) => {
    const lists: Record<string, any[]> = {};
    switch (entity) {
      case 'projekte':
        lists.kundenList = (data as any).kunden ?? [];
        lists.beraterList = (data as any).berater ?? [];
        break;
      case 'angebote':
        lists.projekteList = (data as any).projekte ?? [];
        lists.leistungskatalogList = (data as any).leistungskatalog ?? [];
        break;
      case 'rechnungen':
        lists.projekteList = (data as any).projekte ?? [];
        lists.leistungskatalogList = (data as any).leistungskatalog ?? [];
        break;
      case 'rechnungsliste':
        lists.rechnungenList = (data as any).rechnungen ?? [];
        lists.angeboteList = (data as any).angebote ?? [];
        lists.projekteList = (data as any).projekte ?? [];
        lists.kundenList = (data as any).kunden ?? [];
        break;
    }
    return lists;
  }, [data]);

  const getApplookupDisplay = useCallback((entity: EntityKey, fieldKey: string, url?: unknown) => {
    if (!url) return '—';
    const id = extractRecordId(url);
    if (!id) return '—';
    const lists = getLookupLists(entity);
    if (entity === 'projekte' && fieldKey === 'kunde') {
      const match = (lists.kundenList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.organisation ?? '—';
    }
    if (entity === 'projekte' && fieldKey === 'projektleiter') {
      const match = (lists.beraterList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.vorname ?? '—';
    }
    if (entity === 'angebote' && fieldKey === 'projekt') {
      const match = (lists.projekteList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.projektnummer ?? '—';
    }
    if (entity === 'angebote' && fieldKey === 'leistungen') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsbezeichnung ?? '—';
    }
    if (entity === 'rechnungen' && fieldKey === 'projekt') {
      const match = (lists.projekteList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.projektnummer ?? '—';
    }
    if (entity === 'rechnungen' && fieldKey === 'leistungen') {
      const match = (lists.leistungskatalogList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.leistungsbezeichnung ?? '—';
    }
    if (entity === 'rechnungsliste' && fieldKey === 'rechnung') {
      const match = (lists.rechnungenList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.rechnungsnummer ?? '—';
    }
    if (entity === 'rechnungsliste' && fieldKey === 'zugehoeriges_angebot') {
      const match = (lists.angeboteList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.angebotsnummer ?? '—';
    }
    if (entity === 'rechnungsliste' && fieldKey === 'projekt') {
      const match = (lists.projekteList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.projektnummer ?? '—';
    }
    if (entity === 'rechnungsliste' && fieldKey === 'kunde') {
      const match = (lists.kundenList ?? []).find((r: any) => r.record_id === id);
      return match?.fields.organisation ?? '—';
    }
    return url;
  }, [getLookupLists]);

  const getFieldMeta = useCallback((entity: EntityKey) => {
    switch (entity) {
      case 'kunden': return KUNDEN_FIELDS;
      case 'berater': return BERATER_FIELDS;
      case 'leistungskatalog': return LEISTUNGSKATALOG_FIELDS;
      case 'projekte': return PROJEKTE_FIELDS;
      case 'angebote': return ANGEBOTE_FIELDS;
      case 'rechnungen': return RECHNUNGEN_FIELDS;
      case 'rechnungsliste': return RECHNUNGSLISTE_FIELDS;
      default: return [];
    }
  }, []);

  const getFilteredRecords = useCallback((entity: EntityKey) => {
    const records = getRecords(entity);
    const s = search.toLowerCase();
    const searched = !s ? records : records.filter((r: any) => {
      return Object.values(r.fields).some((v: any) => {
        if (v == null) return false;
        if (Array.isArray(v)) return v.some((item: any) => typeof item === 'object' && item !== null && 'label' in item ? String((item as any).label).toLowerCase().includes(s) : String(item).toLowerCase().includes(s));
        if (typeof v === 'object' && 'label' in (v as any)) return String((v as any).label).toLowerCase().includes(s);
        return String(v).toLowerCase().includes(s);
      });
    });
    const entityFilters = filters[entity] ?? {};
    const fieldMeta = getFieldMeta(entity);
    return searched.filter((r: any) => {
      return fieldMeta.every((fm: any) => {
        const fv = entityFilters[fm.key];
        if (!fv || fv === '') return true;
        const val = r.fields?.[fm.key];
        if (fm.type === 'bool') {
          if (fv === 'true') return val === true;
          if (fv === 'false') return val !== true;
          return true;
        }
        if (fm.type === 'lookup/select' || fm.type === 'lookup/radio') {
          const label = val && typeof val === 'object' && 'label' in val ? val.label : '';
          return String(label).toLowerCase().includes(fv.toLowerCase());
        }
        if (fm.type.includes('multiplelookup')) {
          if (!Array.isArray(val)) return false;
          return val.some((item: any) => String(item?.label ?? '').toLowerCase().includes(fv.toLowerCase()));
        }
        if (fm.type.includes('applookup')) {
          const display = getApplookupDisplay(entity, fm.key, val);
          return String(display).toLowerCase().includes(fv.toLowerCase());
        }
        return String(val ?? '').toLowerCase().includes(fv.toLowerCase());
      });
    });
  }, [getRecords, filters, getFieldMeta, getApplookupDisplay, search]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(''); setSortDir('asc'); }
    } else { setSortKey(key); setSortDir('asc'); }
  }

  function sortRecords<T extends { fields: Record<string, any> }>(recs: T[]): T[] {
    if (!sortKey) return recs;
    return [...recs].sort((a, b) => {
      let va: any = a.fields[sortKey], vb: any = b.fields[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'object' && 'label' in va) va = va.label;
      if (typeof vb === 'object' && 'label' in vb) vb = vb.label;
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  const toggleSelect = useCallback((entity: EntityKey, id: string) => {
    setSelectedIds(prev => {
      const next = { ...prev, [entity]: new Set(prev[entity]) };
      if (next[entity].has(id)) next[entity].delete(id);
      else next[entity].add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((entity: EntityKey) => {
    const filtered = getFilteredRecords(entity);
    setSelectedIds(prev => {
      const allSelected = filtered.every((r: any) => prev[entity].has(r.record_id));
      const next = { ...prev, [entity]: new Set(prev[entity]) };
      if (allSelected) {
        filtered.forEach((r: any) => next[entity].delete(r.record_id));
      } else {
        filtered.forEach((r: any) => next[entity].add(r.record_id));
      }
      return next;
    });
  }, [getFilteredRecords]);

  const clearSelection = useCallback((entity: EntityKey) => {
    setSelectedIds(prev => ({ ...prev, [entity]: new Set() }));
  }, []);

  const getServiceMethods = useCallback((entity: EntityKey) => {
    switch (entity) {
      case 'kunden': return {
        create: (fields: any) => LivingAppsService.createKundenEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateKundenEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteKundenEntry(id),
      };
      case 'berater': return {
        create: (fields: any) => LivingAppsService.createBeraterEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateBeraterEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteBeraterEntry(id),
      };
      case 'leistungskatalog': return {
        create: (fields: any) => LivingAppsService.createLeistungskatalogEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateLeistungskatalogEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteLeistungskatalogEntry(id),
      };
      case 'projekte': return {
        create: (fields: any) => LivingAppsService.createProjekteEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateProjekteEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteProjekteEntry(id),
      };
      case 'angebote': return {
        create: (fields: any) => LivingAppsService.createAngeboteEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateAngeboteEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteAngeboteEntry(id),
      };
      case 'rechnungen': return {
        create: (fields: any) => LivingAppsService.createRechnungenEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateRechnungenEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteRechnungenEntry(id),
      };
      case 'rechnungsliste': return {
        create: (fields: any) => LivingAppsService.createRechnungslisteEntry(fields),
        update: (id: string, fields: any) => LivingAppsService.updateRechnungslisteEntry(id, fields),
        remove: (id: string) => LivingAppsService.deleteRechnungslisteEntry(id),
      };
      default: return null;
    }
  }, []);

  async function handleCreate(entity: EntityKey, fields: any) {
    const svc = getServiceMethods(entity);
    if (!svc) return;
    await svc.create(fields);
    fetchAll();
    setCreateEntity(null);
  }

  async function handleUpdate(fields: any) {
    if (!dialogState) return;
    const svc = getServiceMethods(dialogState.entity);
    if (!svc) return;
    await svc.update(dialogState.record.record_id, fields);
    fetchAll();
    setDialogState(null);
  }

  async function handleBulkDelete() {
    if (!deleteTargets) return;
    const svc = getServiceMethods(deleteTargets.entity);
    if (!svc) return;
    setBulkLoading(true);
    try {
      for (const id of deleteTargets.ids) {
        await svc.remove(id);
      }
      clearSelection(deleteTargets.entity);
      fetchAll();
    } finally {
      setBulkLoading(false);
      setDeleteTargets(null);
    }
  }

  async function handleBulkClone() {
    const svc = getServiceMethods(activeTab);
    if (!svc) return;
    setBulkLoading(true);
    try {
      const records = getRecords(activeTab);
      const ids = Array.from(selectedIds[activeTab]);
      for (const id of ids) {
        const rec = records.find((r: any) => r.record_id === id);
        if (!rec) continue;
        const clean = cleanFieldsForApi(rec.fields, activeTab);
        await svc.create(clean as any);
      }
      clearSelection(activeTab);
      fetchAll();
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkEdit(fieldKey: string, value: any) {
    if (!bulkEditOpen) return;
    const svc = getServiceMethods(bulkEditOpen);
    if (!svc) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds[bulkEditOpen]);
      for (const id of ids) {
        await svc.update(id, { [fieldKey]: value });
      }
      clearSelection(bulkEditOpen);
      fetchAll();
    } finally {
      setBulkLoading(false);
      setBulkEditOpen(null);
    }
  }

  function updateFilter(entity: EntityKey, fieldKey: string, value: string) {
    setFilters(prev => ({
      ...prev,
      [entity]: { ...prev[entity], [fieldKey]: value },
    }));
  }

  function clearEntityFilters(entity: EntityKey) {
    setFilters(prev => ({ ...prev, [entity]: {} }));
  }

  const activeFilterCount = useMemo(() => {
    const f = filters[activeTab] ?? {};
    return Object.values(f).filter(v => v && v !== '').length;
  }, [filters, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-destructive">{error.message}</p>
        <Button onClick={fetchAll}>Erneut versuchen</Button>
      </div>
    );
  }

  const filtered = getFilteredRecords(activeTab);
  const sel = selectedIds[activeTab];
  const allFiltered = filtered.every((r: any) => sel.has(r.record_id)) && filtered.length > 0;
  const fieldMeta = getFieldMeta(activeTab);

  return (
    <PageShell
      title="Verwaltung"
      subtitle="Alle Daten verwalten"
      action={
        <Button onClick={() => setCreateEntity(activeTab)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Hinzufügen
        </Button>
      }
    >
      <div className="flex gap-2 flex-wrap">
        {ENTITY_TABS.map(tab => {
          const count = getRecords(tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); setSortKey(''); setSortDir('asc'); fetchAll(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(f => !f)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filtern
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => clearEntityFilters(activeTab)}>
              Filter zurücksetzen
            </Button>
          )}
        </div>
        {sel.size > 0 && (
          <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-1.5">
            <span className="text-sm font-medium">{sel.size} ausgewählt</span>
            <Button variant="outline" size="sm" onClick={() => setBulkEditOpen(activeTab)}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Feld bearbeiten
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkClone()}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Kopieren
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteTargets({ entity: activeTab, ids: Array.from(sel) })}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Ausgewählte löschen
            </Button>
            <Button variant="ghost" size="sm" onClick={() => clearSelection(activeTab)}>
              <X className="h-3.5 w-3.5 mr-1" /> Auswahl aufheben
            </Button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 rounded-lg border bg-muted/30">
          {fieldMeta.map((fm: any) => (
            <div key={fm.key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{fm.label}</label>
              {fm.type === 'bool' ? (
                <Select value={filters[activeTab]?.[fm.key] ?? ''} onValueChange={v => updateFilter(activeTab, fm.key, v === 'all' ? '' : v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Alle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nein</SelectItem>
                  </SelectContent>
                </Select>
              ) : fm.type === 'lookup/select' || fm.type === 'lookup/radio' ? (
                <Select value={filters[activeTab]?.[fm.key] ?? ''} onValueChange={v => updateFilter(activeTab, fm.key, v === 'all' ? '' : v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Alle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    {fm.options?.map((o: any) => (
                      <SelectItem key={o.key} value={o.label}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="h-8 text-xs"
                  placeholder="Filtern..."
                  value={filters[activeTab]?.[fm.key] ?? ''}
                  onChange={e => updateFilter(activeTab, fm.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allFiltered}
                  onCheckedChange={() => toggleSelectAll(activeTab)}
                />
              </TableHead>
              {fieldMeta.map((fm: any) => (
                <TableHead key={fm.key} className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort(fm.key)}>
                  <span className="inline-flex items-center gap-1">
                    {fm.label}
                    {sortKey === fm.key ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                  </span>
                </TableHead>
              ))}
              <TableHead className="w-24">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortRecords(filtered).map((record: any) => (
              <TableRow key={record.record_id} className={`transition-colors cursor-pointer ${sel.has(record.record_id) ? "bg-primary/5" : "hover:bg-muted/50"}`} onClick={(e) => { if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) return; setViewState({ entity: activeTab, record }); }}>
                <TableCell>
                  <Checkbox
                    checked={sel.has(record.record_id)}
                    onCheckedChange={() => toggleSelect(activeTab, record.record_id)}
                  />
                </TableCell>
                {fieldMeta.map((fm: any) => {
                  const val = record.fields?.[fm.key];
                  if (fm.type === 'bool') {
                    return (
                      <TableCell key={fm.key}>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          val ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {val ? 'Ja' : 'Nein'}
                        </span>
                      </TableCell>
                    );
                  }
                  if (fm.type === 'lookup/select' || fm.type === 'lookup/radio') {
                    return <TableCell key={fm.key}><Badge variant="secondary">{val?.label ?? '—'}</Badge></TableCell>;
                  }
                  if (fm.type.includes('multiplelookup')) {
                    return <TableCell key={fm.key}>{Array.isArray(val) ? val.map((v: any) => v?.label ?? v).join(', ') : '—'}</TableCell>;
                  }
                  if (fm.type.includes('applookup')) {
                    return <TableCell key={fm.key}>{getApplookupDisplay(activeTab, fm.key, val)}</TableCell>;
                  }
                  if (fm.type.includes('date')) {
                    return <TableCell key={fm.key} className="text-muted-foreground">{fmtDate(val)}</TableCell>;
                  }
                  if (fm.type.startsWith('file')) {
                    return (
                      <TableCell key={fm.key}>
                        {val ? (
                          <div className="relative h-8 w-8 rounded bg-muted overflow-hidden">
                            <img src={val} alt="" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          </div>
                        ) : '—'}
                      </TableCell>
                    );
                  }
                  if (fm.type === 'string/textarea') {
                    return <TableCell key={fm.key} className="max-w-xs"><span className="truncate block">{val ?? '—'}</span></TableCell>;
                  }
                  if (fm.type === 'geo') {
                    return (
                      <TableCell key={fm.key} className="max-w-[200px]">
                        <span className="truncate block" title={val ? `${val.lat}, ${val.long}` : undefined}>
                          {val?.info ?? (val ? `${val.lat?.toFixed(4)}, ${val.long?.toFixed(4)}` : '—')}
                        </span>
                      </TableCell>
                    );
                  }
                  return <TableCell key={fm.key}>{val ?? '—'}</TableCell>;
                })}
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setDialogState({ entity: activeTab, record })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTargets({ entity: activeTab, ids: [record.record_id] })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={fieldMeta.length + 2} className="text-center py-16 text-muted-foreground">
                  Keine Ergebnisse gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(createEntity === 'kunden' || dialogState?.entity === 'kunden') && (
        <KundenDialog
          open={createEntity === 'kunden' || dialogState?.entity === 'kunden'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'kunden' ? handleUpdate : (fields: any) => handleCreate('kunden', fields)}
          defaultValues={dialogState?.entity === 'kunden' ? dialogState.record?.fields : undefined}
          enablePhotoScan={AI_PHOTO_SCAN['Kunden']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Kunden']}
        />
      )}
      {(createEntity === 'berater' || dialogState?.entity === 'berater') && (
        <BeraterDialog
          open={createEntity === 'berater' || dialogState?.entity === 'berater'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'berater' ? handleUpdate : (fields: any) => handleCreate('berater', fields)}
          defaultValues={dialogState?.entity === 'berater' ? dialogState.record?.fields : undefined}
          enablePhotoScan={AI_PHOTO_SCAN['Berater']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Berater']}
        />
      )}
      {(createEntity === 'leistungskatalog' || dialogState?.entity === 'leistungskatalog') && (
        <LeistungskatalogDialog
          open={createEntity === 'leistungskatalog' || dialogState?.entity === 'leistungskatalog'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'leistungskatalog' ? handleUpdate : (fields: any) => handleCreate('leistungskatalog', fields)}
          defaultValues={dialogState?.entity === 'leistungskatalog' ? dialogState.record?.fields : undefined}
          enablePhotoScan={AI_PHOTO_SCAN['Leistungskatalog']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Leistungskatalog']}
        />
      )}
      {(createEntity === 'projekte' || dialogState?.entity === 'projekte') && (
        <ProjekteDialog
          open={createEntity === 'projekte' || dialogState?.entity === 'projekte'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'projekte' ? handleUpdate : (fields: any) => handleCreate('projekte', fields)}
          defaultValues={dialogState?.entity === 'projekte' ? dialogState.record?.fields : undefined}
          kundenList={(data as any).kunden ?? []}
          beraterList={(data as any).berater ?? []}
          enablePhotoScan={AI_PHOTO_SCAN['Projekte']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Projekte']}
        />
      )}
      {(createEntity === 'angebote' || dialogState?.entity === 'angebote') && (
        <AngeboteDialog
          open={createEntity === 'angebote' || dialogState?.entity === 'angebote'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'angebote' ? handleUpdate : (fields: any) => handleCreate('angebote', fields)}
          defaultValues={dialogState?.entity === 'angebote' ? dialogState.record?.fields : undefined}
          projekteList={(data as any).projekte ?? []}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
          enablePhotoScan={AI_PHOTO_SCAN['Angebote']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Angebote']}
        />
      )}
      {(createEntity === 'rechnungen' || dialogState?.entity === 'rechnungen') && (
        <RechnungenDialog
          open={createEntity === 'rechnungen' || dialogState?.entity === 'rechnungen'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'rechnungen' ? handleUpdate : (fields: any) => handleCreate('rechnungen', fields)}
          defaultValues={dialogState?.entity === 'rechnungen' ? dialogState.record?.fields : undefined}
          projekteList={(data as any).projekte ?? []}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
          enablePhotoScan={AI_PHOTO_SCAN['Rechnungen']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Rechnungen']}
        />
      )}
      {(createEntity === 'rechnungsliste' || dialogState?.entity === 'rechnungsliste') && (
        <RechnungslisteDialog
          open={createEntity === 'rechnungsliste' || dialogState?.entity === 'rechnungsliste'}
          onClose={() => { setCreateEntity(null); setDialogState(null); }}
          onSubmit={dialogState?.entity === 'rechnungsliste' ? handleUpdate : (fields: any) => handleCreate('rechnungsliste', fields)}
          defaultValues={dialogState?.entity === 'rechnungsliste' ? dialogState.record?.fields : undefined}
          rechnungenList={(data as any).rechnungen ?? []}
          angeboteList={(data as any).angebote ?? []}
          projekteList={(data as any).projekte ?? []}
          kundenList={(data as any).kunden ?? []}
          enablePhotoScan={AI_PHOTO_SCAN['Rechnungsliste']}
          enablePhotoLocation={AI_PHOTO_LOCATION['Rechnungsliste']}
        />
      )}
      {viewState?.entity === 'kunden' && (
        <KundenViewDialog
          open={viewState?.entity === 'kunden'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'kunden', record: r }); }}
        />
      )}
      {viewState?.entity === 'berater' && (
        <BeraterViewDialog
          open={viewState?.entity === 'berater'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'berater', record: r }); }}
        />
      )}
      {viewState?.entity === 'leistungskatalog' && (
        <LeistungskatalogViewDialog
          open={viewState?.entity === 'leistungskatalog'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'leistungskatalog', record: r }); }}
        />
      )}
      {viewState?.entity === 'projekte' && (
        <ProjekteViewDialog
          open={viewState?.entity === 'projekte'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'projekte', record: r }); }}
          kundenList={(data as any).kunden ?? []}
          beraterList={(data as any).berater ?? []}
        />
      )}
      {viewState?.entity === 'angebote' && (
        <AngeboteViewDialog
          open={viewState?.entity === 'angebote'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'angebote', record: r }); }}
          projekteList={(data as any).projekte ?? []}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
        />
      )}
      {viewState?.entity === 'rechnungen' && (
        <RechnungenViewDialog
          open={viewState?.entity === 'rechnungen'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'rechnungen', record: r }); }}
          projekteList={(data as any).projekte ?? []}
          leistungskatalogList={(data as any).leistungskatalog ?? []}
        />
      )}
      {viewState?.entity === 'rechnungsliste' && (
        <RechnungslisteViewDialog
          open={viewState?.entity === 'rechnungsliste'}
          onClose={() => setViewState(null)}
          record={viewState?.record}
          onEdit={(r: any) => { setViewState(null); setDialogState({ entity: 'rechnungsliste', record: r }); }}
          rechnungenList={(data as any).rechnungen ?? []}
          angeboteList={(data as any).angebote ?? []}
          projekteList={(data as any).projekte ?? []}
          kundenList={(data as any).kunden ?? []}
        />
      )}

      <BulkEditDialog
        open={!!bulkEditOpen}
        onClose={() => setBulkEditOpen(null)}
        onApply={handleBulkEdit}
        fields={bulkEditOpen ? getFieldMeta(bulkEditOpen) : []}
        selectedCount={bulkEditOpen ? selectedIds[bulkEditOpen].size : 0}
        loading={bulkLoading}
        lookupLists={bulkEditOpen ? getLookupLists(bulkEditOpen) : {}}
      />

      <ConfirmDialog
        open={!!deleteTargets}
        onClose={() => setDeleteTargets(null)}
        onConfirm={handleBulkDelete}
        title="Ausgewählte löschen"
        description={`Sollen ${deleteTargets?.ids.length ?? 0} Einträge wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`}
      />
    </PageShell>
  );
}