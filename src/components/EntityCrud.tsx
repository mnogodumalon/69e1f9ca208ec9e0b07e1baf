/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'webkameraVerwaltung'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.webkameraVerwaltung.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.webkameraVerwaltung.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.webkameraVerwaltung.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.webkameraVerwaltung              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   webkamera_verwaltung: kamera_name, kamera_standort, kamera_url, kamera_geo, kamera_beschreibung, kamera_status  ·  ← bilderfassung (list + contextual +)
 *   bilderfassung: schritt1, referenzbild_datei, kamera_referenz, aufnahmezeitpunkt, bild_datei, bild_notiz, bild_qualitaet, ki_prompt, …  ·  → webkamera_verwaltung
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { WebkameraVerwaltung, Bilderfassung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichBilderfassung } from '@/lib/enrich';
import type { EnrichedBilderfassung } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { WebkameraVerwaltungDialog, type WebkameraVerwaltungDialogDefaults } from '@/components/dialogs/WebkameraVerwaltungDialog';
import { WebkameraVerwaltungDetails } from '@/components/details/WebkameraVerwaltungDetails';
import { BilderfassungDialog, type BilderfassungDialogDefaults } from '@/components/dialogs/BilderfassungDialog';
import { BilderfassungDetails } from '@/components/details/BilderfassungDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'webkameraVerwaltung'; record: WebkameraVerwaltung }
  | { type: 'bilderfassung'; record: EnrichedBilderfassung };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  webkameraVerwaltung: EntityCrudApi<WebkameraVerwaltung, WebkameraVerwaltungDialogDefaults>;
  bilderfassung: EntityCrudApi<Bilderfassung, BilderfassungDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { webkameraVerwaltung: WebkameraVerwaltung[]; bilderfassung: EnrichedBilderfassung[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  const [webkameraVerwaltungDialog, setWebkameraVerwaltungDialog] = useState<{ defaults?: WebkameraVerwaltungDialogDefaults; editing?: WebkameraVerwaltung } | null>(null);
  const [bilderfassungDialog, setBilderfassungDialog] = useState<{ defaults?: BilderfassungDialogDefaults; editing?: Bilderfassung } | null>(null);
  const enrichedBilderfassung = useMemo(() => enrichBilderfassung(data.bilderfassung, { webkameraVerwaltungMap: data.webkameraVerwaltungMap }), [data.bilderfassung, data.webkameraVerwaltungMap]);

  function detailWebkameraVerwaltung(record: WebkameraVerwaltung, push = false) {
    const item: OverlayItem = { type: 'webkameraVerwaltung', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitWebkameraVerwaltung(fields: WebkameraVerwaltung['fields']) {
    const editing = webkameraVerwaltungDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setWebkameraVerwaltung(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateWebkameraVerwaltungEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('webkamera_verwaltung')} — ${t('crud_updated')}`, async () => {
        data.setWebkameraVerwaltung(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateWebkameraVerwaltungEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createWebkameraVerwaltungEntry(fields);
      undoToast(`${appLabel('webkamera_verwaltung')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailBilderfassung(record: Bilderfassung, push = false) {
    const rec = enrichedBilderfassung.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'bilderfassung', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitBilderfassung(fields: Bilderfassung['fields']) {
    const editing = bilderfassungDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setBilderfassung(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateBilderfassungEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('bilderfassung')} — ${t('crud_updated')}`, async () => {
        data.setBilderfassung(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateBilderfassungEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createBilderfassungEntry(fields);
      undoToast(`${appLabel('bilderfassung')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <WebkameraVerwaltungDialog
        open={webkameraVerwaltungDialog !== null}
        onClose={() => setWebkameraVerwaltungDialog(null)}
        onSubmit={submitWebkameraVerwaltung}
        defaultValues={webkameraVerwaltungDialog?.defaults}
        recordId={webkameraVerwaltungDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['WebkameraVerwaltung']}
        enablePhotoLocation={AI_PHOTO_LOCATION['WebkameraVerwaltung']}
      />
      <BilderfassungDialog
        open={bilderfassungDialog !== null}
        onClose={() => setBilderfassungDialog(null)}
        onSubmit={submitBilderfassung}
        defaultValues={bilderfassungDialog?.defaults}
        recordId={bilderfassungDialog?.editing?.record_id}
        webkameraVerwaltungList={data.webkameraVerwaltung}
        enablePhotoScan={AI_PHOTO_SCAN['Bilderfassung']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Bilderfassung']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'webkameraVerwaltung') {
            return (
              <>
                <RecordHeader title={top.record.fields.kamera_name ?? appLabel('webkamera_verwaltung')} subtitle={undefined} />
                <WebkameraVerwaltungDetails
                  record={top.record}
                  bilderfassungList={data.bilderfassung}
                  onOpenBilderfassung={(r) => detailBilderfassung(r, true)}
                  onAddBilderfassung={() => setBilderfassungDialog({ defaults: { kamera_referenz: createRecordUrl(APP_IDS.WEBKAMERA_VERWALTUNG, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'bilderfassung') {
            return (
              <>
                <RecordHeader title={appLabel('bilderfassung')} subtitle={top.record.fields.aufnahmezeitpunkt ? formatDate(top.record.fields.aufnahmezeitpunkt) : undefined} />
                <BilderfassungDetails
                  record={top.record}
                  webkameraVerwaltungList={data.webkameraVerwaltung}
                  onOpenWebkameraVerwaltung={(r) => detailWebkameraVerwaltung(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'webkameraVerwaltung') setWebkameraVerwaltungDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'bilderfassung') setBilderfassungDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    webkameraVerwaltung: {
      openCreate: (defaults?: WebkameraVerwaltungDialogDefaults) => setWebkameraVerwaltungDialog({ defaults }),
      openEdit: (record: WebkameraVerwaltung) => setWebkameraVerwaltungDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: WebkameraVerwaltung) => detailWebkameraVerwaltung(record, false),
    },
    bilderfassung: {
      openCreate: (defaults?: BilderfassungDialogDefaults) => setBilderfassungDialog({ defaults }),
      openEdit: (record: Bilderfassung) => setBilderfassungDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Bilderfassung) => detailBilderfassung(record, false),
    },
    enriched: { webkameraVerwaltung: data.webkameraVerwaltung, bilderfassung: enrichedBilderfassung },
  };
}
