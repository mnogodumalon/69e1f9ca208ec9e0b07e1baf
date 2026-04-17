import type { EnrichedBilderfassung } from '@/types/enriched';
import type { Bilderfassung, WebkameraVerwaltung } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface BilderfassungMaps {
  webkameraVerwaltungMap: Map<string, WebkameraVerwaltung>;
}

export function enrichBilderfassung(
  bilderfassung: Bilderfassung[],
  maps: BilderfassungMaps
): EnrichedBilderfassung[] {
  return bilderfassung.map(r => ({
    ...r,
    kamera_referenzName: resolveDisplay(r.fields.kamera_referenz, maps.webkameraVerwaltungMap, 'kamera_name'),
  }));
}
