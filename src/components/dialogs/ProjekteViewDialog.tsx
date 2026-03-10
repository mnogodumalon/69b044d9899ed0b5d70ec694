import type { Projekte, Kunden, Berater } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface ProjekteViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Projekte | null;
  onEdit: (record: Projekte) => void;
  kundenList: Kunden[];
  beraterList: Berater[];
}

export function ProjekteViewDialog({ open, onClose, record, onEdit, kundenList, beraterList }: ProjekteViewDialogProps) {
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

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Projekte anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projektnummer</Label>
            <p className="text-sm">{record.fields.projektnummer ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projektname</Label>
            <p className="text-sm">{record.fields.projektname ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kunde</Label>
            <p className="text-sm">{getKundenDisplayName(record.fields.kunde)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projektkategorie</Label>
            <Badge variant="secondary">{record.fields.kategorie?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projektleiter</Label>
            <p className="text-sm">{getBeraterDisplayName(record.fields.projektleiter)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Partner / Kooperationspartner</Label>
            <p className="text-sm">{record.fields.partner ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projektstand</Label>
            <Badge variant="secondary">{record.fields.status?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projektbeginn</Label>
            <p className="text-sm">{formatDate(record.fields.beginn)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Aktueller Projektstand</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.projektstand_beschreibung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nächster Schritt</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.naechster_schritt ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Projektbeschreibung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.beschreibung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Eigene Rolle im Projekt</Label>
            <p className="text-sm">{record.fields.eigene_rolle ?? '—'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}