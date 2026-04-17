import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichBilderfassung } from '@/lib/enrich';
import type { EnrichedBilderfassung } from '@/types/enriched';
import type { WebkameraVerwaltung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { formatDate } from '@/lib/formatters';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { useState, useMemo, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { WebkameraVerwaltungDialog } from '@/components/dialogs/WebkameraVerwaltungDialog';
import { BilderfassungDialog } from '@/components/dialogs/BilderfassungDialog';
import {
  IconAlertCircle, IconTool, IconRefresh, IconCheck,
  IconCamera, IconPhoto, IconPlus, IconPencil, IconTrash,
  IconMapPin, IconWifi, IconWifiOff, IconSettings, IconEye,
  IconCalendar, IconStar, IconX, IconChevronRight,
  IconBrain, IconCircleCheck, IconCircleX
} from '@tabler/icons-react';

const APPGROUP_ID = '69e1f9ca208ec9e0b07e1baf';
const REPAIR_ENDPOINT = '/claude/build/repair';

function statusColor(status?: { key: string; label: string } | null) {
  const k = status?.key;
  if (k === 'aktiv') return 'bg-green-100 text-green-700 border-green-200';
  if (k === 'inaktiv') return 'bg-gray-100 text-gray-500 border-gray-200';
  if (k === 'wartung') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-muted text-muted-foreground border-border';
}

function qualityColor(key?: string) {
  if (key === 'gut') return 'bg-green-100 text-green-700';
  if (key === 'mittel') return 'bg-amber-100 text-amber-700';
  if (key === 'schlecht') return 'bg-red-100 text-red-700';
  return 'bg-muted text-muted-foreground';
}

export default function DashboardOverview() {
  const {
    webkameraVerwaltung, bilderfassung,
    webkameraVerwaltungMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const enrichedBilderfassung = enrichBilderfassung(bilderfassung, { webkameraVerwaltungMap });

  // --- State: always before early returns ---
  const [selectedKamera, setSelectedKamera] = useState<WebkameraVerwaltung | null>(null);
  const [kameraDialogOpen, setKameraDialogOpen] = useState(false);
  const [editKamera, setEditKamera] = useState<WebkameraVerwaltung | null>(null);
  const [deleteKamera, setDeleteKamera] = useState<WebkameraVerwaltung | null>(null);
  const [bildDialogOpen, setBildDialogOpen] = useState(false);
  const [editBild, setEditBild] = useState<EnrichedBilderfassung | null>(null);
  const [deleteBild, setDeleteBild] = useState<EnrichedBilderfassung | null>(null);
  const [detailBild, setDetailBild] = useState<EnrichedBilderfassung | null>(null);

  const filteredBilder = useMemo(() => {
    if (!selectedKamera) return enrichedBilderfassung;
    return enrichedBilderfassung.filter(b => {
      const url = b.fields.kamera_referenz;
      if (!url) return false;
      return url.includes(selectedKamera.record_id);
    });
  }, [enrichedBilderfassung, selectedKamera]);

  const bilder_per_kamera = useMemo(() => {
    const m = new Map<string, number>();
    enrichedBilderfassung.forEach(b => {
      const url = b.fields.kamera_referenz;
      if (!url) return;
      const id = webkameraVerwaltung.find(k => url.includes(k.record_id))?.record_id;
      if (id) m.set(id, (m.get(id) ?? 0) + 1);
    });
    return m;
  }, [enrichedBilderfassung, webkameraVerwaltung]);

  const aktiveKameras = useMemo(() => webkameraVerwaltung.filter(k => k.fields.kamera_status?.key === 'aktiv').length, [webkameraVerwaltung]);
  const kriteriumErfuellt = useMemo(() => enrichedBilderfassung.filter(b => b.fields.ki_kriterium_erfuellt === true).length, [enrichedBilderfassung]);

  const handleDeleteKamera = useCallback(async () => {
    if (!deleteKamera) return;
    await LivingAppsService.deleteWebkameraVerwaltungEntry(deleteKamera.record_id);
    if (selectedKamera?.record_id === deleteKamera.record_id) setSelectedKamera(null);
    setDeleteKamera(null);
    fetchAll();
  }, [deleteKamera, selectedKamera, fetchAll]);

  const handleDeleteBild = useCallback(async () => {
    if (!deleteBild) return;
    await LivingAppsService.deleteBilderfassungEntry(deleteBild.record_id);
    if (detailBild?.record_id === deleteBild.record_id) setDetailBild(null);
    setDeleteBild(null);
    fetchAll();
  }, [deleteBild, detailBild, fetchAll]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Kameras gesamt"
          value={String(webkameraVerwaltung.length)}
          description="Registriert"
          icon={<IconCamera size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Aktiv"
          value={String(aktiveKameras)}
          description="Online"
          icon={<IconWifi size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Aufnahmen"
          value={String(enrichedBilderfassung.length)}
          description="Gesamt"
          icon={<IconPhoto size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Kriterium erfüllt"
          value={String(kriteriumErfuellt)}
          description="KI-Auswertungen"
          icon={<IconBrain size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Main workspace: Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">

        {/* LEFT: Kamera-Liste */}
        <div className="rounded-[20px] bg-card shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
            <h2 className="font-semibold text-sm text-foreground">Kameras</h2>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setEditKamera(null); setKameraDialogOpen(true); }}>
              <IconPlus size={13} className="shrink-0" /> Neu
            </Button>
          </div>
          <div className="divide-y divide-border">
            {webkameraVerwaltung.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
                <IconCamera size={32} stroke={1.5} />
                <p className="text-sm">Noch keine Kameras</p>
              </div>
            )}
            {/* "Alle" filter */}
            {webkameraVerwaltung.length > 0 && (
              <button
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${!selectedKamera ? 'bg-primary/5' : ''}`}
                onClick={() => setSelectedKamera(null)}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <IconEye size={14} className="text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">Alle Aufnahmen</p>
                  <p className="text-xs text-muted-foreground">{enrichedBilderfassung.length} Bilder</p>
                </div>
                {!selectedKamera && <IconChevronRight size={14} className="text-primary shrink-0" />}
              </button>
            )}
            {webkameraVerwaltung.map(kamera => {
              const isSelected = selectedKamera?.record_id === kamera.record_id;
              const count = bilder_per_kamera.get(kamera.record_id) ?? 0;
              return (
                <div
                  key={kamera.record_id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/50 group ${isSelected ? 'bg-primary/5' : ''}`}
                  onClick={() => setSelectedKamera(isSelected ? null : kamera)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {kamera.fields.kamera_status?.key === 'aktiv'
                      ? <IconWifi size={14} className="text-primary" />
                      : kamera.fields.kamera_status?.key === 'wartung'
                        ? <IconSettings size={14} className="text-amber-600" />
                        : <IconWifiOff size={14} className="text-muted-foreground" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{kamera.fields.kamera_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{kamera.fields.kamera_standort ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-muted-foreground">{count}</span>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6"
                      onClick={e => { e.stopPropagation(); setEditKamera(kamera); setKameraDialogOpen(true); }}
                    >
                      <IconPencil size={12} />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={e => { e.stopPropagation(); setDeleteKamera(kamera); }}
                    >
                      <IconTrash size={12} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Bilder-Galerie */}
        <div className="rounded-[20px] bg-card shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40 flex-wrap gap-2">
            <div className="min-w-0">
              <h2 className="font-semibold text-sm text-foreground truncate">
                {selectedKamera ? selectedKamera.fields.kamera_name ?? 'Aufnahmen' : 'Alle Aufnahmen'}
              </h2>
              {selectedKamera?.fields.kamera_standort && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <IconMapPin size={10} className="shrink-0" />
                  <span className="truncate">{selectedKamera.fields.kamera_standort}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedKamera && (
                <Badge className={`text-xs border ${statusColor(selectedKamera.fields.kamera_status)}`} variant="outline">
                  {selectedKamera.fields.kamera_status?.label ?? 'Unbekannt'}
                </Badge>
              )}
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setEditBild(null); setBildDialogOpen(true); }}>
                <IconPlus size={13} className="shrink-0" /> Aufnahme
              </Button>
            </div>
          </div>

          {filteredBilder.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
              <IconPhoto size={40} stroke={1.5} />
              <p className="text-sm">Noch keine Aufnahmen</p>
              <Button variant="outline" size="sm" onClick={() => { setEditBild(null); setBildDialogOpen(true); }}>
                <IconPlus size={14} className="mr-1" /> Erste Aufnahme hinzufügen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
              {filteredBilder.map(bild => (
                <div
                  key={bild.record_id}
                  className="rounded-xl overflow-hidden border border-border bg-background cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => setDetailBild(bild)}
                >
                  {/* Image */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {bild.fields.bild_datei ? (
                      <img
                        src={bild.fields.bild_datei}
                        alt={bild.fields.bild_notiz ?? 'Aufnahme'}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconPhoto size={28} className="text-muted-foreground/40" stroke={1.5} />
                      </div>
                    )}
                    {/* KI badge */}
                    {bild.fields.ki_kriterium_erfuellt !== undefined && bild.fields.ki_kriterium_erfuellt !== null && (
                      <div className="absolute top-1.5 right-1.5">
                        {bild.fields.ki_kriterium_erfuellt
                          ? <span className="flex items-center gap-0.5 bg-green-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5"><IconCircleCheck size={10} /> OK</span>
                          : <span className="flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5"><IconCircleX size={10} /> NOK</span>
                        }
                      </div>
                    )}
                    {/* Quality badge */}
                    {bild.fields.bild_qualitaet && (
                      <div className="absolute bottom-1.5 left-1.5">
                        <span className={`text-[10px] font-semibold rounded-full px-1.5 py-0.5 ${qualityColor(bild.fields.bild_qualitaet.key)}`}>
                          {bild.fields.bild_qualitaet.label}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium text-foreground truncate">
                      {bild.kamera_referenzName || bild.fields.bild_notiz || 'Aufnahme'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <IconCalendar size={9} />
                      {bild.fields.aufnahmezeitpunkt ? formatDate(bild.fields.aufnahmezeitpunkt) : '—'}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex border-t border-border">
                    <button
                      className="flex-1 py-1.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:bg-muted/50 transition-colors"
                      onClick={e => { e.stopPropagation(); setEditBild(bild); setBildDialogOpen(true); }}
                    >
                      <IconPencil size={10} /> Bearbeiten
                    </button>
                    <button
                      className="flex-1 py-1.5 flex items-center justify-center gap-1 text-[10px] text-destructive hover:bg-destructive/5 transition-colors border-l border-border"
                      onClick={e => { e.stopPropagation(); setDeleteBild(bild); }}
                    >
                      <IconTrash size={10} /> Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal for image */}
      {detailBild && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setDetailBild(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-base">{detailBild.kamera_referenzName || 'Aufnahme'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {detailBild.fields.aufnahmezeitpunkt ? formatDate(detailBild.fields.aufnahmezeitpunkt) : '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setDetailBild(null); setEditBild(detailBild); setBildDialogOpen(true); }}>
                  <IconPencil size={12} /> Bearbeiten
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDetailBild(null)}>
                  <IconX size={16} />
                </Button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {detailBild.fields.bild_datei && (
                <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                  <img src={detailBild.fields.bild_datei} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {detailBild.fields.bild_qualitaet && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bildqualität</p>
                    <span className={`inline-block text-xs font-medium rounded-full px-2 py-0.5 ${qualityColor(detailBild.fields.bild_qualitaet.key)}`}>
                      {detailBild.fields.bild_qualitaet.label}
                    </span>
                  </div>
                )}
                {detailBild.fields.ki_kriterium_erfuellt !== undefined && detailBild.fields.ki_kriterium_erfuellt !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Kriterium erfüllt</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${detailBild.fields.ki_kriterium_erfuellt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {detailBild.fields.ki_kriterium_erfuellt ? <><IconCircleCheck size={11} /> Ja</> : <><IconCircleX size={11} /> Nein</>}
                    </span>
                  </div>
                )}
                {detailBild.fields.ki_messwert !== undefined && detailBild.fields.ki_messwert !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Messwert</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium">
                      <IconStar size={11} className="text-amber-500" />
                      {detailBild.fields.ki_messwert}
                    </span>
                  </div>
                )}
              </div>
              {detailBild.fields.bild_notiz && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notiz</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{detailBild.fields.bild_notiz}</p>
                </div>
              )}
              {detailBild.fields.ki_auswertung && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><IconBrain size={11} /> KI-Auswertung</p>
                  <p className="text-sm bg-primary/5 border border-primary/10 rounded-lg p-3">{detailBild.fields.ki_auswertung}</p>
                </div>
              )}
              {detailBild.fields.ki_prompt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">KI-Prompt</p>
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 font-mono">{detailBild.fields.ki_prompt}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kamera Dialog */}
      <WebkameraVerwaltungDialog
        open={kameraDialogOpen}
        onClose={() => { setKameraDialogOpen(false); setEditKamera(null); }}
        onSubmit={async (fields) => {
          if (editKamera) {
            await LivingAppsService.updateWebkameraVerwaltungEntry(editKamera.record_id, fields);
          } else {
            await LivingAppsService.createWebkameraVerwaltungEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={editKamera?.fields}
        enablePhotoScan={AI_PHOTO_SCAN['WebkameraVerwaltung']}
        enablePhotoLocation={AI_PHOTO_LOCATION['WebkameraVerwaltung']}
      />

      {/* Bild Dialog */}
      <BilderfassungDialog
        open={bildDialogOpen}
        onClose={() => { setBildDialogOpen(false); setEditBild(null); }}
        onSubmit={async (fields) => {
          if (editBild) {
            await LivingAppsService.updateBilderfassungEntry(editBild.record_id, fields);
          } else {
            const kameraUrl = selectedKamera
              ? createRecordUrl(APP_IDS.WEBKAMERA_VERWALTUNG, selectedKamera.record_id)
              : undefined;
            await LivingAppsService.createBilderfassungEntry({
              ...fields,
              kamera_referenz: fields.kamera_referenz ?? kameraUrl,
            });
          }
          fetchAll();
        }}
        defaultValues={editBild
          ? editBild.fields
          : selectedKamera
            ? { kamera_referenz: createRecordUrl(APP_IDS.WEBKAMERA_VERWALTUNG, selectedKamera.record_id) }
            : undefined
        }
        webkamera_verwaltungList={webkameraVerwaltung}
        enablePhotoScan={AI_PHOTO_SCAN['Bilderfassung']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Bilderfassung']}
      />

      {/* Confirm Delete Kamera */}
      <ConfirmDialog
        open={!!deleteKamera}
        title="Kamera löschen"
        description={`Soll die Kamera "${deleteKamera?.fields.kamera_name ?? ''}" wirklich gelöscht werden?`}
        onConfirm={handleDeleteKamera}
        onClose={() => setDeleteKamera(null)}
      />

      {/* Confirm Delete Bild */}
      <ConfirmDialog
        open={!!deleteBild}
        title="Aufnahme löschen"
        description="Soll diese Aufnahme wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDeleteBild}
        onClose={() => setDeleteBild(null)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <Skeleton className="h-64 rounded-[20px]" />
        <Skeleton className="h-64 rounded-[20px]" />
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const [repairing, setRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState('');
  const [repairDone, setRepairDone] = useState(false);
  const [repairFailed, setRepairFailed] = useState(false);

  const handleRepair = async () => {
    setRepairing(true);
    setRepairStatus('Reparatur wird gestartet...');
    setRepairFailed(false);
    const errorContext = JSON.stringify({
      type: 'data_loading',
      message: error.message,
      stack: (error.stack ?? '').split('\n').slice(0, 10).join('\n'),
      url: window.location.href,
    });
    try {
      const resp = await fetch(REPAIR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appgroup_id: APPGROUP_ID, error_context: errorContext }),
      });
      if (!resp.ok || !resp.body) { setRepairing(false); setRepairFailed(true); return; }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data: ')) continue;
          const content = line.slice(6);
          if (content.startsWith('[STATUS]')) setRepairStatus(content.replace(/^\[STATUS]\s*/, ''));
          if (content.startsWith('[DONE]')) { setRepairDone(true); setRepairing(false); }
          if (content.startsWith('[ERROR]') && !content.includes('Dashboard-Links')) setRepairFailed(true);
        }
      }
    } catch { setRepairing(false); setRepairFailed(true); }
  };

  if (repairDone) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <IconCheck size={22} className="text-green-500" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-1">Dashboard repariert</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Das Problem wurde behoben. Bitte laden Sie die Seite neu.</p>
        </div>
        <Button size="sm" onClick={() => window.location.reload()}>
          <IconRefresh size={14} className="mr-1" />Neu laden
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <IconAlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{repairing ? repairStatus : error.message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry} disabled={repairing}>Erneut versuchen</Button>
        <Button size="sm" onClick={handleRepair} disabled={repairing}>
          {repairing
            ? <span className="inline-block w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" />
            : <IconTool size={14} className="mr-1" />}
          {repairing ? 'Reparatur läuft...' : 'Dashboard reparieren'}
        </Button>
      </div>
      {repairFailed && <p className="text-sm text-destructive">Automatische Reparatur fehlgeschlagen. Bitte kontaktieren Sie den Support.</p>}
    </div>
  );
}
