import type { Bilderfassung, WebkameraVerwaltung } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconFileText } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface BilderfassungViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Bilderfassung | null;
  onEdit: (record: Bilderfassung) => void;
  webkamera_verwaltungList: WebkameraVerwaltung[];
}

export function BilderfassungViewDialog({ open, onClose, record, onEdit, webkamera_verwaltungList }: BilderfassungViewDialogProps) {
  function getWebkameraVerwaltungDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return webkamera_verwaltungList.find(r => r.record_id === id)?.fields.kamera_name ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bilderfassung anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Webkamera</Label>
            <p className="text-sm">{getWebkameraVerwaltungDisplayName(record.fields.kamera_referenz)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Aufnahmezeitpunkt</Label>
            <p className="text-sm">{formatDate(record.fields.aufnahmezeitpunkt)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Bild</Label>
            {record.fields.bild_datei ? (
              <div className="relative w-full rounded-lg bg-muted overflow-hidden border">
                <img src={record.fields.bild_datei} alt="" className="w-full h-auto object-contain" />
              </div>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Notiz</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.bild_notiz ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Bildqualität</Label>
            <Badge variant="secondary">{record.fields.bild_qualitaet?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Prompt</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.ki_prompt ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">KI-Auswertung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.ki_auswertung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Messwert</Label>
            <p className="text-sm">{record.fields.ki_messwert ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kriterium erfüllt</Label>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              record.fields.ki_kriterium_erfuellt ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {record.fields.ki_kriterium_erfuellt ? 'Ja' : 'Nein'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}