import type { Bilderfassung, WebkameraVerwaltung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
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
      <RecordSection title="Details" cols={2}>
        <RecordField label="Schritt1" className="md:col-span-2">
          {record.fields.schritt1 ? (
            <MediaThumbnail src={record.fields.schritt1 as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label="Referenzbild" className="md:col-span-2">
          {record.fields.referenzbild_datei ? (
            <MediaThumbnail src={record.fields.referenzbild_datei as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label="Aufnahmezeitpunkt" value={record.fields.aufnahmezeitpunkt} format="datetime" />
        <RecordField label="Bild" className="md:col-span-2">
          {record.fields.bild_datei ? (
            <MediaThumbnail src={record.fields.bild_datei as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label="Notiz" value={record.fields.bild_notiz} format="longtext" className="md:col-span-2" />
        <RecordField label="Bildqualität" value={record.fields.bild_qualitaet} format="pill" />
        <RecordField label="Prompt" value={record.fields.ki_prompt} format="longtext" className="md:col-span-2" />
        <RecordField label="KI-Auswertung" value={record.fields.ki_auswertung} format="longtext" className="md:col-span-2" />
        <RecordField label="Messwert" value={record.fields.ki_messwert} format="text" />
        <RecordField label="Kriterium erfüllt" value={record.fields.ki_kriterium_erfuellt} format="bool" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title="Verknüpft" cols={1}>
        <RecordRelation
          label="Webkamera"
          name={kamera_referenzTarget?.fields.kamera_name ?? '—'}
          meta={[kamera_referenzTarget?.fields.kamera_standort].filter(Boolean).join(' · ') || undefined}
          onClick={kamera_referenzTarget && onOpenWebkameraVerwaltung ? () => onOpenWebkameraVerwaltung!(kamera_referenzTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.BILDERFASSUNG} recordId={record.record_id} />
    </>
  );
}
