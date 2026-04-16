import type { Rechnungsliste, Rechnungen, Angebote, Projekte, Kunden } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IconPencil } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface RechnungslisteViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Rechnungsliste | null;
  onEdit: (record: Rechnungsliste) => void;
  rechnungenList: Rechnungen[];
  angeboteList: Angebote[];
  projekteList: Projekte[];
  kundenList: Kunden[];
}

export function RechnungslisteViewDialog({ open, onClose, record, onEdit, rechnungenList, angeboteList, projekteList, kundenList }: RechnungslisteViewDialogProps) {
  function getRechnungenDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return rechnungenList.find(r => r.record_id === id)?.fields.rechnungsnummer ?? '—';
  }

  function getAngeboteDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return angeboteList.find(r => r.record_id === id)?.fields.angebotsnummer ?? '—';
  }

  function getProjekteDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return projekteList.find(r => r.record_id === id)?.fields.projektnummer ?? '—';
  }

  function getKundenDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return kundenList.find(r => r.record_id === id)?.fields.organisation ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rechnungsliste anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rechnung</Label>
            <p className="text-sm">{getRechnungenDisplayName(record.fields.rechnung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Zugehöriges Angebot</Label>
            <p className="text-sm">{getAngeboteDisplayName(record.fields.zugehoeriges_angebot)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projekt</Label>
            <p className="text-sm">{getProjekteDisplayName(record.fields.projekt)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kunde</Label>
            <p className="text-sm">{getKundenDisplayName(record.fields.kunde)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rechnungsdatum</Label>
            <p className="text-sm">{formatDate(record.fields.rechnungsdatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rechnungsbetrag (EUR)</Label>
            <p className="text-sm">{record.fields.rechnungsbetrag ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Zahlungsstatus</Label>
            <Badge variant="secondary">{record.fields.zahlungsstatus?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Bemerkungen</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.bemerkungen ?? '—'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}