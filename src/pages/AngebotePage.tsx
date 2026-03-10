import { useState, useEffect } from 'react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import type { Angebote, Projekte, Leistungskatalog } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AngeboteDialog } from '@/components/dialogs/AngeboteDialog';
import { AngeboteViewDialog } from '@/components/dialogs/AngeboteViewDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageShell } from '@/components/PageShell';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

export default function AngebotePage() {
  const [records, setRecords] = useState<Angebote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Angebote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Angebote | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Angebote | null>(null);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [projekteList, setProjekteList] = useState<Projekte[]>([]);
  const [leistungskatalogList, setLeistungskatalogList] = useState<Leistungskatalog[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [mainData, projekteData, leistungskatalogData] = await Promise.all([
        LivingAppsService.getAngebote(),
        LivingAppsService.getProjekte(),
        LivingAppsService.getLeistungskatalog(),
      ]);
      setRecords(mainData);
      setProjekteList(projekteData);
      setLeistungskatalogList(leistungskatalogData);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(fields: Angebote['fields']) {
    await LivingAppsService.createAngeboteEntry(fields);
    await loadData();
    setDialogOpen(false);
  }

  async function handleUpdate(fields: Angebote['fields']) {
    if (!editingRecord) return;
    await LivingAppsService.updateAngeboteEntry(editingRecord.record_id, fields);
    await loadData();
    setEditingRecord(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await LivingAppsService.deleteAngeboteEntry(deleteTarget.record_id);
    setRecords(prev => prev.filter(r => r.record_id !== deleteTarget.record_id));
    setDeleteTarget(null);
  }

  function getProjekteDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return projekteList.find(r => r.record_id === id)?.fields.projektnummer ?? '—';
  }

  function getLeistungskatalogDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return leistungskatalogList.find(r => r.record_id === id)?.fields.leistungsbezeichnung ?? '—';
  }

  const filtered = records.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(r.fields).some(v => {
      if (v == null) return false;
      if (Array.isArray(v)) return v.some(item => typeof item === 'object' && item !== null && 'label' in item ? String((item as any).label).toLowerCase().includes(s) : String(item).toLowerCase().includes(s));
      if (typeof v === 'object' && 'label' in (v as any)) return String((v as any).label).toLowerCase().includes(s);
      return String(v).toLowerCase().includes(s);
    });
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PageShell
      title="Angebote"
      subtitle={`${records.length} Angebote im System`}
      action={
        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Hinzufügen
        </Button>
      }
    >
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Angebote suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('angebotsnummer')}>
                <span className="inline-flex items-center gap-1">
                  Angebotsnummer
                  {sortKey === 'angebotsnummer' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('angebotsdatum')}>
                <span className="inline-flex items-center gap-1">
                  Angebotsdatum
                  {sortKey === 'angebotsdatum' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('projekt')}>
                <span className="inline-flex items-center gap-1">
                  Projekt
                  {sortKey === 'projekt' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('leistungen')}>
                <span className="inline-flex items-center gap-1">
                  Angebotene Leistungen
                  {sortKey === 'leistungen' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('gesamtpreis')}>
                <span className="inline-flex items-center gap-1">
                  Gesamtpreis (EUR)
                  {sortKey === 'gesamtpreis' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('gueltigkeitsdatum')}>
                <span className="inline-flex items-center gap-1">
                  Gültig bis
                  {sortKey === 'gueltigkeitsdatum' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('angebotsstatus')}>
                <span className="inline-flex items-center gap-1">
                  Status
                  {sortKey === 'angebotsstatus' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('bemerkungen')}>
                <span className="inline-flex items-center gap-1">
                  Bemerkungen
                  {sortKey === 'bemerkungen' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="w-24">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortRecords(filtered).map(record => (
              <TableRow key={record.record_id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) return; setViewingRecord(record); }}>
                <TableCell className="font-medium">{record.fields.angebotsnummer ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(record.fields.angebotsdatum)}</TableCell>
                <TableCell>{getProjekteDisplayName(record.fields.projekt)}</TableCell>
                <TableCell>{getLeistungskatalogDisplayName(record.fields.leistungen)}</TableCell>
                <TableCell>{record.fields.gesamtpreis ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(record.fields.gueltigkeitsdatum)}</TableCell>
                <TableCell><Badge variant="secondary">{record.fields.angebotsstatus?.label ?? '—'}</Badge></TableCell>
                <TableCell className="max-w-xs"><span className="truncate block">{record.fields.bemerkungen ?? '—'}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(record)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                  {search ? 'Keine Ergebnisse gefunden.' : 'Noch keine Angebote. Jetzt hinzufügen!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AngeboteDialog
        open={dialogOpen || !!editingRecord}
        onClose={() => { setDialogOpen(false); setEditingRecord(null); }}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        defaultValues={editingRecord?.fields}
        projekteList={projekteList}
        leistungskatalogList={leistungskatalogList}
        enablePhotoScan={AI_PHOTO_SCAN['Angebote']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Angebote']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Angebote löschen"
        description="Soll dieser Eintrag wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
      />

      <AngeboteViewDialog
        open={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
        onEdit={(r) => { setViewingRecord(null); setEditingRecord(r); }}
        projekteList={projekteList}
        leistungskatalogList={leistungskatalogList}
      />
    </PageShell>
  );
}