import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import type { Bilderfassung, WebkameraVerwaltung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import {
  RecordView, RecordHeader, RecordKeyFacts, RecordSection, RecordField,
  RecordAttachments, RecordViewSkeleton, RecordViewEmpty,
} from '@/components/widgets/RecordView';
import { BilderfassungDialog } from '@/components/dialogs/BilderfassungDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { formEnhancements } from '@/config/form-enhancements/Bilderfassung';
import { evalComputed } from '@/config/form-enhancements/types';
import { t, appLabel, fieldLabel, localeTag, CURRENCY } from '@/i18n';

export default function BilderfassungDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Bilderfassung | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [webkameraVerwaltungList, setWebkameraVerwaltungList] = useState<WebkameraVerwaltung[]>([]);

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [mainData, webkameraVerwaltungData] = await Promise.all([
        LivingAppsService.getBilderfassung(),
        LivingAppsService.getWebkameraVerwaltung(),
      ]);
      setWebkameraVerwaltungList(webkameraVerwaltungData);
      setRecord(mainData.find(r => r.record_id === id) ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(fields: Bilderfassung['fields']) {
    if (!record) return;
    await LivingAppsService.updateBilderfassungEntry(record.record_id, fields);
    await loadData();
    setEditing(false);
  }

  async function handleDelete() {
    if (!record) return;
    await LivingAppsService.deleteBilderfassungEntry(record.record_id);
    setDeleteOpen(false);
    navigate('/bilderfassung');
  }

  function getWebkameraVerwaltungDisplayName(url?: unknown) {
    if (!url) return '—';
    const refId = extractRecordId(url);
    return webkameraVerwaltungList.find(r => r.record_id === refId)?.fields.kamera_name ?? '—';
  }

  if (loading) {
    return <RecordViewSkeleton />;
  }

  if (!record) {
    return (
      <RecordViewEmpty
        title={t('not_found')}
        action={
          <Button variant="ghost" onClick={() => navigate('/bilderfassung')}>
            <IconArrowLeft className="h-4 w-4 mr-1.5" />
            {t('back')}
          </Button>
        }
      />
    );
  }

  return (
    <RecordView
      onBack={() => navigate('/bilderfassung')}
      onEdit={() => setEditing(true)}
      backLabel={t('back')}
      editLabel={t('edit_button')}
    >
      <RecordHeader title={appLabel('bilderfassung')} />

      {(() => {
        const lookupLists: Record<string, unknown> = {
          kamera_referenz: webkameraVerwaltungList,
        };
        const fmtComputed = (k: string, n: number) =>
          /(?:kosten|preis|betrag|gesamt|netto|brutto|summe|mwst|rabatt|anzahlung|umsatz|saldo)/i.test(k)
            ? n.toLocaleString(localeTag(), { style: 'currency', currency: CURRENCY, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : n.toLocaleString(localeTag(), { maximumFractionDigits: 2 });
        const computedFacts = Object.entries(formEnhancements.computed)
          .map(([key, formula]) => {
            const v = evalComputed(formula, record!.fields as Record<string, unknown>, { lookupLists });
            return v != null
              ? { label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), value: fmtComputed(key, v) }
              : null;
          })
          .filter((f): f is { label: string; value: string } => f !== null);
        return computedFacts.length > 0 ? <RecordKeyFacts items={computedFacts} /> : null;
      })()}

      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('bilderfassung', 'kamera_referenz')} value={getWebkameraVerwaltungDisplayName(record.fields.kamera_referenz)} format="text" />
        <RecordField label={fieldLabel('bilderfassung', 'aufnahmezeitpunkt')} value={record.fields.aufnahmezeitpunkt} format="datetime" />
        <RecordField label={fieldLabel('bilderfassung', 'bild_notiz')} value={record.fields.bild_notiz} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('bilderfassung', 'bild_qualitaet')} value={record.fields.bild_qualitaet} format="pill" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_prompt')} value={record.fields.ki_prompt} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_auswertung')} value={record.fields.ki_auswertung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_messwert')} value={record.fields.ki_messwert} format="text" />
        <RecordField label={fieldLabel('bilderfassung', 'ki_kriterium_erfuellt')} value={record.fields.ki_kriterium_erfuellt} format="bool" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.BILDERFASSUNG} recordId={record.record_id} />

      <div className="flex justify-end pt-2">
        <Button variant="ghost" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
          <IconTrash className="h-4 w-4 mr-1.5" />
          {t('delete')}
        </Button>
      </div>

      <BilderfassungDialog
        open={editing}
        onClose={() => setEditing(false)}
        onSubmit={handleUpdate}
        defaultValues={record.fields}
        recordId={record.record_id}
        webkameraVerwaltungList={webkameraVerwaltungList}
        enablePhotoScan={AI_PHOTO_SCAN['Bilderfassung']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Bilderfassung']}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_entity', { entity: appLabel('bilderfassung') })}
        description={t('confirm_delete_desc')}
      />
    </RecordView>
  );
}
