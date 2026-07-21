import { useState } from 'react';
import type { WebkameraVerwaltung } from '@/types/app';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { APP_IDS } from '@/types/app';
import { AttachmentsSection } from '@/components/AttachmentsSection';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconChevronDown } from '@tabler/icons-react';
import { GeoMapPicker } from '@/components/GeoMapPicker';
import { MapRouteLinks } from '@/components/widgets/MapWidget';

interface WebkameraVerwaltungViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: WebkameraVerwaltung | null;
  onEdit: (record: WebkameraVerwaltung) => void;
}

export function WebkameraVerwaltungViewDialog({ open, onClose, record, onEdit }: WebkameraVerwaltungViewDialogProps) {
  const [showCoords, setShowCoords] = useState(false);

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Webkamera-Verwaltung anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kameraname</Label>
            <p className="text-sm">{record.fields.kamera_name ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Standortbeschreibung</Label>
            <p className="text-sm">{record.fields.kamera_standort ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Stream-URL</Label>
            <p className="text-sm">{record.fields.kamera_url ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Geografischer Standort</Label>
            {record.fields.kamera_geo?.info && (
              <p className="text-sm text-muted-foreground break-words whitespace-normal">{record.fields.kamera_geo.info}</p>
            )}
            {record.fields.kamera_geo?.lat != null && record.fields.kamera_geo?.long != null && (
              <GeoMapPicker
                lat={record.fields.kamera_geo.lat}
                lng={record.fields.kamera_geo.long}
                readOnly
              />
            )}
            {record.fields.kamera_geo?.lat != null && record.fields.kamera_geo?.long != null && (
              <MapRouteLinks lat={record.fields.kamera_geo.lat} long={record.fields.kamera_geo.long} className="mt-1" />
            )}
            <button type="button" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 py-1 max-sm:py-2 transition-colors" onClick={() => setShowCoords(v => !v)}>
              {showCoords ? 'Koordinaten verbergen' : 'Koordinaten anzeigen'}
              <IconChevronDown className={`h-3 w-3 transition-transform ${showCoords ? "rotate-180" : ""}`} />
            </button>
            {showCoords && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-xs text-muted-foreground">Breitengrad:</span> {record.fields.kamera_geo?.lat?.toFixed(6) ?? '—'}</div>
                <div><span className="text-xs text-muted-foreground">Längengrad:</span> {record.fields.kamera_geo?.long?.toFixed(6) ?? '—'}</div>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.kamera_beschreibung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Badge variant="secondary">{record.fields.kamera_status?.label ?? '—'}</Badge>
          </div>
          <div className="pt-2 border-t border-border">
            <AttachmentsSection appId={APP_IDS.WEBKAMERA_VERWALTUNG} recordId={record.record_id} readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}