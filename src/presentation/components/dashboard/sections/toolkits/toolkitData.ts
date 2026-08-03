import type { AccentColor } from '@atlas-ds/react-native';

/**
 * Mock data behind the Your-Toolkit sheets, ported from the web app's
 * `sections/toolkits/sidedrawer-*.tsx`. The web generates each list inline in
 * its drawer; here they share one module so the sheets stay presentational.
 *
 * Dates are real `Date` objects (the web kept ISO strings and re-parsed them on
 * every filter pass) — the range filter compares them directly.
 */

/** N days before today, at midnight-ish — matches the web's `setDate(-i * 5)`. */
const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "05 mar 2026" — the web's `toLocaleDateString('en-GB', …).toLowerCase()`. */
export const formatLongDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** "05/03/2026" — used by the date-range field. */
export const formatShortDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

/** True when `date` sits inside the (inclusive) range, or the range is unset. */
export const inDateRange = (date: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) {
    return true;
  }
  return date >= start && date <= end;
};

export const isToday = (d: Date): boolean => d.toDateString() === new Date().toDateString();

// ---------------------------------------------------------------------------
// Brochures
// ---------------------------------------------------------------------------

export type Lob = 'Health' | 'Motor' | 'Travel' | 'Life';

export const LOBS: Lob[] = ['Health', 'Motor', 'Travel', 'Life'];

/** Tint used for a line-of-business, so a list reads by colour as well as text. */
export const LOB_COLOR: Record<Lob, AccentColor> = {
  Health: 'emerald',
  Motor: 'blue',
  Travel: 'violet',
  Life: 'amber',
};

export interface Brochure {
  id: number;
  name: string;
  category: Lob;
  uploadedDate: Date;
}

export const BROCHURES: Brochure[] = Array.from({ length: 30 }, (_, i) => {
  const category = LOBS[i % 4];
  return {
    id: i + 1,
    name: `Brochure_${category}_${i + 1}`,
    category,
    uploadedDate: daysAgo(i * 5),
  };
});

// ---------------------------------------------------------------------------
// Learning
// ---------------------------------------------------------------------------

export type CourseStatus = 'Upcoming' | 'Active' | 'Completed';

export interface LearningCourse {
  id: number;
  title: string;
  status: CourseStatus;
  timeRequired: string;
  progress: number;
  createdDate: Date;
}

const COURSE_STATUSES: CourseStatus[] = ['Upcoming', 'Active', 'Completed'];

export const COURSES: LearningCourse[] = Array.from({ length: 30 }, (_, i) => {
  const status = COURSE_STATUSES[i % 3];
  return {
    id: i + 1,
    title: 'Customer Service Excellence',
    status,
    timeRequired: '1 Month (Time required: 1hr/day)',
    progress: status === 'Completed' ? 100 : status === 'Active' ? 25 : 0,
    createdDate: daysAgo(i * 5),
  };
});

export const COURSE_BADGE: Record<CourseStatus, AccentColor> = {
  Active: 'amber',
  Completed: 'lime',
  Upcoming: 'indigo',
};

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export type CampaignStatus = 'New' | 'Active' | 'Completed';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  status: CampaignStatus;
  reward: string;
  timeRequired: string;
  progress: number;
  createdDate: Date;
}

const CAMPAIGN_STATUSES: CampaignStatus[] = ['New', 'Active', 'Completed'];

export const CAMPAIGNS: Campaign[] = Array.from({ length: 30 }, (_, i) => {
  const status = CAMPAIGN_STATUSES[i % 3];
  return {
    id: i + 1,
    title: 'Way to Go! 2026',
    description: 'Special campaign for health insurance sales in January 2026.',
    status,
    reward: 'Trip to Thailand',
    timeRequired: '1 Month (Time required: 1hr/day)',
    progress: status === 'Completed' ? 100 : status === 'Active' ? 25 : 0,
    createdDate: daysAgo(i * 5),
  };
});

export const CAMPAIGN_BADGE: Record<CampaignStatus, AccentColor> = {
  New: 'blue',
  Active: 'amber',
  Completed: 'lime',
};

// ---------------------------------------------------------------------------
// Query tracker
// ---------------------------------------------------------------------------

export type QueryStatus = 'Open' | 'Active' | 'Pending' | 'Resolved' | 'Reopened';

export interface TrackedQuery {
  id: number;
  title: string;
  status: QueryStatus;
  lob: Lob;
  createdDate: Date;
}

export const QUERY_STATUSES: QueryStatus[] = ['Open', 'Active', 'Pending', 'Resolved', 'Reopened'];

const QUERY_TITLES: Record<Lob, string> = {
  Health: 'Health policy claim process',
  Motor: 'Motor insurance claim status',
  Travel: 'Travel insurance renewal query',
  Life: 'Life policy document request',
};

export const QUERIES: TrackedQuery[] = Array.from({ length: 30 }, (_, i) => {
  const lob = LOBS[i % 4];
  return {
    id: i + 1,
    title: QUERY_TITLES[lob],
    status: QUERY_STATUSES[i % 5],
    lob,
    createdDate: daysAgo(i * 5),
  };
});

export const QUERY_BADGE: Record<QueryStatus, AccentColor> = {
  Open: 'blue',
  Active: 'amber',
  Pending: 'red',
  Resolved: 'lime',
  Reopened: 'violet',
};

// ---------------------------------------------------------------------------
// Pay-in-slips
// ---------------------------------------------------------------------------

export type SlipStatus = 'Verified' | 'Pending' | 'Resolved';

export interface PayInSlip {
  id: number;
  slipNumber: string;
  status: SlipStatus;
  policyNumber: string;
  holderName: string;
  premiumAmount: number;
  createdDate: Date;
}

const SLIP_STATUSES: SlipStatus[] = ['Verified', 'Pending', 'Resolved'];

export const PAY_IN_SLIPS: PayInSlip[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  slipNumber: 'PIS/2025/001234',
  status: SLIP_STATUSES[i % 3],
  policyNumber: '86100',
  holderName: 'Rajesh Kumar',
  premiumAmount: 10000,
  createdDate: daysAgo(i * 5),
}));

export const SLIP_BADGE: Record<SlipStatus, AccentColor> = {
  Verified: 'lime',
  Pending: 'amber',
  Resolved: 'violet',
};

// ---------------------------------------------------------------------------
// Renewal calendar
// ---------------------------------------------------------------------------

export type RenewalEntryStatus = 'Active' | 'In Progress' | 'Expired';

export interface RenewalEntry {
  id: number;
  policyNumber: string;
  status: RenewalEntryStatus;
  type: Lob;
  customerName: string;
  /** Days until expiry — the web stored "N Days" and re-parsed it. */
  expiringInDays: number;
  createdDate: Date;
}

const RENEWAL_STATUSES: RenewalEntryStatus[] = ['Active', 'In Progress', 'Expired'];

export const RENEWAL_ENTRIES: RenewalEntry[] = Array.from({ length: 30 }, (_, i) => {
  const type = LOBS[i % 4];
  return {
    id: i + 1,
    policyNumber: `BAGIC/${type.substring(0, 3).toUpperCase()}/2024/00${1234 + i}`,
    status: RENEWAL_STATUSES[i % 3],
    type,
    customerName: 'Priti Sinha',
    expiringInDays: i % 15,
    createdDate: daysAgo(i * 5),
  };
});

export const RENEWAL_BADGE: Record<RenewalEntryStatus, AccentColor> = {
  Active: 'lime',
  'In Progress': 'violet',
  Expired: 'red',
};

/** "Today" for 0, else "N Days" — the web's `formatExpiringIn`. */
export const formatExpiringIn = (days: number): string => (days === 0 ? 'Today' : `${days} Days`);

/** Quick expiry bands above the renewal list. */
export const RENEWAL_QUICK_FILTERS = ['Today', '7 days', '14 days', '30 days', '60 days', '90 days'];

/** Upper bound in days for a quick filter chip. */
export const quickFilterMaxDays = (filter: string): number => {
  if (filter === 'Today') {
    return 0;
  }
  const parsed = Number.parseInt(filter, 10);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};
