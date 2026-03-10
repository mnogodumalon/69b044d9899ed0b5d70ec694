import { useState, useEffect } from 'react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import type { Projekte, Kunden, Berater } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ProjekteDialog } from '@/components/dialogs/ProjekteDialog';
import { ProjekteViewDialog } from '@/components/dialogs/ProjekteViewDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageShell } from '@/components/PageShell';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

export default function ProjektePage() {
  const [records, setRecords] = useState<Projekte[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Projekte | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Projekte | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Projekte | null>(null);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [kundenList, setKundenList] = useState<Kunden[]>([]);
  const [beraterList, setBeraterList] = useState<Berater[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [mainData, kundenData, beraterData] = await Promise.all([
        LivingAppsService.getProjekte(),
        LivingAppsService.getKunden(),
        LivingAppsService.getBerater(),
      ]);
      setRecords(mainData);
      setKundenList(kundenData);
      setBeraterList(beraterData);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(fields: Projekte['fields']) {
    await LivingAppsService.createProjekteEntry(fields);
    await loadData();
    setDialogOpen(false);
  }

  async function handleUpdate(fields: Projekte['fields']) {
    if (!editingRecord) return;
    await LivingAppsService.updateProjekteEntry(editingRecord.record_id, fields);
    await loadData();
    setEditingRecord(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await LivingAppsService.deleteProjekteEntry(deleteTarget.record_id);
    setRecords(prev => prev.filter(r => r.record_id !== deleteTarget.record_id));
    setDeleteTarget(null);
  }

  function getKundenDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return kundenList.find(r => r.record_id === id)?.fields.organisation ?? '—';
  }

  function getBeraterDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return beraterList.find(r => r.record_id === id)?.fields.vorname ?? '—';
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
      title="Projekte"
      subtitle={`${records.length} Projekte im System`}
      action={
        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Hinzufügen
        </Button>
      }
    >
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Projekte suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('projektnummer')}>
                <span className="inline-flex items-center gap-1">
                  Projektnummer
                  {sortKey === 'projektnummer' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('projektname')}>
                <span className="inline-flex items-center gap-1">
                  Projektname
                  {sortKey === 'projektname' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('kunde')}>
                <span className="inline-flex items-center gap-1">
                  Kunde
                  {sortKey === 'kunde' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('kategorie')}>
                <span className="inline-flex items-center gap-1">
                  Projektkategorie
                  {sortKey === 'kategorie' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('projektleiter')}>
                <span className="inline-flex items-center gap-1">
                  Projektleiter
                  {sortKey === 'projektleiter' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('partner')}>
                <span className="inline-flex items-center gap-1">
                  Partner / Kooperationspartner
                  {sortKey === 'partner' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('status')}>
                <span className="inline-flex items-center gap-1">
                  Projektstand
                  {sortKey === 'status' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('beginn')}>
                <span className="inline-flex items-center gap-1">
                  Projektbeginn
                  {sortKey === 'beginn' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('projektstand_beschreibung')}>
                <span className="inline-flex items-center gap-1">
                  Aktueller Projektstand
                  {sortKey === 'projektstand_beschreibung' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('naechster_schritt')}>
                <span className="inline-flex items-center gap-1">
                  Nächster Schritt
                  {sortKey === 'naechster_schritt' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('beschreibung')}>
                <span className="inline-flex items-center gap-1">
                  Projektbeschreibung
                  {sortKey === 'beschreibung' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('eigene_rolle')}>
                <span className="inline-flex items-center gap-1">
                  Eigene Rolle im Projekt
                  {sortKey === 'eigene_rolle' ? (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="w-24">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortRecords(filtered).map(record => (
              <TableRow key={record.record_id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) return; setViewingRecord(record); }}>
                <TableCell className="font-medium">{record.fields.projektnummer ?? '—'}</TableCell>
                <TableCell>{record.fields.projektname ?? '—'}</TableCell>
                <TableCell>{getKundenDisplayName(record.fields.kunde)}</TableCell>
                <TableCell><Badge variant="secondary">{record.fields.kategorie?.label ?? '—'}</Badge></TableCell>
                <TableCell>{getBeraterDisplayName(record.fields.projektleiter)}</TableCell>
                <TableCell>{record.fields.partner ?? '—'}</TableCell>
                <TableCell><Badge variant="secondary">{record.fields.status?.label ?? '—'}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(record.fields.beginn)}</TableCell>
                <TableCell className="max-w-xs"><span className="truncate block">{record.fields.projektstand_beschreibung ?? '—'}</span></TableCell>
                <TableCell className="max-w-xs"><span className="truncate block">{record.fields.naechster_schritt ?? '—'}</span></TableCell>
                <TableCell className="max-w-xs"><span className="truncate block">{record.fields.beschreibung ?? '—'}</span></TableCell>
                <TableCell>{record.fields.eigene_rolle ?? '—'}</TableCell>
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
                <TableCell colSpan={13} className="text-center py-16 text-muted-foreground">
                  {search ? 'Keine Ergebnisse gefunden.' : 'Noch keine Projekte. Jetzt hinzufügen!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProjekteDialog
        open={dialogOpen || !!editingRecord}
        onClose={() => { setDialogOpen(false); setEditingRecord(null); }}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        defaultValues={editingRecord?.fields}
        kundenList={kundenList}
        beraterList={beraterList}
        enablePhotoScan={AI_PHOTO_SCAN['Projekte']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Projekte']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Projekte löschen"
        description="Soll dieser Eintrag wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
      />

      <ProjekteViewDialog
        open={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
        onEdit={(r) => { setViewingRecord(null); setEditingRecord(r); }}
        kundenList={kundenList}
        beraterList={beraterList}
      />
    </PageShell>
  );
}