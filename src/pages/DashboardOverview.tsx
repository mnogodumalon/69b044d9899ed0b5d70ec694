import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichProjekte, enrichAngebote, enrichRechnungen } from '@/lib/enrich';
import type { EnrichedProjekte } from '@/types/enriched';
import type { Projekte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import { Skeleton } from '@/components/ui/skeleton';
import { IconAlertCircle, IconPlus, IconTrendingUp, IconUsers, IconLayoutKanban, IconReceipt, IconCurrencyEuro, IconChevronRight, IconArrowRight, IconClock, IconCircleCheck, IconBolt, IconBuilding, IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { ProjekteDialog } from '@/components/dialogs/ProjekteDialog';
import { AngeboteDialog } from '@/components/dialogs/AngeboteDialog';
import { RechnungenDialog } from '@/components/dialogs/RechnungenDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_CONFIG = {
  akquise: { label: '2 - Akquise', color: 'bg-amber-50 border-amber-200', headerColor: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-400' },
  aktuell: { label: '1 - Aktuell', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  abgeschlossen: { label: '3 - Abgeschlossen', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-500', badge: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
};

const ZAHLUNGS_CONFIG: Record<string, { color: string; label: string }> = {
  offen: { color: 'bg-slate-100 text-slate-700', label: 'Offen' },
  bezahlt: { color: 'bg-green-100 text-green-700', label: 'Bezahlt' },
  ueberfaellig: { color: 'bg-red-100 text-red-700', label: 'Überfällig' },
  teilweise_bezahlt: { color: 'bg-amber-100 text-amber-700', label: 'Teilw. bezahlt' },
  storniert: { color: 'bg-gray-100 text-gray-500', label: 'Storniert' },
};

export default function DashboardOverview() {
  const [projektDialog, setProjektDialog] = useState<{ open: boolean; edit?: EnrichedProjekte }>({ open: false });
  const [angebotDialog, setAngebotDialog] = useState<{ open: boolean; projektId?: string }>({ open: false });
  const [rechnungDialog, setRechnungDialog] = useState<{ open: boolean; projektId?: string }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'projekt' } | null>(null);
  const [activeTab, setActiveTab] = useState<'projekte' | 'finanzen'>('projekte');
  const [expandedProjekt, setExpandedProjekt] = useState<string | null>(null);

  const {
    kunden, berater, leistungskatalog, projekte, angebote, rechnungen,
    kundenMap, beraterMap, leistungskatalogMap, projekteMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const enrichedProjekte = useMemo(() => enrichProjekte(projekte, { kundenMap, beraterMap }), [projekte, kundenMap, beraterMap]);
  const enrichedAngebote = useMemo(() => enrichAngebote(angebote, { projekteMap, leistungskatalogMap }), [angebote, projekteMap, leistungskatalogMap]);
  const enrichedRechnungen = useMemo(() => enrichRechnungen(rechnungen, { projekteMap, leistungskatalogMap }), [rechnungen, projekteMap, leistungskatalogMap]);

  const stats = useMemo(() => {
    const aktuelleP = enrichedProjekte.filter(p => p.fields.status?.key === 'aktuell').length;
    const akquiseP = enrichedProjekte.filter(p => p.fields.status?.key === 'akquise').length;
    const totalRechnungen = enrichedRechnungen.reduce((s, r) => s + (r.fields.rechnungsbetrag ?? 0), 0);
    const offeneRechnungen = enrichedRechnungen.filter(r => r.fields.zahlungsstatus?.key === 'offen' || r.fields.zahlungsstatus?.key === 'ueberfaellig').reduce((s, r) => s + (r.fields.rechnungsbetrag ?? 0), 0);
    const angenommeneAngebote = enrichedAngebote.filter(a => a.fields.angebotsstatus?.key === 'angenommen').reduce((s, a) => s + (a.fields.gesamtpreis ?? 0), 0);
    return { aktuelleP, akquiseP, totalRechnungen, offeneRechnungen, angenommeneAngebote };
  }, [enrichedProjekte, enrichedAngebote, enrichedRechnungen]);

  const kategorieData = useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedProjekte.filter(p => p.fields.status?.key !== 'abgeschlossen').forEach(p => {
      const k = p.fields.kategorie?.label ?? 'Sonstiges';
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/\s*\(.*\)/, ''), value })).sort((a, b) => b.value - a.value);
  }, [enrichedProjekte]);

  const projektsByStatus = useMemo(() => {
    const groups: Record<string, EnrichedProjekte[]> = { akquise: [], aktuell: [], abgeschlossen: [] };
    enrichedProjekte.forEach(p => {
      const key = p.fields.status?.key ?? 'aktuell';
      if (groups[key]) groups[key].push(p);
    });
    return groups;
  }, [enrichedProjekte]);

  const rechnungenByProjekt = useMemo(() => {
    const map: Record<string, typeof enrichedRechnungen> = {};
    enrichedRechnungen.forEach(r => {
      const pid = extractRecordId(r.fields.projekt);
      if (pid) { map[pid] = map[pid] ?? []; map[pid].push(r); }
    });
    return map;
  }, [enrichedRechnungen]);

  const angeboteByProjekt = useMemo(() => {
    const map: Record<string, typeof enrichedAngebote> = {};
    enrichedAngebote.forEach(a => {
      const pid = extractRecordId(a.fields.projekt);
      if (pid) { map[pid] = map[pid] ?? []; map[pid].push(a); }
    });
    return map;
  }, [enrichedAngebote]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const handleDeleteProjekt = async () => {
    if (!deleteTarget) return;
    await LivingAppsService.deleteProjekteEntry(deleteTarget.id);
    fetchAll();
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unternehmensübersicht</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Projekte, Angebote & Rechnungen auf einen Blick</p>
        </div>
        <Button onClick={() => setProjektDialog({ open: true })} className="gap-2 shrink-0">
          <IconPlus size={16} stroke={1.5} /> Neues Projekt
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Aktive Projekte"
          value={String(stats.aktuelleP)}
          description={`${stats.akquiseP} in Akquise`}
          icon={<IconLayoutKanban size={18} stroke={1.5} className="text-muted-foreground" />}
        />
        <StatCard
          title="Kunden"
          value={String(kunden.length)}
          description="Gesamt"
          icon={<IconBuilding size={18} stroke={1.5} className="text-muted-foreground" />}
        />
        <StatCard
          title="Offene Forderungen"
          value={formatCurrency(stats.offeneRechnungen)}
          description="Offen / Überfällig"
          icon={<IconReceipt size={18} stroke={1.5} className="text-muted-foreground" />}
        />
        <StatCard
          title="Umsatz gesamt"
          value={formatCurrency(stats.totalRechnungen)}
          description="Alle Rechnungen"
          icon={<IconCurrencyEuro size={18} stroke={1.5} className="text-muted-foreground" />}
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('projekte')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'projekte' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Projekt-Pipeline
        </button>
        <button
          onClick={() => setActiveTab('finanzen')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'finanzen' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Finanzen
        </button>
      </div>

      {activeTab === 'projekte' && (
        <div className="space-y-4">
          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(['akquise', 'aktuell', 'abgeschlossen'] as const).map((status) => {
              const cfg = STATUS_CONFIG[status];
              const items = projektsByStatus[status] ?? [];
              return (
                <div key={status} className={`rounded-2xl border ${cfg.color} overflow-hidden`}>
                  {/* Column Header */}
                  <div className={`${cfg.headerColor} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{cfg.label}</span>
                      <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-white hover:bg-white/20"
                      onClick={() => setProjektDialog({ open: true })}
                    >
                      <IconPlus size={14} stroke={1.5} />
                    </Button>
                  </div>

                  {/* Cards */}
                  <div className="p-3 space-y-2 min-h-[200px]">
                    {items.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <span className="text-xs text-muted-foreground">Keine Projekte</span>
                      </div>
                    )}
                    {items.map((projekt) => {
                      const isExpanded = expandedProjekt === projekt.record_id;
                      const projRechnungen = rechnungenByProjekt[projekt.record_id] ?? [];
                      const projAngebote = angeboteByProjekt[projekt.record_id] ?? [];
                      const rechnungSum = projRechnungen.reduce((s, r) => s + (r.fields.rechnungsbetrag ?? 0), 0);
                      return (
                        <div
                          key={projekt.record_id}
                          className="bg-white rounded-xl border border-white/80 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setExpandedProjekt(isExpanded ? null : projekt.record_id)}
                        >
                          <div className="px-3 py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {projekt.fields.projektnummer && (
                                  <span className="text-xs text-muted-foreground font-mono">{projekt.fields.projektnummer}</span>
                                )}
                                <p className="font-semibold text-sm text-foreground truncate leading-tight mt-0.5">
                                  {projekt.fields.projektname ?? '(Kein Name)'}
                                </p>
                                {projekt.kundeName && (
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">{projekt.kundeName}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  className="p-1 rounded hover:bg-muted transition-colors"
                                  onClick={(e) => { e.stopPropagation(); setProjektDialog({ open: true, edit: projekt }); }}
                                >
                                  <IconEdit size={12} stroke={1.5} className="text-muted-foreground" />
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-red-50 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: projekt.record_id, type: 'projekt' }); }}
                                >
                                  <IconTrash size={12} stroke={1.5} className="text-muted-foreground hover:text-red-500" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {projekt.fields.kategorie && (
                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                  {projekt.fields.kategorie.label.replace(/\s*\(.*\)/, '')}
                                </span>
                              )}
                              {rechnungSum > 0 && (
                                <span className="text-xs text-muted-foreground font-medium">{formatCurrency(rechnungSum)}</span>
                              )}
                              {projekt.fields.beginn && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <IconClock size={10} stroke={1.5} />
                                  {formatDate(projekt.fields.beginn)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-gray-50 px-3 py-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                              {projekt.projektleiterName && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">Projektleiter:</span> {projekt.projektleiterName}
                                </p>
                              )}
                              {projekt.fields.naechster_schritt && (
                                <div className="flex gap-1.5">
                                  <IconArrowRight size={12} stroke={1.5} className="text-primary shrink-0 mt-0.5" />
                                  <p className="text-xs text-foreground">{projekt.fields.naechster_schritt}</p>
                                </div>
                              )}
                              {projekt.fields.projektstand_beschreibung && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{projekt.fields.projektstand_beschreibung}</p>
                              )}

                              {/* Quick actions */}
                              <div className="flex gap-2 pt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1 flex-1"
                                  onClick={() => setAngebotDialog({ open: true, projektId: projekt.record_id })}
                                >
                                  <IconPlus size={11} stroke={1.5} /> Angebot
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1 flex-1"
                                  onClick={() => setRechnungDialog({ open: true, projektId: projekt.record_id })}
                                >
                                  <IconPlus size={11} stroke={1.5} /> Rechnung
                                </Button>
                              </div>

                              {/* Related counts */}
                              {(projAngebote.length > 0 || projRechnungen.length > 0) && (
                                <div className="flex gap-3 pt-1 text-xs text-muted-foreground">
                                  {projAngebote.length > 0 && <span>{projAngebote.length} Angebot{projAngebote.length !== 1 ? 'e' : ''}</span>}
                                  {projRechnungen.length > 0 && <span>{projRechnungen.length} Rechnung{projRechnungen.length !== 1 ? 'en' : ''}</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category chart */}
          {kategorieData.length > 0 && (
            <div className="bg-card border rounded-2xl p-5">
              <h3 className="font-semibold text-sm text-foreground mb-4">Projekte nach Kategorie (aktiv)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={kategorieData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={140} stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                  />
                  <Bar dataKey="value" radius={4}>
                    {kategorieData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${220 + i * 20}, 70%, ${55 + i * 4}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'finanzen' && (
        <div className="space-y-4">
          {/* Rechnungen Table */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-sm text-foreground">Rechnungen</h3>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setRechnungDialog({ open: true })}>
                <IconPlus size={13} stroke={1.5} /> Neue Rechnung
              </Button>
            </div>
            <div className="divide-y">
              {enrichedRechnungen.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground text-sm gap-2">
                  <IconReceipt size={24} stroke={1.5} className="opacity-40" />
                  <span>Noch keine Rechnungen</span>
                </div>
              ) : enrichedRechnungen.slice().sort((a, b) => (b.fields.rechnungsdatum ?? '').localeCompare(a.fields.rechnungsdatum ?? '')).map((rechnung) => {
                const zStatus = rechnung.fields.zahlungsstatus?.key ?? 'offen';
                const zCfg = ZAHLUNGS_CONFIG[zStatus] ?? ZAHLUNGS_CONFIG['offen'];
                return (
                  <div key={rechnung.record_id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">{rechnung.fields.rechnungsnummer ?? 'Rechnung'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${zCfg.color}`}>{zCfg.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {rechnung.projektName && <span>{rechnung.projektName} · </span>}
                        {rechnung.fields.rechnungsdatum ? formatDate(rechnung.fields.rechnungsdatum) : '—'}
                        {rechnung.fields.faelligkeitsdatum && (
                          <span className={rechnung.fields.zahlungsstatus?.key === 'ueberfaellig' ? ' text-red-500 font-medium' : ''}>
                            {' · Fällig: '}{formatDate(rechnung.fields.faelligkeitsdatum)}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-semibold text-sm text-foreground shrink-0">
                      {rechnung.fields.rechnungsbetrag != null ? formatCurrency(rechnung.fields.rechnungsbetrag) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
            {enrichedRechnungen.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-t">
                <span className="text-xs text-muted-foreground font-medium">Gesamt</span>
                <span className="font-bold text-sm text-foreground">{formatCurrency(stats.totalRechnungen)}</span>
              </div>
            )}
          </div>

          {/* Angebote Table */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-sm text-foreground">Angebote</h3>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setAngebotDialog({ open: true })}>
                <IconPlus size={13} stroke={1.5} /> Neues Angebot
              </Button>
            </div>
            <div className="divide-y">
              {enrichedAngebote.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground text-sm gap-2">
                  <IconTrendingUp size={24} stroke={1.5} className="opacity-40" />
                  <span>Noch keine Angebote</span>
                </div>
              ) : enrichedAngebote.slice().sort((a, b) => (b.fields.angebotsdatum ?? '').localeCompare(a.fields.angebotsdatum ?? '')).map((angebot) => {
                const aStatus = angebot.fields.angebotsstatus?.key ?? 'entwurf';
                const statusColors: Record<string, string> = {
                  entwurf: 'bg-gray-100 text-gray-600',
                  versendet: 'bg-blue-100 text-blue-700',
                  angenommen: 'bg-green-100 text-green-700',
                  abgelehnt: 'bg-red-100 text-red-600',
                };
                return (
                  <div key={angebot.record_id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">{angebot.fields.angebotsnummer ?? 'Angebot'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[aStatus] ?? statusColors['entwurf']}`}>
                          {angebot.fields.angebotsstatus?.label ?? 'Entwurf'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {angebot.projektName && <span>{angebot.projektName} · </span>}
                        {angebot.fields.angebotsdatum ? formatDate(angebot.fields.angebotsdatum) : '—'}
                      </p>
                    </div>
                    <span className="font-semibold text-sm text-foreground shrink-0">
                      {angebot.fields.gesamtpreis != null ? formatCurrency(angebot.fields.gesamtpreis) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
            {enrichedAngebote.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-t">
                <span className="text-xs text-muted-foreground font-medium">Angenommen</span>
                <span className="font-bold text-sm text-foreground">{formatCurrency(stats.angenommeneAngebote)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ProjekteDialog
        open={projektDialog.open}
        onClose={() => setProjektDialog({ open: false })}
        onSubmit={async (fields) => {
          if (projektDialog.edit) {
            await LivingAppsService.updateProjekteEntry(projektDialog.edit.record_id, fields);
          } else {
            await LivingAppsService.createProjekteEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={projektDialog.edit?.fields}
        kundenList={kunden}
        beraterList={berater}
        enablePhotoScan={AI_PHOTO_SCAN['Projekte']}
      />

      <AngeboteDialog
        open={angebotDialog.open}
        onClose={() => setAngebotDialog({ open: false })}
        onSubmit={async (fields) => {
          await LivingAppsService.createAngeboteEntry(fields);
          fetchAll();
        }}
        defaultValues={angebotDialog.projektId ? { projekt: createRecordUrl(APP_IDS.PROJEKTE, angebotDialog.projektId) } : undefined}
        projekteList={projekte}
        leistungskatalogList={leistungskatalog}
        enablePhotoScan={AI_PHOTO_SCAN['Angebote']}
      />

      <RechnungenDialog
        open={rechnungDialog.open}
        onClose={() => setRechnungDialog({ open: false })}
        onSubmit={async (fields) => {
          await LivingAppsService.createRechnungenEntry(fields);
          fetchAll();
        }}
        defaultValues={rechnungDialog.projektId ? { projekt: createRecordUrl(APP_IDS.PROJEKTE, rechnungDialog.projektId) } : undefined}
        projekteList={projekte}
        leistungskatalogList={leistungskatalog}
        enablePhotoScan={AI_PHOTO_SCAN['Rechnungen']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Projekt löschen"
        description="Möchten Sie dieses Projekt wirklich löschen? Alle zugehörigen Daten bleiben erhalten."
        onConfirm={handleDeleteProjekt}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} stroke={1.5} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
