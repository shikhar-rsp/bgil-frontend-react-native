/**
 * Endorsement fixtures, ported from the web `toolkits/sidedrawer-endorsement`.
 *
 * Web generates 30 records dated every 5 days back from today, all under one
 * holder name. The names are varied here so the search field is actually
 * exercisable on a phone — everything else matches the web fixture.
 */
import type { FilterGroup } from '@atlas-ds/react-native';

export type Endorsement = {
  id: number;
  holderName: string;
  /** Line of business — Health / Motor / Travel / Life. */
  type: string;
  policyNumber: string;
  /** ISO timestamp of when the endorsement was raised. */
  createdDate: string;
};

export const ENDORSEMENT_LOBS = ['Health', 'Motor', 'Travel', 'Life'];

const HOLDER_NAMES = [
  'Rajesh Kumar',
  'Priya Sharma',
  'Amit Patel',
  'Neha Gupta',
  'Vikram Singh',
  'Kavita Joshi',
];

/** Days back from today counted as "recent" — the default list window. */
export const RECENT_WINDOW_DAYS = 30;

export const ENDORSEMENTS: Endorsement[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i * 5);
  return {
    id: i + 1,
    holderName: HOLDER_NAMES[i % HOLDER_NAMES.length],
    policyNumber: `BA${6757 + i}`,
    type: ENDORSEMENT_LOBS[i % ENDORSEMENT_LOBS.length],
    createdDate: date.toISOString(),
  };
});

export const ENDORSEMENT_FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'type',
    label: 'LOB Type',
    options: ENDORSEMENT_LOBS.map((lob) => ({ value: lob, label: lob })),
  },
];

/** `dd-mm-yy`, matching the web card's "Issued On". */
export const formatIssuedOn = (iso: string): string => {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(-2);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${yy}`;
};

/** True when `iso` falls within the last `RECENT_WINDOW_DAYS` days. */
export const isRecent = (iso: string): boolean => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_WINDOW_DAYS);
  return new Date(iso) >= cutoff;
};
