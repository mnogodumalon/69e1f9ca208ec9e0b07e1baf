/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'webkamera_verwaltung' | 'bilderfassung';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "webkamera_verwaltung": {
    "key": "webkamera_verwaltung",
    "appId": "69e1f9b9e099184b4f891185",
    "label": "Webkamera-Verwaltung",
    "pascal": "WebkameraVerwaltung",
    "single": "WebkameraVerwaltungEntry"
  },
  "bilderfassung": {
    "key": "bilderfassung",
    "appId": "69e1f9bc1913ab36ef161891",
    "label": "Bilderfassung",
    "pascal": "Bilderfassung",
    "single": "BilderfassungEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "webkamera_verwaltung": {
    "kamera_name": {
      "key": "kamera_name",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Kameraname",
      "writable": true,
      "maxLength": 4000
    },
    "kamera_standort": {
      "key": "kamera_standort",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Standortbeschreibung",
      "writable": true,
      "maxLength": 4000
    },
    "kamera_url": {
      "key": "kamera_url",
      "fulltype": "string/url",
      "kind": "url",
      "required": false,
      "label": "Stream-URL",
      "writable": true,
      "autoComplete": "url"
    },
    "kamera_geo": {
      "key": "kamera_geo",
      "fulltype": "geo",
      "kind": "geo",
      "required": false,
      "label": "Geografischer Standort",
      "writable": true
    },
    "kamera_beschreibung": {
      "key": "kamera_beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "kamera_status": {
      "key": "kamera_status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "aktiv",
        "inaktiv",
        "wartung"
      ]
    }
  },
  "bilderfassung": {
    "schritt1": {
      "key": "schritt1",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Schritt1",
      "writable": false
    },
    "referenzbild_datei": {
      "key": "referenzbild_datei",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Referenzbild",
      "writable": false
    },
    "kamera_referenz": {
      "key": "kamera_referenz",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Webkamera",
      "writable": true,
      "targetAppId": "69e1f9b9e099184b4f891185",
      "targetEntity": "webkamera_verwaltung"
    },
    "aufnahmezeitpunkt": {
      "key": "aufnahmezeitpunkt",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Aufnahmezeitpunkt",
      "writable": true
    },
    "bild_datei": {
      "key": "bild_datei",
      "fulltype": "file",
      "kind": "file",
      "required": true,
      "label": "Bild",
      "writable": false
    },
    "bild_notiz": {
      "key": "bild_notiz",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notiz",
      "writable": true
    },
    "bild_qualitaet": {
      "key": "bild_qualitaet",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Bildqualität",
      "writable": true,
      "options": [
        "gut",
        "mittel",
        "schlecht"
      ]
    },
    "ki_prompt": {
      "key": "ki_prompt",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Prompt",
      "writable": true
    },
    "ki_auswertung": {
      "key": "ki_auswertung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "KI-Auswertung",
      "writable": true
    },
    "ki_messwert": {
      "key": "ki_messwert",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Messwert",
      "writable": true
    },
    "ki_kriterium_erfuellt": {
      "key": "ki_kriterium_erfuellt",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Kriterium erfüllt",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "webkamera_verwaltung": [
    {
      "kind": "choice",
      "field": "kamera_status",
      "count": 3
    }
  ],
  "bilderfassung": [
    {
      "kind": "choice",
      "field": "bild_qualitaet",
      "count": 3
    },
    {
      "kind": "record",
      "field": "kamera_referenz",
      "targetEntity": "webkamera_verwaltung"
    }
  ]
};

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — runtime bundle first, generated label second. */
export function labelOf(entity: EntityKey, key: string): string {
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
