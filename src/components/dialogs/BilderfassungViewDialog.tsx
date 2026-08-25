import type { Bilderfassung, WebkameraVerwaltung } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { APP_IDS } from '@/types/app';
import { AttachmentsSection } from '@/components/AttachmentsSection';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconFileText } from '@tabler/icons-react';
import { t, appLabel, fieldLabel, lookupLabel, dateFnsLocale, dateFormat } from '@/i18n';
import { format, parseISO } from 'date-fns';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), dateFormat(), { locale: dateFnsLocale() }); } catch { return d; }
}

interface BilderfassungViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Bilderfassung | null;
  onEdit: (record: Bilderfassung) => void;
  webkameraVerwaltungList: WebkameraVerwaltung[];
}

export function BilderfassungViewDialog({ open, onClose, record, onEdit, webkameraVerwaltungList }: BilderfassungViewDialogProps) {
  function getWebkameraVerwaltungDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return webkameraVerwaltungList.find(r => r.record_id === id)?.fields.kamera_name ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('view_entity', { entity: appLabel('bilderfassung') })}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            {t('edit_button')}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'schritt1')}</Label>
            {record.fields.schritt1 ? (
              <MediaThumbnail src={record.fields.schritt1} fit="contain" className="w-full rounded-lg border" />
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'referenzbild_datei')}</Label>
            {record.fields.referenzbild_datei ? (
              <MediaThumbnail src={record.fields.referenzbild_datei} fit="contain" className="w-full rounded-lg border" />
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'kamera_referenz')}</Label>
            <p className="text-sm">{getWebkameraVerwaltungDisplayName(record.fields.kamera_referenz)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'aufnahmezeitpunkt')}</Label>
            <p className="text-sm">{formatDate(record.fields.aufnahmezeitpunkt)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'bild_datei')}</Label>
            {record.fields.bild_datei ? (
              <MediaThumbnail src={record.fields.bild_datei} fit="contain" className="w-full rounded-lg border" />
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'bild_notiz')}</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.bild_notiz ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'bild_qualitaet')}</Label>
            <Badge variant="secondary">{lookupLabel('bilderfassung', 'bild_qualitaet', record.fields.bild_qualitaet?.key) ?? record.fields.bild_qualitaet?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'ki_prompt')}</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.ki_prompt ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'ki_auswertung')}</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.ki_auswertung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'ki_messwert')}</Label>
            <p className="text-sm">{record.fields.ki_messwert ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('bilderfassung', 'ki_kriterium_erfuellt')}</Label>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              record.fields.ki_kriterium_erfuellt ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {record.fields.ki_kriterium_erfuellt ? t('yes') : t('no')}
            </span>
          </div>
          <div className="pt-2 border-t border-border">
            <AttachmentsSection appId={APP_IDS.BILDERFASSUNG} recordId={record.record_id} readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}