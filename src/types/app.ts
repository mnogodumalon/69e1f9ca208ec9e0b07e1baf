import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface WebkameraVerwaltung {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    kamera_name?: string;
    kamera_standort?: string;
    kamera_url?: string;
    kamera_geo?: GeoLocation; // { lat, long, info }
    kamera_beschreibung?: string;
    kamera_status?: LookupValue;
  };
}

export interface Bilderfassung {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    schritt1?: string;
    referenzbild_datei?: string;
    kamera_referenz?: RecordUrl; // applookup -> URL zu 'WebkameraVerwaltung' Record
    aufnahmezeitpunkt?: string; // Format: YYYY-MM-DD oder ISO String
    bild_datei?: string;
    bild_notiz?: string;
    bild_qualitaet?: LookupValue;
    ki_prompt?: string;
    ki_auswertung?: string;
    ki_messwert?: number;
    ki_kriterium_erfuellt?: boolean;
  };
}

export const APP_IDS = {
  WEBKAMERA_VERWALTUNG: '69e1f9b9e099184b4f891185',
  BILDERFASSUNG: '69e1f9bc1913ab36ef161891',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'webkamera_verwaltung': {
    kamera_status: [{ key: "aktiv", get label() { return lookupLabel('webkamera_verwaltung', 'kamera_status', "aktiv") ?? "Aktiv"; } }, { key: "inaktiv", get label() { return lookupLabel('webkamera_verwaltung', 'kamera_status', "inaktiv") ?? "Inaktiv"; } }, { key: "wartung", get label() { return lookupLabel('webkamera_verwaltung', 'kamera_status', "wartung") ?? "In Wartung"; } }],
  },
  'bilderfassung': {
    bild_qualitaet: [{ key: "gut", get label() { return lookupLabel('bilderfassung', 'bild_qualitaet', "gut") ?? "Gut"; } }, { key: "mittel", get label() { return lookupLabel('bilderfassung', 'bild_qualitaet', "mittel") ?? "Mittel"; } }, { key: "schlecht", get label() { return lookupLabel('bilderfassung', 'bild_qualitaet', "schlecht") ?? "Schlecht"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'webkamera_verwaltung': {
    'kamera_name': 'string/text',
    'kamera_standort': 'string/text',
    'kamera_url': 'string/url',
    'kamera_geo': 'geo',
    'kamera_beschreibung': 'string/textarea',
    'kamera_status': 'lookup/radio',
  },
  'bilderfassung': {
    'schritt1': 'file',
    'referenzbild_datei': 'file',
    'kamera_referenz': 'applookup/select',
    'aufnahmezeitpunkt': 'date/datetimeminute',
    'bild_datei': 'file',
    'bild_notiz': 'string/textarea',
    'bild_qualitaet': 'lookup/radio',
    'ki_prompt': 'string/textarea',
    'ki_auswertung': 'string/textarea',
    'ki_messwert': 'number',
    'ki_kriterium_erfuellt': 'bool',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateWebkameraVerwaltung = StripLookup<WebkameraVerwaltung['fields']>;
export type CreateBilderfassung = StripLookup<Bilderfassung['fields']>;