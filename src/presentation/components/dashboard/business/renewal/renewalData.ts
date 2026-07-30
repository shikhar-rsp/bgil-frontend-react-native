/**
 * Types, option sets and fixtures for the Renew Policy flow.
 *
 * Ported from the web app's `sections/policy/renewals/{types,constants,data,utils}`.
 * Web kept its option sets in a `.tsx` because each carried a JSX icon; here the
 * icon is stored as the Phosphor *component* so this stays a plain `.ts` module
 * and each step renders `<opt.Icon size={20} … />` itself.
 */
import {
  CurrencyInr,
  ArrowsClockwise,
  FlowArrow,
  Files,
  ArrowsLeftRight,
  FileText,
  Shield,
  ShieldStar,
  SketchLogo,
  ChatText,
  Link,
  UsersThree,
  PersonArmsSpread,
  UserCircleGear,
  BuildingOffice,
  Car,
  EnvelopeSimple,
  type Icon,
} from 'phosphor-react-native';
import type { AccentColor } from '@atlas-ds/react-native';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** How the agent chooses to renew. */
export type ProceedOption = 'quick' | 'renewal' | 'migration';

/** Which part of the policy the agent edits during the renewal. */
export type EditOption =
  | 'policy-plan'
  | 'add-remove-member'
  | 'member-details'
  | 'plan-type'
  | 'nominee-details'
  | 'proposer-details'
  | 'addons-subplan'
  | 'entire-policy';

export type PaymentLinkMethod = 'email' | 'sms' | 'link';

export type RenewalPlanType = 'individual' | 'floater';

export type SubPlanValue = 'silver' | 'gold' | 'platinum';

/** Sections of the renewal summary that can carry an "Updated" badge. */
export type SummarySection = 'policy' | 'premium' | 'proposer' | 'member' | 'nominee';

/** The steps the renewal wizard can walk through, in canonical order. */
export type RenewalStepKey =
  | 'preview'
  | 'policy'
  | 'proposer'
  | 'member'
  | 'addons'
  | 'nominee'
  | 'previous-policy'
  | 'kyc'
  | 'summary'
  | 'payment';

/** Per-member data captured on the member details step. */
export type RenewalMemberData = {
  name: string;
  relationship: string;
  dob: Date | null;
  /** Feet:inches, e.g. `5:10` — matches the web member step. */
  height: string;
  weight: string;
  sumInsured: string;
  hasPed: string;
  peds?: { selectedPeds: number[]; details: Record<number, string>; customConditions: string[] };
};

/** A row in the renewal's member list. */
export type RenewalMemberEntry = {
  id: string;
  label: string;
  /** Badge label — `Proposer`, `Adult`, `Child`, or a relationship once saved. */
  type: string;
  dobLabel: string;
  status: 'active' | 'removed' | 'new';
  /** A newly added member that has been saved — from here on it behaves like an
   *  existing member (collapsed, with the standard DOB / delete header). */
  saved?: boolean;
  /** Removed automatically by the floater 6-member cap rather than by the agent.
   *  These are restored when the plan type switches back to individual. */
  autoRemoved?: boolean;
};

export type RenewalNomineeData = {
  name: string;
  relationship: string;
  dob: Date | null;
  /** Share of the sum insured, as a percentage (min 15). */
  allocation: number;
};

/* ------------------------------------------------------------------ */
/* Caps                                                               */
/* ------------------------------------------------------------------ */

/** Floater plans are capped at 6 members; individual plans at 30. */
export const FLOATER_MAX_MEMBERS = 6;
export const INDIVIDUAL_MAX_MEMBERS = 30;

/* ------------------------------------------------------------------ */
/* Step 1 — how to proceed                                            */
/* ------------------------------------------------------------------ */

export const PROCEED_OPTIONS: {
  value: ProceedOption;
  title: string;
  description: string;
  Icon: Icon;
  iconBg: string;
}[] = [
  {
    value: 'quick',
    title: 'Quick Renewal',
    description: 'Send a payment link instantly to continue policy without changes',
    Icon: CurrencyInr,
    iconBg: '#059669',
  },
  {
    value: 'renewal',
    title: 'Renewal',
    description: 'Continue with same policy and any other required changes',
    Icon: ArrowsClockwise,
    iconBg: '#EA580C',
  },
  {
    value: 'migration',
    title: 'Migration',
    description: 'Change the policy plan with any other required changes',
    Icon: FlowArrow,
    iconBg: '#2563EB',
  },
];

/** "Renewal" shows a tailored edit set, with "Edit Entire Policy" last. */
export const RENEWAL_EDIT_OPTIONS: { value: EditOption; label: string; Icon: Icon; iconBg: string }[] = [
  { value: 'member-details', label: 'Member details', Icon: UsersThree, iconBg: '#EA580C' },
  { value: 'nominee-details', label: 'Nominee details', Icon: PersonArmsSpread, iconBg: '#EA580C' },
  { value: 'addons-subplan', label: 'Add-ons & Subplan', Icon: ShieldStar, iconBg: '#EA580C' },
  { value: 'proposer-details', label: 'Proposer details', Icon: UserCircleGear, iconBg: '#EA580C' },
  { value: 'entire-policy', label: 'Edit Entire Policy', Icon: FileText, iconBg: '#7C3AED' },
];

/** "Migration" keeps the standard edit set (no add/remove member). */
export const MIGRATION_EDIT_OPTIONS: { value: EditOption; label: string; Icon: Icon; iconBg: string }[] = [
  { value: 'policy-plan', label: 'Policy plan', Icon: Files, iconBg: '#2563EB' },
  { value: 'member-details', label: 'Member details', Icon: UsersThree, iconBg: '#2563EB' },
  { value: 'proposer-details', label: 'Proposer details', Icon: UserCircleGear, iconBg: '#2563EB' },
  { value: 'plan-type', label: 'Plan type', Icon: ArrowsLeftRight, iconBg: '#2563EB' },
  { value: 'nominee-details', label: 'Nominee details', Icon: PersonArmsSpread, iconBg: '#2563EB' },
  { value: 'entire-policy', label: 'Edit Entire Policy', Icon: FileText, iconBg: '#7C3AED' },
];

/** Quick Renewal — how to deliver the payment link. `email` / `sms` open the
 *  "Payment Link Sent" sheet; `link` opens "Payment Link generated". */
export const PAYMENT_LINK_OPTIONS: {
  value: PaymentLinkMethod;
  label: string;
  Icon: Icon;
  iconBg: string;
}[] = [
  { value: 'email', label: 'Through Email', Icon: EnvelopeSimple, iconBg: '#2563EB' },
  { value: 'sms', label: 'Through SMS', Icon: ChatText, iconBg: '#16A34A' },
  { value: 'link', label: 'Generate and copy link', Icon: Link, iconBg: '#16A34A' },
];

/* ------------------------------------------------------------------ */
/* Policy details step                                                 */
/* ------------------------------------------------------------------ */

export const POLICY_PLAN_OPTIONS = [
  { label: 'Health Guard Policy', value: 'health-guard' },
  { label: 'My Health Care Plan', value: 'health-care' },
  { label: 'Apke Liye', value: 'apke-liye' },
  { label: 'HERizon', value: 'herizon' },
  { label: 'Silver Health for Senior Citizens', value: 'silver-health' },
  { label: 'Arogya Sanjeevani', value: 'arogya-sanjeevani' },
];

/** The plan the renewed policy currently sits on — the "Policy plan has been
 *  changed" banners only surface once the agent picks something else. */
export const ORIGINAL_POLICY_PLAN = 'health-guard';

export const PLAN_TYPE_OPTIONS: { value: RenewalPlanType; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'floater', label: 'Floater' },
];

export const TENURE_OPTIONS = [
  { value: '1', label: '1 year', price: 'Rs. 4,500' },
  { value: '2', label: '2 years', price: 'Rs. 6,500' },
  { value: '3', label: '3 years', price: 'Rs. 8,500', badge: 'MAXX Saver' },
];

export const SUB_PLANS: {
  value: SubPlanValue;
  title: string;
  badge: string;
  badgeColor: AccentColor;
  Icon: Icon;
  iconBg: string;
  /** Two-stop approximation of the web header gradient. */
  headerGradient: [string, string];
  selectedBg: string;
  selectedBorder: string;
  unselectedBorder: string;
}[] = [
  {
    value: 'silver',
    title: 'Silver',
    badge: 'Economic',
    badgeColor: 'emerald',
    Icon: Shield,
    iconBg: '#475569',
    headerGradient: ['#FFFFFF', '#E2E8F0'],
    selectedBg: '#F8FAFC',
    selectedBorder: '#CBD5E1',
    unselectedBorder: '#E2E8F0',
  },
  {
    value: 'gold',
    title: 'Gold',
    badge: 'Best seller',
    badgeColor: 'orange',
    Icon: ShieldStar,
    iconBg: '#EA580C',
    headerGradient: ['#FFFBEB', '#FED7AA'],
    selectedBg: '#FFF7ED',
    selectedBorder: '#FB923C',
    unselectedBorder: '#FED7AA',
  },
  {
    value: 'platinum',
    title: 'Platinum',
    badge: 'Featured',
    badgeColor: 'indigo',
    Icon: SketchLogo,
    iconBg: '#4F46E5',
    headerGradient: ['#EFF6FF', '#E0E7FF'],
    selectedBg: '#EEF2FF',
    selectedBorder: '#818CF8',
    unselectedBorder: '#DDD6FE',
  },
];

export const SUB_PLAN_BENEFITS = [
  'Hospitalization Cover',
  'Nurse at home',
  'Pre-hospitalisation exp..',
  'Post-hospitalisation exp..',
];

/* ------------------------------------------------------------------ */
/* Add-ons step                                                        */
/* ------------------------------------------------------------------ */

export const ADDON_ITEMS = [
  { id: 'nurse-1', title: 'Nurse at home', price: '+ Rs. 1200' },
  { id: 'nurse-2', title: 'Room rent waiver', price: '+ Rs. 1200' },
  { id: 'nurse-3', title: 'OPD cover', price: '+ Rs. 1200' },
  { id: 'nurse-4', title: 'Maternity cover', price: '+ Rs. 1200' },
  { id: 'nurse-5', title: 'Critical illness', price: '+ Rs. 1200' },
  { id: 'nurse-6', title: 'Hospital cash', price: '+ Rs. 1200' },
];

/** Premium charged per selected add-on, used for the premium summary. */
export const ADDON_UNIT_PREMIUM = 1200;

/** Mandatory add-ons carried over from the previous policy — locked (and shown
 *  pre-ticked) across the renewal member-details / add-ons / entire-policy
 *  flows. Migration keeps every add-on selectable. */
export const RENEWAL_LOCKED_ADDON_IDS = ['nurse-6'];

/** Cross-sell policies offered alongside a renewal. */
export const ELIGIBLE_ADDON_POLICIES: {
  id: string;
  title: string;
  perYear: string;
  period: string;
  premium: number;
  Icon: Icon;
  iconBg: string;
}[] = [
  {
    id: 'griha',
    title: 'Griha Raksha Policy',
    perYear: 'Rs. 30,00,000',
    period: '10 years',
    premium: 12000,
    Icon: BuildingOffice,
    iconBg: '#7C3AED',
  },
  {
    id: 'motor',
    title: '4 wheeler motor Policy',
    perYear: 'Rs. 30,00,000',
    period: '10 years',
    premium: 12000,
    Icon: Car,
    iconBg: '#EA580C',
  },
];

/* ------------------------------------------------------------------ */
/* Premium fixtures                                                    */
/* ------------------------------------------------------------------ */

/** The renewal premium breakdown is dummy data in the web app too — only the
 *  add-on and cross-sell lines actually move with the agent's selections. */
export const PREMIUM_FIXTURE = {
  currentPremium: 32000,
  sumInsured: 1500000,
  basePremium: 24000,
  discount: 0,
  centralGst: 0,
  stateGst: 0,
  /** Renewal premium before add-on / cross-sell adjustments. */
  baseRenewalPremium: 28000,
};

/* ------------------------------------------------------------------ */
/* Stepper                                                             */
/* ------------------------------------------------------------------ */

export const STEP_LABELS: Record<RenewalStepKey, string> = {
  preview: 'Renewal',
  policy: 'Policy details',
  proposer: 'Proposer details',
  member: 'Member details',
  addons: 'Add-ons',
  nominee: 'Nominee details',
  'previous-policy': 'Previous policy',
  kyc: 'KYC & documents',
  summary: 'Preview & Share',
  payment: 'Payment',
};

/** Which summary sections each edit option actually changes — drives the
 *  "Updated" badge beside a section title. */
export const CHANGED_SECTIONS_BY_EDIT: Record<EditOption, SummarySection[]> = {
  'policy-plan': ['policy'],
  'plan-type': ['policy', 'member', 'nominee', 'premium'],
  'add-remove-member': ['member', 'nominee', 'premium'],
  'member-details': ['member', 'nominee', 'premium'],
  'nominee-details': ['nominee'],
  'proposer-details': ['proposer'],
  'addons-subplan': ['member', 'premium'],
  'entire-policy': ['policy', 'premium', 'proposer', 'member', 'nominee'],
};

/* ------------------------------------------------------------------ */
/* Member / nominee fixtures                                           */
/* ------------------------------------------------------------------ */

const RENEWAL_MEMBER_DOB = new Date('1985-05-19');
const RENEWAL_NOMINEE_DOB = new Date('1990-07-04');

export const RELATIONSHIP_LABELS: Record<string, string> = {
  self: 'Self',
  spouse: 'Spouse',
  son: 'Son',
  daughter: 'Daughter',
  father: 'Father',
  mother: 'Mother',
  'mother-in-law': 'Mother-in-law',
  'father-in-law': 'Father-in-law',
  sibling: 'Sibling',
};

export const MEMBER_RELATIONSHIP_OPTIONS = [
  'self',
  'spouse',
  'son',
  'daughter',
  'father',
  'mother',
].map((v) => ({ value: v, label: RELATIONSHIP_LABELS[v] }));

export const NOMINEE_RELATIONSHIP_OPTIONS = [
  'spouse',
  'son',
  'daughter',
  'father',
  'mother',
  'sibling',
].map((v) => ({ value: v, label: RELATIONSHIP_LABELS[v] }));

/** Individual policies start with 7 members (cap 30). */
export const INITIAL_RENEWAL_MEMBERS: RenewalMemberEntry[] = [
  { id: 'rm-rakesh', label: 'Rakesh Kumar', type: 'Proposer', dobLabel: '19/05/1985', status: 'active' },
  { id: 'rm-priti', label: 'Priti Kumar', type: 'Adult', dobLabel: '19/05/1985', status: 'active' },
  { id: 'rm-pranav', label: 'Pranav Kumar', type: 'Child', dobLabel: '19/05/1985', status: 'active' },
  { id: 'rm-prateek', label: 'Prateek Kumar', type: 'Child', dobLabel: '19/05/1985', status: 'active' },
  { id: 'rm-preeti', label: 'Preeti Kumar', type: 'Adult', dobLabel: '19/05/1985', status: 'active' },
  { id: 'rm-parth', label: 'Parth Kumar', type: 'Child', dobLabel: '19/05/1985', status: 'active' },
  { id: 'rm-pihu', label: 'Pihu Kumar', type: 'Child', dobLabel: '19/05/1985', status: 'active' },
];

/** Floater policies start already at their 6-member cap (no removed members).
 *  The 7th only lands in "Removed members" when an individual policy is
 *  converted to floater. */
export const INITIAL_RENEWAL_MEMBERS_FLOATER: RenewalMemberEntry[] = INITIAL_RENEWAL_MEMBERS.slice(0, 6);

export const buildInitialMemberData = (): Record<string, RenewalMemberData> => {
  const filled = (name: string, relationship: string): RenewalMemberData => ({
    name,
    relationship,
    dob: RENEWAL_MEMBER_DOB,
    height: '5:10',
    weight: '68',
    sumInsured: '1500000',
    hasPed: 'yes',
  });
  return {
    'rm-rakesh': filled('Rakesh Kumar', 'self'),
    'rm-priti': filled('Priti Kumar', 'spouse'),
    'rm-pranav': filled('Pranav Kumar', 'son'),
    'rm-prateek': filled('Prateek Kumar', 'son'),
    'rm-preeti': filled('Preeti Kumar', 'mother'),
    'rm-parth': filled('Parth Kumar', 'son'),
    'rm-pihu': filled('Pihu Kumar', 'daughter'),
  };
};

export const buildInitialNomineeData = (): Record<string, RenewalNomineeData> => ({
  'rm-rakesh': { name: 'Sharmila Kumar', relationship: 'sibling', dob: RENEWAL_NOMINEE_DOB, allocation: 15 },
  'rm-priti': { name: 'Sharmila Kumar', relationship: 'sibling', dob: RENEWAL_NOMINEE_DOB, allocation: 15 },
  'rm-pranav': { name: 'Prateek Kumar', relationship: 'sibling', dob: RENEWAL_NOMINEE_DOB, allocation: 15 },
  'rm-prateek': { name: 'Sharmila Kumar', relationship: 'sibling', dob: RENEWAL_NOMINEE_DOB, allocation: 15 },
  'rm-preeti': { name: 'Sharmila Kumar', relationship: 'sibling', dob: RENEWAL_NOMINEE_DOB, allocation: 15 },
  'rm-parth': { name: 'Sharmila Kumar', relationship: 'sibling', dob: RENEWAL_NOMINEE_DOB, allocation: 15 },
  'rm-pihu': { name: 'Sharmila Kumar', relationship: 'sibling', dob: RENEWAL_NOMINEE_DOB, allocation: 15 },
});

/** Read-only previous-policy rows shown per member before the KYC step. */
export const PREVIOUS_POLICIES = [
  {
    policyNumber: '17358735646',
    insurerName: 'Bajaj General Insurance',
    sumInsured: 'Rs. 12,00,000',
    startDate: '12/09/2024',
    endDate: '12/09/2026',
    cumulativeBonus: '50%',
  },
  {
    policyNumber: '17358735647',
    insurerName: 'Bajaj General Insurance',
    sumInsured: 'Rs. 12,00,000',
    startDate: '12/09/2024',
    endDate: '12/09/2026',
    cumulativeBonus: '50%',
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const formatDobLabel = (d: Date | null): string =>
  d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '';

export const formatRupees = (value: number): string => `Rs. ${value.toLocaleString('en-IN')}`;

export const numericOnly = (value: string): string => value.replace(/\D/g, '');

export const formatIndianCurrency = (value: string): string => {
  const n = numericOnly(value);
  return n ? `Rs. ${Number(n).toLocaleString('en-IN')}` : '';
};

/** `'Today'` → 0, `'Tomorrow'` → 1, `'7 days'` → 7, anything else → Infinity. */
const parseExpiryDays = (label: string): number => {
  const s = (label || '').trim().toLowerCase();
  if (s === 'today') {
    return 0;
  }
  if (s === 'tomorrow') {
    return 1;
  }
  const m = s.match(/^(\d+)\s*days?$/);
  return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
};

/** Maps a renewal's "expiring within" label to banner copy + a badge colour.
 *  `variant` is a `Toast` variant — the DS calls the red one `error`. */
export const getExpiryInfo = (
  expiringWithin?: string,
): { variant: 'error' | 'warning' | 'info'; badgeColor: AccentColor; badgeLabel: string; title: string } => {
  const label = expiringWithin || '';
  const days = parseExpiryDays(label);
  const badgeLabel = `Expiring - ${label || 'soon'}`;
  if (days <= 14) {
    return {
      variant: 'error',
      badgeColor: 'red',
      badgeLabel,
      title: `Policy is expiring in ${label || 'a few days'}! Renew it soon`,
    };
  }
  if (days <= 45) {
    return {
      variant: 'warning',
      badgeColor: 'orange',
      badgeLabel,
      title: 'Policy is expiring in 1 month! Renew it soon',
    };
  }
  return {
    variant: 'info',
    badgeColor: 'blue',
    badgeLabel,
    title: 'Policy is expiring in 3 months! Renew it now.',
  };
};

/** Moves every active member beyond the floater cap into the "removed" bucket,
 *  flagged `autoRemoved` so switching back to individual can restore them. */
export const applyFloaterCap = (members: RenewalMemberEntry[]): RenewalMemberEntry[] => {
  let kept = 0;
  return members.map((m) => {
    if (m.status === 'removed') {
      return m;
    }
    kept += 1;
    return kept > FLOATER_MAX_MEMBERS ? { ...m, status: 'removed' as const, autoRemoved: true } : m;
  });
};
