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

/** N hours before now — the web's `setHours(-(i + 1) * 2)` for the newest rows. */
const hoursAgo = (n: number): Date => {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ordinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

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

// ---------------------------------------------------------------------------
// Online payment tracker
// ---------------------------------------------------------------------------

export type PaymentStatus = 'Received' | 'Failed' | 'Pending';

export interface PaymentRecord {
  id: number;
  customer: string;
  status: PaymentStatus;
  amount: number;
  policyNumber: string;
  transactionId: string;
  traceId: string;
  /** Scrutiny / quote number — the web labels it both ways. */
  quoteNumber: string;
  floatNumber: string;
  date: Date;
}

export const PAYMENT_STATUSES: PaymentStatus[] = ['Received', 'Failed', 'Pending'];

export const PAYMENTS: PaymentRecord[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  customer: 'Rajesh Kumar',
  status: PAYMENT_STATUSES[i % 3],
  amount: 10000 + i * 500,
  policyNumber: `BA20260${i + 1}`,
  transactionId: `TXN202600${i + 1}`,
  traceId: `TR202600${i + 1}`,
  quoteNumber: `SCR202600${i + 1}`,
  floatNumber: `CST26${i + 1}`,
  // Same seeding as the float list: the newest few hours apart, the rest days.
  date: i < 5 ? hoursAgo((i + 1) * 2) : daysAgo(i * 5),
}));

export const PAYMENT_BADGE: Record<PaymentStatus, AccentColor> = {
  Received: 'lime',
  Failed: 'red',
  Pending: 'amber',
};

// ---------------------------------------------------------------------------
// Pre-inspection
// ---------------------------------------------------------------------------

export type InspectionStatus = 'Completed' | 'Image Uploaded' | 'Pending Upload';
export type InspectionType = 'Self' | '3rd Party';

export interface PreInspectionRecord {
  id: number;
  /** Inspection reference, e.g. `BA/HEA/9838836`. */
  reference: string;
  status: InspectionStatus;
  type: Lob;
  holderName: string;
  inspectionType: InspectionType;
  policyNumber: number;
  expiryDate: Date;
  createdDate: Date;
}

export const INSPECTION_STATUSES: InspectionStatus[] = [
  'Completed',
  'Image Uploaded',
  'Pending Upload',
];

export const INSPECTION_TYPES: InspectionType[] = ['Self', '3rd Party'];

export const PRE_INSPECTIONS: PreInspectionRecord[] = Array.from({ length: 30 }, (_, i) => {
  const type = LOBS[i % 4];
  return {
    id: i + 1,
    reference: `BA/${type.substring(0, 3).toUpperCase()}/${9838836 + i}`,
    status: INSPECTION_STATUSES[i % 3],
    type,
    holderName: 'Rajesh Kumar',
    inspectionType: INSPECTION_TYPES[i % 2],
    policyNumber: 87654321 + i,
    // The web hard-codes "12-12-26" as a string and re-parses it per render.
    expiryDate: new Date(2026, 11, 12),
    createdDate: daysAgo(i * 5),
  };
});

export const INSPECTION_BADGE: Record<InspectionStatus, AccentColor> = {
  Completed: 'lime',
  'Image Uploaded': 'blue',
  'Pending Upload': 'amber',
};

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

/**
 * `claim Initiated` is lower-cased in the web's data and shown verbatim in its
 * badge. Kept as-is so the two apps read identically — worth fixing in both at
 * once rather than diverging here.
 */
export type ClaimStatus =
  | 'Amount Received'
  | 'claim Initiated'
  | 'Amount Not Received'
  | 'Amount Processing';

export interface ClaimRecord {
  id: number;
  policyNumber: string;
  status: ClaimStatus;
  type: Lob;
  claimId: number;
  holderName: string;
  amount: number;
  createdDate: Date;
}

export const CLAIM_STATUSES: ClaimStatus[] = [
  'Amount Received',
  'claim Initiated',
  'Amount Not Received',
  'Amount Processing',
];

export const CLAIMS: ClaimRecord[] = Array.from({ length: 30 }, (_, i) => {
  const type = LOBS[i % 4];
  return {
    id: i + 1,
    policyNumber: `BA/${type.substring(0, 3).toUpperCase()}/9838836`,
    status: CLAIM_STATUSES[i % 4],
    type,
    claimId: 86100 + i,
    holderName: 'Rajesh Kumar',
    amount: 10000 + i * 500,
    createdDate: daysAgo(i * 5),
  };
});

export const CLAIM_BADGE: Record<ClaimStatus, AccentColor> = {
  'Amount Received': 'lime',
  'claim Initiated': 'amber',
  'Amount Not Received': 'red',
  'Amount Processing': 'violet',
};

// ---------------------------------------------------------------------------
// Track leads
// ---------------------------------------------------------------------------

export type LeadStatus = 'Quota Shared' | 'Proposal Submitted' | 'Payment Pending';
export type LeadTemperature = 'hot' | 'cold';

export interface TrackedLead {
  id: number;
  holderName: string;
  status: LeadStatus;
  type: Lob;
  leadType: LeadTemperature;
  followupDate: Date;
  createdDate: Date;
}

export const LEAD_STATUSES: LeadStatus[] = [
  'Quota Shared',
  'Proposal Submitted',
  'Payment Pending',
];

export const LEAD_TEMPERATURES: LeadTemperature[] = ['hot', 'cold'];

/** "Hot Lead" / "Cold Lead" — the web's label for each temperature. */
export const LEAD_TEMPERATURE_LABEL: Record<LeadTemperature, string> = {
  hot: 'Hot Lead',
  cold: 'Cold Lead',
};

export const TRACKED_LEADS: TrackedLead[] = Array.from({ length: 30 }, (_, i) => {
  const date = daysAgo(i * 5);
  return {
    id: i + 1,
    holderName: 'Rajesh Kumar',
    status: LEAD_STATUSES[i % 3],
    type: LOBS[i % 4],
    leadType: LEAD_TEMPERATURES[i % 2],
    // The web seeds both from the same date; kept as separate fields so a real
    // follow-up date can diverge without touching the shape.
    followupDate: date,
    createdDate: date,
  };
});

export const LEAD_BADGE: Record<LeadStatus, AccentColor> = {
  'Quota Shared': 'blue',
  'Proposal Submitted': 'emerald',
  'Payment Pending': 'red',
};

export const LEAD_TEMPERATURE_BADGE: Record<LeadTemperature, AccentColor> = {
  hot: 'amber',
  cold: 'blue',
};

/** "05-mar-2026" — the web's `en-GB` short-month parts, dashed and lowercased. */
export const formatDashMonthDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;

// ---------------------------------------------------------------------------
// Endorsements
// ---------------------------------------------------------------------------

export interface EndorsementRecord {
  id: number;
  holderName: string;
  policyNumber: string;
  type: Lob;
  createdDate: Date;
}

export const ENDORSEMENTS: EndorsementRecord[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  holderName: 'Rajesh Kumar',
  policyNumber: `BA${6757 + i}`,
  type: LOBS[i % 4],
  createdDate: daysAgo(i * 5),
}));

/** "05-03-26" — the web's `en-GB` 2-digit parts with slashes swapped for dashes. */
export const formatDashDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getFullYear(),
  ).slice(-2)}`;

// ---------------------------------------------------------------------------
// Agent float (replenishment)
// ---------------------------------------------------------------------------

export type FloatStatus = 'Successful' | 'Failed' | 'In Progress';

export interface FloatTransaction {
  id: number;
  customer: string;
  status: FloatStatus;
  amount: number;
  date: Date;
}

const FLOAT_STATUSES: FloatStatus[] = ['Successful', 'Failed', 'In Progress'];

/**
 * The web seeds the five newest rows a couple of hours apart and the rest five
 * days apart, so the list shows off both halves of `formatFloatDate`.
 */
export const FLOAT_TRANSACTIONS: FloatTransaction[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  customer: 'Rajesh Kumar',
  status: FLOAT_STATUSES[i % 3],
  amount: 10000 + i * 500,
  date: i < 5 ? hoursAgo((i + 1) * 2) : daysAgo(i * 5),
}));

export const FLOAT_BADGE: Record<FloatStatus, AccentColor> = {
  Successful: 'lime',
  Failed: 'red',
  'In Progress': 'amber',
};

/** Amount colour follows the outcome, so the column reads without the badge. */
export const FLOAT_AMOUNT_COLOR: Record<FloatStatus, string> = {
  Successful: '#4D7C0F',
  Failed: '#B91C1C',
  'In Progress': '#1E293B',
};

/** Today's rows read "3 hours ago"; anything older, "12th Mar 26". */
export const formatFloatDate = (d: Date): string => {
  if (isToday(d)) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    return mins < 60 ? `${mins} mins ago` : `${Math.floor(mins / 60)} hours ago`;
  }
  const day = d.getDate();
  return `${day}${ordinalSuffix(day)} ${SHORT_MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
};

/** Headline figures on the float card — static in the web drawer too. */
export const FLOAT_BALANCE = {
  available: 125000,
  totalNotional: 1000000,
  used: 800000,
  remaining: 200000,
  dueDate: "31st Mar '26",
} as const;

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
