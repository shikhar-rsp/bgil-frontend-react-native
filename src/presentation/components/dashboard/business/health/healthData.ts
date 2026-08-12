/** Data + helpers for the detailed Health Guard quote flow. */

export type MemberType = 'Adult' | 'Senior citizen' | 'Child';
export type Member = { id: string; label: string; type: MemberType };
export type MemberDatum = { dob: Date | null; sumInsured: string; selectedAddOns: string[]; wantsAddOns: string };

export const SUM_INSURED_MIN = 500000;
export const SUM_INSURED_MAX = 2500000;

/** Sum insured choices — 5 to 10 Lakhs, in 1 Lakh steps. Shared by the floater's
 *  total cover and each member's cover on an individual plan. */
export const SUM_INSURED_OPTIONS = [5, 6, 7, 8, 9, 10].map((lakhs) => ({
  label: `${lakhs} Lakhs`,
  value: String(lakhs * 100000),
}));

/** Covers every health product offered on the Browse Categories screen, so any
 *  of them can be preselected when the flow is entered from that tile. */
export const PLAN_OPTIONS = [
  { label: 'Health Guard Policy', value: 'health-guard' },
  { label: 'My Health Care', value: 'my-health-care' },
  { label: 'Apke Liye', value: 'apke-liye' },
  { label: 'Global Health', value: 'global-health' },
  { label: 'Criti Care', value: 'criti-care' },
  { label: 'Arogya Sanjeevni', value: 'arogya-sanjeevni' },
];

/**
 * Map a Browse Categories product label onto a plan option, so entering the
 * flow via "Arogya Sanjeevni" preselects it instead of Health Guard. Catalogue
 * labels drop the "Policy" suffix ("Health Guard" vs "Health Guard Policy"),
 * so match on that too. Unknown products fall back to Health Guard.
 */
export const planValueForProduct = (productName: string): string => {
  const target = productName.trim().toLowerCase();
  const match = PLAN_OPTIONS.find((option) => {
    const label = option.label.toLowerCase();
    return label === target || label.replace(/ policy$/, '') === target;
  });
  return match?.value ?? 'health-guard';
};

export const COUNT_OPTIONS = ['0', '1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }));

/* ── Who is covered ─────────────────────────────────────────────────────── */

/** Relation id → how many of that relation are covered (toggles are 0 or 1). */
export type Coverage = Record<string, number>;

export type CoverageItem = {
  id: string;
  label: string;
  /** `toggle` = one-of checkbox chip; `count` = number stepper chip. */
  kind: 'toggle' | 'count';
  /** Which member bucket this relation lands in once the list is built. */
  type: MemberType;
  /** Cap for `count` items. */
  max?: number;
};

export type CoverageGroup = { id: string; title: string; items: CoverageItem[] };

export const COVERAGE_GROUPS: CoverageGroup[] = [
  {
    id: 'self-spouse',
    title: 'Self & Spouse',
    items: [
      { id: 'self', label: 'Self', kind: 'toggle', type: 'Adult' },
      { id: 'spouse', label: 'Spouse', kind: 'toggle', type: 'Adult' },
    ],
  },
  {
    id: 'children',
    title: 'Children',
    items: [
      { id: 'son', label: 'Son', kind: 'count', type: 'Child', max: 5 },
      { id: 'daughter', label: 'Daughter', kind: 'count', type: 'Child', max: 5 },
    ],
  },
  {
    id: 'parents',
    title: 'Parents & In-laws',
    items: [
      { id: 'father', label: 'Father', kind: 'toggle', type: 'Senior citizen' },
      { id: 'mother', label: 'Mother', kind: 'toggle', type: 'Senior citizen' },
      { id: 'father-in-law', label: 'Father in law', kind: 'toggle', type: 'Senior citizen' },
      { id: 'mother-in-law', label: 'Mother in law', kind: 'toggle', type: 'Senior citizen' },
    ],
  },
  {
    id: 'extended',
    title: 'Extended family',
    items: [
      { id: 'brother', label: 'Brother', kind: 'count', type: 'Adult', max: 5 },
      { id: 'sister', label: 'Sister', kind: 'count', type: 'Adult', max: 5 },
      { id: 'uncle', label: 'Uncle', kind: 'toggle', type: 'Adult' },
      { id: 'aunt', label: 'Aunt', kind: 'toggle', type: 'Adult' },
      { id: 'grandson', label: 'Grandson', kind: 'count', type: 'Child', max: 5 },
      { id: 'granddaughter', label: 'Granddaughter', kind: 'count', type: 'Child', max: 5 },
    ],
  },
];

/** A floater covers the immediate family only; individual adds extended family. */
export const coverageGroupsFor = (planType: string): CoverageGroup[] =>
  planType === 'floater' ? COVERAGE_GROUPS.filter((g) => g.id !== 'extended') : COVERAGE_GROUPS;

/** Static cap rendered as "N can be added" — 30 on individual, 6 on floater. */
export const maxMembersFor = (planType: string): number => (planType === 'floater' ? 6 : 30);

/** Members currently selected, ignoring groups the plan type doesn't offer. */
export const countCovered = (coverage: Coverage, planType: string): number =>
  coverageGroupsFor(planType).reduce(
    (total, group) => total + group.items.reduce((sum, item) => sum + (coverage[item.id] ?? 0), 0),
    0,
  );

/** One "What you get" row — `label:` in regular, `value` in medium. */
export type SubPlanBenefit = { label: string; value: string; excluded?: boolean };

export type SubPlan = {
  id: 'silver' | 'gold' | 'platinum';
  name: string;
  badge: string;
  badgeColor: 'emerald' | 'orange' | 'indigo';
  iconBg: string;
  tint: string;
  border: string;
  /** Annual premium quoted once member details are complete. */
  premium: number;
  benefits: SubPlanBenefit[];
};

export const SUB_PLANS: SubPlan[] = [
  {
    id: 'silver',
    name: 'Silver',
    badge: 'Economic',
    badgeColor: 'emerald',
    iconBg: '#475569',
    tint: '#F8FAFC',
    border: '#CBD5E1',
    premium: 16550,
    benefits: [
      { label: 'Room rent', value: 'Single private A/C room' },
      { label: 'Restore benefit', value: '100% once a year' },
      { label: 'No-claim bonus', value: '10% per year, max 50%' },
      { label: 'Maternity', value: 'Not covered', excluded: true },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    badge: 'Best Seller',
    badgeColor: 'orange',
    iconBg: '#EA580C',
    tint: '#FFF7ED',
    border: '#FB923C',
    premium: 21183,
    benefits: [
      { label: 'Room rent', value: 'Any room except suite' },
      { label: 'Restore benefit', value: '100% unlimited times' },
      { label: 'No-claim bonus', value: '20% per year, max 100%' },
      { label: 'Maternity', value: 'Rs. 50,000 after 24 mo wait' },
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    badge: 'Featured',
    badgeColor: 'indigo',
    iconBg: '#4F46E5',
    tint: '#EEF2FF',
    border: '#818CF8',
    premium: 26810,
    benefits: [
      { label: 'Room rent', value: 'Any room incl. suite' },
      { label: 'Restore benefit', value: '150% unlimited times' },
      { label: 'No-claim bonus', value: '50% per year, max 200%' },
      { label: 'Maternity', value: 'Rs. 1,00,000 after 12 mo wait' },
    ],
  },
];

/** Cheapest tier — the baseline the pricier tiers show their uplift against. */
export const BASE_SUB_PLAN = SUB_PLANS[0];

export const ADD_ON_ITEMS = [
  'OPD Cover',
  'Maternity Cover',
  'Critical Illness',
  'Personal Accident',
  'Hospital Cash',
  'Wellness Benefit',
];

/**
 * Build the member list from the "Who is covered?" selection + proposer. Ids
 * are stable per relation (`son-0`, `son-1`, …) so per-member data survives a
 * neighbouring relation being added or removed.
 */
export const buildMembers = (
  proposerIsMember: boolean,
  proposerName: string,
  coverage: Coverage,
  planType: string,
): Member[] => {
  const list: Member[] = [];
  if (proposerIsMember) {
    list.push({ id: 'proposer', label: `${proposerName || 'Proposer'} Details`, type: 'Adult' });
  }
  coverageGroupsFor(planType).forEach((group) => {
    group.items.forEach((item) => {
      const count = coverage[item.id] ?? 0;
      if (item.kind === 'toggle') {
        if (count > 0) {
          list.push({ id: item.id, label: item.label, type: item.type });
        }
        return;
      }
      for (let i = 0; i < count; i += 1) {
        list.push({
          id: `${item.id}-${i}`,
          // Only number them once there is more than one to tell apart.
          label: count > 1 ? `${item.label} ${i + 1}` : item.label,
          type: item.type,
        });
      }
    });
  });
  return list;
};

export const formatIndianCurrency = (value: string): string => {
  const numeric = value.replace(/\D/g, '');
  return numeric ? `Rs. ${Number(numeric).toLocaleString('en-IN')}` : '';
};

export const numericOnly = (value: string): string => value.replace(/\D/g, '');

/** Proposer gender — asked on floater quotes, which are priced on one life. */
export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Transgender', value: 'transgender' },
];

/* ── Critical illness & PA ──────────────────────────────────────────────── */

export const INCOME_OPTIONS = [500000, 1000000, 1500000, 2000000, 2500000, 5000000].map((v) => ({
  label: v.toLocaleString('en-IN'),
  value: String(v),
}));

export const OCCUPATION_OPTIONS = [
  'Accountant',
  'Business Owner',
  'Doctor',
  'Engineer',
  'Government Employee',
  'Homemaker',
  'Retired',
  'Salaried Professional',
  'Self Employed',
  'Teacher',
].map((label) => ({ label, value: label }));

export type CriticalPlan = {
  id: string;
  name: string;
  premium: number;
  deathSumInsured: number;
  /** Permanent total disability cover — only some plans carry it. */
  ptdSumInsured?: number;
  /** Still offered when the customer declares a pre-existing disability. */
  allowedWithDisability?: boolean;
};

export const CRITICAL_ILLNESS_PLANS: CriticalPlan[] = [
  { id: 'gpg-floater', name: 'Global Personal Guard Policy (Floater)', premium: 2150, deathSumInsured: 5000000 },
  { id: 'gpg-ptd', name: 'Global Personal Guard Policy & PTD Coverage', premium: 2300, deathSumInsured: 5000000, ptdSumInsured: 3000000 },
  { id: 'critical-illness', name: 'Critical Illness', premium: 3000, deathSumInsured: 1000000, allowedWithDisability: true },
];

/** A declared pre-existing disability narrows the offer to Critical Illness. */
export const criticalPlansFor = (hasDisability: string): CriticalPlan[] =>
  hasDisability === 'yes' ? CRITICAL_ILLNESS_PLANS.filter((p) => p.allowedWithDisability) : CRITICAL_ILLNESS_PLANS;

/* ── Premium ────────────────────────────────────────────────────────────── */

export type TenureOption = { value: string; label: string; years: number; discount: number };

/** Longer tenures buy the premium down — the badge text is derived from `discount`. */
export const TENURES: TenureOption[] = [
  { value: '1y', label: '1 year', years: 1, discount: 0 },
  { value: '2y', label: '2 years', years: 2, discount: 0.08 },
  { value: '3y', label: '3 years', years: 3, discount: 0.15 },
];

/** Tax already baked into the sub-plan's quoted premium. */
export const GST_RATE = 0.18;

/** Flat premium per add-on, per member, per year. */
export const ADD_ON_PREMIUM = 500;

export type MemberPremium = {
  id: string;
  label: string;
  /** Null when the member's DOB hasn't been captured (floater members). */
  age: number | null;
  sumInsured: number;
  premium: number;
};

export type PremiumBreakdown = {
  tier: SubPlan | undefined;
  years: number;
  totalSumInsured: number;
  /** Pre-tax premium across the whole tenure, before add-ons and discounts. */
  basePremium: number;
  breakdown: MemberPremium[];
  addOnCount: number;
  addOnTotal: number;
  discountRate: number;
  discountAmount: number;
  /** Payable across the tenure, tax included. */
  total: number;
  perYear: number;
  perMonth: number;
};

export const ageFromDOB = (dob: Date | null): number | null => {
  if (!dob) {
    return null;
  }
  const now = new Date();
  const age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  return beforeBirthday ? age - 1 : age;
};

/**
 * Price a quote for the premium step. The tier premium is the annual, all-in
 * figure the sub-plan cards quote, so the rows here work backwards from it:
 * base premium is that figure less GST, split across members in proportion to
 * their sum insured, and the tenure discount comes off the pre-tax subtotal.
 */
export const computePremium = (args: {
  subPlan: string;
  planType: string;
  members: Member[];
  memberData: Record<string, MemberDatum>;
  /** Floater's shared sum insured. */
  sumInsured: string;
  oldestMemberDOB: Date | null;
  floaterAddOns: string[];
  tenure: string;
}): PremiumBreakdown => {
  const { subPlan, planType, members, memberData, sumInsured, oldestMemberDOB, floaterAddOns, tenure } = args;
  const tier = SUB_PLANS.find((sp) => sp.id === subPlan);
  const option = TENURES.find((t) => t.value === tenure);
  const years = option?.years ?? 1;
  const discountRate = option?.discount ?? 0;
  const floater = planType === 'floater';

  // Annual pre-tax premium the member rows have to add up to.
  const annualBase = tier ? Math.round(tier.premium / (1 + GST_RATE)) : 0;

  const memberSums = members.map((m) =>
    floater ? Number(sumInsured) || 0 : Number(memberData[m.id]?.sumInsured) || 0,
  );
  // A floater's one cover is shared, so it isn't the sum of the member rows.
  const totalSumInsured = floater ? Number(sumInsured) || 0 : memberSums.reduce((a, b) => a + b, 0);
  // Split by sum insured on individual plans; evenly on a floater, where every
  // member sits under the same cover.
  const shareTotal = floater ? members.length : totalSumInsured;

  let allocated = 0;
  const breakdown: MemberPremium[] = members.map((m, i) => {
    const share = shareTotal === 0 ? 0 : (floater ? 1 : memberSums[i]) / shareTotal;
    // Last member absorbs the rounding remainder so the rows sum to the base.
    const premium =
      i === members.length - 1 ? annualBase - allocated : Math.round(annualBase * share);
    allocated += premium;
    return {
      id: m.id,
      label: m.label,
      age: ageFromDOB(floater ? oldestMemberDOB : memberData[m.id]?.dob ?? null),
      sumInsured: memberSums[i],
      premium: Math.max(0, premium),
    };
  });

  const addOnCount = floater
    ? floaterAddOns.length
    : members.reduce((sum, m) => sum + (memberData[m.id]?.selectedAddOns?.length ?? 0), 0);

  const basePremium = annualBase * years;
  const addOnTotal = addOnCount * ADD_ON_PREMIUM * years;
  const discountAmount = Math.round((basePremium + addOnTotal) * discountRate);
  const total = Math.round((basePremium + addOnTotal - discountAmount) * (1 + GST_RATE));

  return {
    tier,
    years,
    totalSumInsured,
    basePremium,
    breakdown,
    addOnCount,
    addOnTotal,
    discountRate,
    discountAmount,
    total,
    perYear: Math.round(total / years),
    perMonth: Math.round(total / (years * 12)),
  };
};

/** `1000000` → `Rs. 10 L`; keeps one decimal for in-between covers. */
export const formatLakhs = (value: number): string => {
  const lakhs = value / 100000;
  return `Rs. ${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)} L`;
};

/** `16550` → `16,550` — the amount alone, for when `Rs.` is styled separately. */
export const rupeeAmount = (value: number): string => value.toLocaleString('en-IN');

/** `16550` → `Rs. 16,550` — for figures the app holds as numbers (premiums). */
export const formatRupees = (value: number): string => `Rs. ${rupeeAmount(value)}`;
