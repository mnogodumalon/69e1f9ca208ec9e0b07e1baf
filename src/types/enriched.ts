import type { Bilderfassung } from './app';

export type EnrichedBilderfassung = Bilderfassung & {
  kamera_referenzName: string;
};
