import type { Bilderfassung, WebkameraVerwaltung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface BilderfassungDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Bilderfassung;
  /** N:1-Ziel „WebkameraVerwaltung": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  webkameraVerwaltungList: WebkameraVerwaltung[];
  /** Klick auf die WebkameraVerwaltung-Relation → overlay.push auf dessen Detail. */
  onOpenWebkameraVerwaltung?: (record: WebkameraVerwaltung) => void;
}

export function BilderfassungDetails({
  record,
  webkameraVerwaltungList,
  onOpenWebkameraVerwaltung,
}: BilderfassungDetailsProps) {
  const kamera_referenzTarget = webkameraVerwaltungList.find(r => r.record_id === extractRecordId(record.fields.kamera_referenz));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('bilderfassung', 'schritt1')} className="md:col-span-2">
          {record.fields.schritt1 ? (
            <MediaThumbnail src={record.fields.schritt1 as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('bilderfassung', 'referenzbild_datei')} className="md:col-span-2">
          {record.fields.referenzbild_datei ? (
            <MediaThumbnail src={record.fields.referenzbild_datei as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('bilderfassung', 'aufnahmezeitpunkt')} value={record.fields.aufnahmezeitpunkt} format="datetime" />
        <RecordField label={fieldLabel('bilderfassung', 'bild_datei')} className="md:col-span-2">
          {record.fields.bild_datei ? (
            <MediaThumbnail src={record.fields.bild_datei as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('bilderfassung', 'bild_notiz')} value={record.fields.bild_notiz} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('bilderfassung', 'bild_qualitaet')} value={record.fields.bild_qualitaet} format="pill" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_prompt')} value={record.fields.ki_prompt} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_auswertung')} value={record.fields.ki_auswertung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_messwert')} value={record.fields.ki_messwert} format="text" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_kriterium_erfuellt')} value={record.fields.ki_kriterium_erfuellt} format="bool" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('bilderfassung', 'kamera_referenz')}
          name={kamera_referenzTarget?.fields.kamera_name ?? '—'}
          meta={[kamera_referenzTarget?.fields.kamera_standort].filter(Boolean).join(' · ') || undefined}
          onClick={kamera_referenzTarget && onOpenWebkameraVerwaltung ? () => onOpenWebkameraVerwaltung!(kamera_referenzTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.BILDERFASSUNG} recordId={record.record_id} />
    </>
  );
}
