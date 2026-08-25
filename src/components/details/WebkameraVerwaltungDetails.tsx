import type { WebkameraVerwaltung, Bilderfassung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MapRouteLinks } from '@/components/widgets/MapWidget';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface WebkameraVerwaltungDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: WebkameraVerwaltung;
  /** 1:N „Bilderfassung" (kamera_referenz): VOLLE Liste — der Block filtert auf diesen Record. */
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
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('webkamera_verwaltung', 'kamera_name')} value={record.fields.kamera_name} format="text" />
        <RecordField label={fieldLabel('webkamera_verwaltung', 'kamera_standort')} value={record.fields.kamera_standort} format="text" />
        <RecordField label={fieldLabel('webkamera_verwaltung', 'kamera_url')} value={record.fields.kamera_url} format="url" />
        <RecordField label={fieldLabel('webkamera_verwaltung', 'kamera_geo')}>
          {record.fields.kamera_geo ? (
            <div className="space-y-1">
              <div>{record.fields.kamera_geo.info ?? `${record.fields.kamera_geo.lat}, ${record.fields.kamera_geo.long}`}</div>
              {/* Directions links — the map popup is hover-fleeting; the overlay
                  is the only mobile-reachable place for navigation. */}
              <MapRouteLinks lat={record.fields.kamera_geo.lat} long={record.fields.kamera_geo.long} />
            </div>
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('webkamera_verwaltung', 'kamera_beschreibung')} value={record.fields.kamera_beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('webkamera_verwaltung', 'kamera_status')} value={record.fields.kamera_status} format="pill" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('bilderfassung')}
        items={bilderfassungList.filter(r => extractRecordId(r.fields.kamera_referenz) === record.record_id)}
        map={r => ({ name: appLabel('bilderfassung'), meta: r.fields.aufnahmezeitpunkt })}
        onOpen={onOpenBilderfassung}
        onAdd={onAddBilderfassung}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.WEBKAMERA_VERWALTUNG} recordId={record.record_id} />
    </>
  );
}
