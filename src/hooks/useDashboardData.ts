import { useState, useEffect, useMemo, useCallback } from 'react';
import type { WebkameraVerwaltung, Bilderfassung } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [webkameraVerwaltung, setWebkameraVerwaltung] = useState<WebkameraVerwaltung[]>([]);
  const [bilderfassung, setBilderfassung] = useState<Bilderfassung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [webkameraVerwaltungData, bilderfassungData] = await Promise.all([
        LivingAppsService.getWebkameraVerwaltung(),
        LivingAppsService.getBilderfassung(),
      ]);
      setWebkameraVerwaltung(webkameraVerwaltungData);
      setBilderfassung(bilderfassungData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [webkameraVerwaltungData, bilderfassungData] = await Promise.all([
          LivingAppsService.getWebkameraVerwaltung(),
          LivingAppsService.getBilderfassung(),
        ]);
        setWebkameraVerwaltung(webkameraVerwaltungData);
        setBilderfassung(bilderfassungData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const webkameraVerwaltungMap = useMemo(() => {
    const m = new Map<string, WebkameraVerwaltung>();
    webkameraVerwaltung.forEach(r => m.set(r.record_id, r));
    return m;
  }, [webkameraVerwaltung]);

  return { webkameraVerwaltung, setWebkameraVerwaltung, bilderfassung, setBilderfassung, loading, error, fetchAll, webkameraVerwaltungMap };
}