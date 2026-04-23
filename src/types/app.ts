// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface Bilderfassung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kamera_referenz?: string; // applookup -> URL zu 'WebkameraVerwaltung' Record
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

export interface WebkameraVerwaltung {
  record_id: string;
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

export const APP_IDS = {
  BILDERFASSUNG: '69e1f9bc1913ab36ef161891',
  WEBKAMERA_VERWALTUNG: '69e1f9b9e099184b4f891185',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'bilderfassung': {
    bild_qualitaet: [{ key: "mittel", label: "Mittel" }, { key: "schlecht", label: "Schlecht" }, { key: "gut", label: "Gut" }],
  },
  'webkamera_verwaltung': {
    kamera_status: [{ key: "aktiv", label: "Aktiv" }, { key: "inaktiv", label: "Inaktiv" }, { key: "wartung", label: "In Wartung" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'bilderfassung': {
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
  'webkamera_verwaltung': {
    'kamera_name': 'string/text',
    'kamera_standort': 'string/text',
    'kamera_url': 'string/url',
    'kamera_geo': 'geo',
    'kamera_beschreibung': 'string/textarea',
    'kamera_status': 'lookup/radio',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateBilderfassung = StripLookup<Bilderfassung['fields']>;
export type CreateWebkameraVerwaltung = StripLookup<WebkameraVerwaltung['fields']>;