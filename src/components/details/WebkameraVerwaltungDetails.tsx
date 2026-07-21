import type { WebkameraVerwaltung, Bilderfassung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface WebkameraVerwaltungDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: WebkameraVerwaltung;
  /** 1:N „Bilderfassung": VOLLE Liste — der Block filtert auf diesen Record. */
  bilderfassungList: Bilderfassung[];
  /** Zeilen-Klick → overlay.push auf das Bilderfassung-Detail (nie der Edit-Dialog). */
  onOpenBilderfassung: (record: Bilderfassung) => void;
  /** Kontextuelles „+": öffnet den Bilderfassung-Dialog mit diesem Record vorgesetzt. */
  onAddBilderfassung: () => void;
}

export function WebkameraVerwaltungDetails({
  record,
  bilderfassungList,
  onOpenBilderfassung,
  onAddBilderfassung,
}: WebkameraVerwaltungDetailsProps) {
  return (
    <>
      <RecordSection title="Details" cols={2}>
        <RecordField label="Kameraname" value={record.fields.kamera_name} format="text" />
        <RecordField label="Standortbeschreibung" value={record.fields.kamera_standort} format="text" />
        <RecordField label="Stream-URL" value={record.fields.kamera_url} format="url" />
        <RecordField label="Geografischer Standort" value={record.fields.kamera_geo?.info ?? (record.fields.kamera_geo ? `${record.fields.kamera_geo.lat}, ${record.fields.kamera_geo.long}` : null)} />
        <RecordField label="Beschreibung" value={record.fields.kamera_beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label="Status" value={record.fields.kamera_status} format="pill" />
      </RecordSection>

      <SatelliteSection
        title="Bilderfassung"
        items={bilderfassungList.filter(r => extractRecordId(r.fields.kamera_referenz) === record.record_id)}
        map={r => ({ name: 'Bilderfassung', meta: r.fields.aufnahmezeitpunkt })}
        onOpen={onOpenBilderfassung}
        onAdd={onAddBilderfassung}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.WEBKAMERA_VERWALTUNG} recordId={record.record_id} />
    </>
  );
}
