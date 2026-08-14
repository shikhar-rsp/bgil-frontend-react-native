import type { ImageSourcePropType } from 'react-native';
import { dashboardImages } from '../../images';

/**
 * Data and pricing rules behind the motor quote flow.
 *
 * The quote screens are driven by two things: which age bucket the vehicle
 * falls into (that decides which plans are offerable and how much NCB the
 * customer has earned), and which plan is selected (that decides which halves
 * of the premium breakup are shown at all).
 *
 * Ported from the web build. Everything below is presentation-free so the
 * screens and the tests read the same rules.
 */

/** Card artwork per vehicle type — the image follows the type, not the vehicle. */
export const VEHICLE_TYPE_IMAGES = {
  car: dashboardImages.carPng,
  commercial: dashboardImages.commercialPng,
  schoolBus: dashboardImages.schoolBus,
  scooter: dashboardImages.scooterPng,
  bike: dashboardImages.bulletPng,
} satisfies Record<string, ImageSourcePropType>;

export type VehicleType = keyof typeof VEHICLE_TYPE_IMAGES;

export interface VehicleRecord {
  type: VehicleType;
  model: string;
  make: string;
  subType: string;
  year: string;
  location: string;
  regDate: string;

  /** Own-damage cover the insurer recommends for this vehicle, in rupees. */
  recommendedIdv: number;

  /**
   * Share of the IDV charged as basic own-damage premium. Stored per vehicle
   * so the premium tracks the IDV slider instead of sitting at a fixed number.
   */
  ownDamageRate: number;

  /**
   * Expiry of the policy being renewed, in days from today — negative means
   * it has already lapsed and the quote is a break-in. Held as an offset
   * rather than a fixed date so the demo scenarios keep demonstrating the
   * state they were written for however long from now they're opened.
   */
  previousPolicyExpiryInDays: number;
}

export const VEHICLE_LOOKUP = {
  // Older than 5 years — the full flow: all three plans, top NCB slab.
  MH08L9834: {
    type: 'car',
    model: 'Swift Dzire',
    make: 'Maruti Suzuki',
    subType: 'Hatchback',
    year: '2020',
    location: 'Pune',
    regDate: '30 Nov 2020',
    recommendedIdv: 520000,
    ownDamageRate: 0.02,
    previousPolicyExpiryInDays: 110,
  },

  // Under 3 years — third party is still covered by the bundled long-term
  // policy, so own damage is the only thing left to sell.
  KL07AB1234: {
    type: 'car',
    model: 'Swift Dzire',
    make: 'Maruti Suzuki',
    subType: 'Hatchback',
    year: '2024',
    location: 'Pune',
    regDate: '14 Feb 2024',
    recommendedIdv: 593000,
    ownDamageRate: 0.019,
    previousPolicyExpiryInDays: 186,
  },

  MH08L9036: {
    type: 'car',
    model: 'Hyundai Creta',
    make: 'Hyundai',
    subType: 'SUV',
    year: '2025',
    location: 'Mumbai',
    regDate: '18 Sep 2025',
    recommendedIdv: 1145000,
    ownDamageRate: 0.02,
    // The own-damage year it was sold with runs out shortly.
    previousPolicyExpiryInDays: 37,
  },

  // Policy already lapsed — break-in, needs a self-inspection before cover
  // starts. Still inside the 90-day window, so the bonus is intact.
  KL07CD5678: {
    type: 'car',
    model: 'Swift Dzire',
    make: 'Maruti Suzuki',
    subType: 'Hatchback',
    year: '2019',
    location: 'Mumbai',
    regDate: '14 Feb 2019',
    recommendedIdv: 480000,
    ownDamageRate: 0.02,
    previousPolicyExpiryInDays: -34,
  },

  // Lapsed well past the grace window — break-in, and the bonus is gone.
  MH08L9037: {
    type: 'car',
    model: 'Tata Nexon',
    make: 'Tata Motors',
    subType: 'SUV',
    year: '2018',
    location: 'Nagpur',
    regDate: '07 Aug 2018',
    recommendedIdv: 615000,
    ownDamageRate: 0.02,
    previousPolicyExpiryInDays: -128,
  },

  KL07EF9012: {
    type: 'schoolBus',
    model: 'Tata Starbus',
    make: 'Tata Motors',
    subType: 'Bus',
    year: '2021',
    location: 'Bangalore',
    regDate: '10 Jun 2021',
    recommendedIdv: 1250000,
    ownDamageRate: 0.02,
    previousPolicyExpiryInDays: 300,
  },

  KL07GH3456: {
    type: 'scooter',
    model: 'Activa 6G',
    make: 'Honda',
    subType: 'Scooter',
    year: '2023',
    location: 'Chennai',
    regDate: '05 Jan 2023',
    recommendedIdv: 78000,
    ownDamageRate: 0.02,
    previousPolicyExpiryInDays: 145,
  },

  KL07JK7890: {
    type: 'bike',
    model: 'Royal Enfield Classic 350',
    make: 'Royal Enfield',
    subType: 'Motorcycle',
    year: '2024',
    location: 'Kochi',
    regDate: '21 Mar 2024',
    recommendedIdv: 165000,
    ownDamageRate: 0.02,
    previousPolicyExpiryInDays: 220,
  },

  // Over 15 years old — most add-ons are off the table for this one.
  MH08L9035: {
    type: 'car',
    model: 'Maruti Alto',
    make: 'Maruti Suzuki',
    subType: 'Hatchback',
    year: '2010',
    location: 'Pune',
    regDate: '18 Jun 2010',
    recommendedIdv: 135000,
    ownDamageRate: 0.02,
    previousPolicyExpiryInDays: 95,
  },
} satisfies Record<string, VehicleRecord>;

/** Normalise typed input — phone keyboards readily add spaces to a plate. */
const plateKey = (registrationNumber: string): string =>
  registrationNumber.replace(/\s+/g, '').toUpperCase();

/** Strict demo-table lookup. The four Figma scenarios are all in here. */
export const findVehicle = (registrationNumber: string) =>
  VEHICLE_LOOKUP[
    plateKey(registrationNumber) as keyof typeof VEHICLE_LOOKUP
  ] as VehicleRecord | undefined;

/** Registration format XX00X(XX)0000 — MH08L9834, KL07AB1234. */
export const validateRegistration = (val: string): boolean =>
  /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/.test(plateKey(val));

/**
 * Stand-in for a well-formed plate that isn't one of the demo scenarios, so the
 * flow can be walked with any realistic registration instead of only the nine
 * below. Profiled like the flagship vehicle — an in-force car past five years —
 * which is the case that offers all three plans and the top NCB slab.
 */
export const GENERIC_VEHICLE: VehicleRecord = {
  type: 'car',
  model: 'Swift Dzire',
  make: 'Maruti Suzuki',
  subType: 'Hatchback',
  year: '2020',
  location: 'Pune',
  regDate: '30 Nov 2020',
  recommendedIdv: 520000,
  ownDamageRate: 0.02,
  previousPolicyExpiryInDays: 110,
};

/**
 * Resolve a plate to the vehicle the screens should render.
 *
 * Anything in the demo table returns its own record; any other correctly
 * formatted plate falls back to {@link GENERIC_VEHICLE}, so the vehicle card and
 * the prefetched policy period appear for every registration number rather than
 * only the scripted nine. Returns undefined only when the format itself is bad.
 */
export const lookupVehicle = (
  registrationNumber: string,
): VehicleRecord | undefined =>
  findVehicle(registrationNumber) ??
  (validateRegistration(registrationNumber) ? GENERIC_VEHICLE : undefined);

export const isVehicleFound = (registrationNumber: string): boolean =>
  Boolean(lookupVehicle(registrationNumber));

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

// Plain table rather than Intl/toLocaleString — the month names are fixed
// English here, and this sidesteps Hermes' locale data entirely.
const SHORT_MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

/** "30 Nov 2020" — the format `VehicleRecord.regDate` is stored in. */
export const formatShortDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/**
 * Parse a `regDate` back into a Date at local midnight.
 *
 * Hermes only implements a subset of `Date.parse`, and "30 Nov 2020" is not in
 * the subset it guarantees — left to the engine this returns `Invalid Date` and
 * every age bucket silently collapses to `over5`. The stored format is fixed
 * and ours, so read it directly instead of asking the engine to guess.
 */
export const parseShortDate = (value: string): Date => {
  const match = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/.exec(value.trim());

  if (match) {
    const month = SHORT_MONTHS.indexOf(
      match[2][0].toUpperCase() + match[2].slice(1, 3).toLowerCase(),
    );

    if (month >= 0) {
      return new Date(Number(match[3]), month, Number(match[1]));
    }
  }

  // ISO strings (what the DatePicker hands back) still parse natively.
  return new Date(value);
};

/* ------------------------------------------------------------------ */
/* Vehicle age                                                         */
/* ------------------------------------------------------------------ */

/**
 * `expired` outranks the age buckets: a lapsed policy changes the whole
 * screen (break-in warning, inspection copy) regardless of how old the car is.
 *
 * An unregistered vehicle is bucketed the same way, off the details the agent
 * enters by hand — the rules that follow from a vehicle's age don't care
 * whether we looked it up or were told it.
 */
export type VehicleAgeBucket = 'under3' | 'mid' | 'over5' | 'expired';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const yearsBetween = (from: Date, to: Date): number =>
  (to.getTime() - from.getTime()) / (365.25 * MS_PER_DAY);

export const daysBetween = (from: Date, to: Date): number =>
  Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);

export const getVehicleAgeBucket = (
  vehicle: VehicleRecord,
  today: Date = new Date(),
): VehicleAgeBucket => {
  if (vehicle.previousPolicyExpiryInDays < 0) return 'expired';

  const age = yearsBetween(parseShortDate(vehicle.regDate), today);

  if (age < 3) return 'under3';
  if (age > 5) return 'over5';

  return 'mid';
};

/** Days the previous policy has been lapsed, or 0 when it is still in force. */
export const getDaysExpired = (vehicle: VehicleRecord): number =>
  Math.max(0, -vehicle.previousPolicyExpiryInDays);

/** The date the policy being renewed expired, derived from the stored offset. */
export const getPreviousPolicyExpiryDate = (
  vehicle: VehicleRecord,
  today: Date = new Date(),
): Date => {
  const expiry = new Date(today);
  expiry.setDate(expiry.getDate() + vehicle.previousPolicyExpiryInDays);
  return expiry;
};

/**
 * NCB survives a lapse for 90 days. Past that the customer drops back to zero,
 * which is worth telling the agent about while they can still act on it.
 */
export const NCB_GRACE_DAYS = 90;

export interface PolicyPeriod {
  start: Date;
  end: Date;
}

/**
 * The policy period the lookup returns alongside the vehicle, so the agent
 * doesn't retype dates we already hold. A renewal picks up the day after the
 * expiring policy ends; a lapsed one can't be backdated, so it starts today.
 *
 * Derived from the expiry rather than stored separately — two fields that can
 * disagree about when the last policy ended would only drift apart.
 */
export const getPrefetchedPolicyPeriod = (
  vehicle: VehicleRecord,
  today: Date = new Date(),
): PolicyPeriod => {
  const start = new Date(today);

  if (vehicle.previousPolicyExpiryInDays >= 0) {
    start.setDate(start.getDate() + vehicle.previousPolicyExpiryInDays + 1);
  }

  // A one-year policy runs to the day before its anniversary.
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(end.getDate() - 1);

  return { start, end };
};

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

export type PlanId = 'comprehensive' | 'tp' | 'od' | 'bundled' | 'ltp';

export interface PlanOption {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  /** Which halves of the premium breakup this plan bills for. */
  coversOwnDamage: boolean;
  coversThirdParty: boolean;
  /** Years each half runs for — 0 when that half isn't included. */
  ownDamageYears: number;
  thirdPartyYears: number;
  /** The option to lead with, badged on the card. */
  recommended?: boolean;
}

export const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    tagline: 'Own Damage + Third Party',
    description:
      "Covers damage to the customer's own car and legal liability to others.",
    coversOwnDamage: true,
    coversThirdParty: true,
    ownDamageYears: 1,
    thirdPartyYears: 1,
  },
  {
    id: 'tp',
    name: 'Third party only',
    tagline: 'Statutory minimum',
    description:
      "Legal minimum under the Motor Vehicles Act. Nothing is paid for the customer's own car.",
    coversOwnDamage: false,
    coversThirdParty: true,
    ownDamageYears: 0,
    thirdPartyYears: 1,
  },
  {
    id: 'od',
    name: 'Own Damage',
    tagline: 'Needs a separate in-force TP policy',
    description:
      'Only issuable if the customer already holds a valid third-party policy from elsewhere.',
    coversOwnDamage: true,
    coversThirdParty: false,
    ownDamageYears: 1,
    thirdPartyYears: 0,
  },
];

/**
 * A vehicle being registered for the first time can only be sold one of two
 * things: the bundled package, or the long-term third-party policy on its own.
 * Standalone own damage needs a third-party policy already in force, and
 * multi-year own damage stopped being issuable in 2020 — so neither is here.
 */
export const NEW_VEHICLE_PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'bundled',
    name: 'Bundled cover',
    tagline: '1 yr Own Damage + 3 yr Third Party',
    description:
      'The only comprehensive product available for a new vehicle. Own damage is renewed every year, third party is paid once.',
    coversOwnDamage: true,
    coversThirdParty: true,
    ownDamageYears: 1,
    thirdPartyYears: 3,
    recommended: true,
  },
  {
    id: 'ltp',
    name: 'Long-term Third Party only',
    tagline: '3 years, statutory minimum',
    description:
      "Legal minimum to register the vehicle. Nothing is paid for damage to the customer's own vehicle.",
    coversOwnDamage: false,
    coversThirdParty: true,
    ownDamageYears: 0,
    thirdPartyYears: 3,
  },
];

const ALL_PLANS = [...PLAN_OPTIONS, ...NEW_VEHICLE_PLAN_OPTIONS];

/**
 * A vehicle under 3 years still carries the bundled long-term third-party
 * cover it was sold with, so own damage is the only plan left to write. A
 * vehicle being registered for the first time gets its own two products.
 */
export const getAvailablePlans = (
  bucket: VehicleAgeBucket,
  isUnregistered: boolean = false,
): PlanOption[] => {
  if (isUnregistered) return NEW_VEHICLE_PLAN_OPTIONS;

  return bucket === 'under3'
    ? PLAN_OPTIONS.filter((plan) => plan.id === 'od')
    : PLAN_OPTIONS;
};

export const getPlan = (id: PlanId): PlanOption =>
  ALL_PLANS.find((plan) => plan.id === id) ?? PLAN_OPTIONS[0];

/* ------------------------------------------------------------------ */
/* No Claim Bonus                                                      */
/* ------------------------------------------------------------------ */

export interface NcbSlab {
  /** Discount on the basic own-damage premium. */
  percent: number;
  /** Claim-free years that earned it, shown under the discount row. */
  label: string;
}

/**
 * An unregistered vehicle has no expiring policy, so there is no bonus to
 * carry over and nothing to ask the agent about.
 */
export const NO_PRIOR_POLICY_NCB: NcbSlab = {
  percent: 0,
  label: 'First policy',
};

/**
 * Standard slabs. The bucket stands in for claim-free years — a car we have
 * been renewing for over 5 years has reached the top slab.
 *
 * `daysExpired` matters because a bonus that has sat lapsed beyond the grace
 * window is gone: the customer starts again at zero however many claim-free
 * years earned it.
 */
export const getNcbSlab = (
  bucket: VehicleAgeBucket,
  claimMadeOnExpiringPolicy: boolean,
  daysExpired: number = 0,
): NcbSlab => {
  if (claimMadeOnExpiringPolicy) {
    return { percent: 0, label: 'Claim made on expiring policy' };
  }

  if (daysExpired > NCB_GRACE_DAYS) {
    return {
      percent: 0,
      label: `Lapsed — over ${NCB_GRACE_DAYS} days since expiry`,
    };
  }

  switch (bucket) {
    case 'under3':
      return { percent: 25, label: '2 years' };
    case 'mid':
      return { percent: 35, label: '3 years' };
    default:
      return { percent: 50, label: '5+ years' };
  }
};

/* ------------------------------------------------------------------ */
/* Add-ons                                                             */
/* ------------------------------------------------------------------ */

export interface AddOn {
  id: string;
  label: string;
  description: string;
  price: number;
}

export const ADD_ONS: AddOn[] = [
  {
    id: 'zero-dep',
    label: 'Zero Depreciation',
    description:
      'No depreciation deducted on plastic, rubber and fibre parts at claim time.',
    price: 1450,
  },
  {
    id: 'engine-protect',
    label: 'Engine Protect',
    description: 'Covers engine and gearbox damage from water ingress or oil leakage.',
    price: 780,
  },
  {
    id: 'consumables',
    label: 'Consumables Cover',
    description: 'Engine oil, coolant, nuts, bolts and lubricants during a claim.',
    price: 520,
  },
  {
    id: 'return-to-invoice',
    label: 'Return to Invoice',
    description: 'Pays the original invoice value, not IDV, on total loss or theft.',
    price: 1120,
  },
  {
    id: 'ncb-protect',
    label: 'NCB Protect',
    description: 'Keeps the No Claim Bonus intact after one own-damage claim.',
    price: 680,
  },
  {
    id: 'roadside',
    label: '24×7 Roadside Assistance',
    description: 'Towing, jump start, flat tyre, fuel delivery and on-spot repair.',
    price: 300,
  },
  {
    id: 'key-lock',
    label: 'Key & Lock Replacement',
    description: 'Replacement of lost or damaged keys and lock sets.',
    price: 250,
  },
  {
    id: 'tyre-secure',
    label: 'Tyre Secure',
    description: 'Tyre and tube replacement from cuts, bulges and blowouts.',
    price: 340,
  },
  {
    id: 'personal-baggage',
    label: 'Personal Baggage',
    description: 'Personal belongings lost or damaged inside the vehicle.',
    price: 200,
  },
  {
    id: 'conveyance',
    label: 'Conveyance Benefit',
    description: 'Daily allowance while the vehicle is at an authorised garage.',
    price: 180,
  },
];

/**
 * Depreciation-linked covers stop being issuable once the car is old enough
 * that the insurer would be paying out more than the car is worth.
 */
const AGE_RESTRICTED_ADD_ONS: Record<string, number> = {
  'zero-dep': 5,
  'return-to-invoice': 5,
  'tyre-secure': 5,
};

/** Add-ons are off the table past 15 years — underwriting handles those at proposal. */
export const isTooOldForAddOns = (
  manufacturingYear: string,
  currentYear: number = new Date().getFullYear(),
): boolean => {
  const year = Number(manufacturingYear);

  if (manufacturingYear.trim() === '' || Number.isNaN(year) || year <= 1900) {
    return false;
  }

  return currentYear - year > 15;
};

export const isAddOnAvailable = (
  addOn: AddOn,
  manufacturingYear: string,
  currentYear: number = new Date().getFullYear(),
): boolean => {
  if (isTooOldForAddOns(manufacturingYear, currentYear)) return false;

  const maxAge = AGE_RESTRICTED_ADD_ONS[addOn.id];

  if (maxAge === undefined) return true;

  const year = Number(manufacturingYear);

  if (manufacturingYear.trim() === '' || Number.isNaN(year)) return true;

  return currentYear - year <= maxAge;
};

/** Add-ons only attach to the own-damage half, so a TP-only quote can't carry them. */
export const planSupportsAddOns = (planId: PlanId): boolean =>
  getPlan(planId).coversOwnDamage;

/**
 * Third-party rates are notified by IRDAI and identical across insurers, so
 * there is no margin in them to discount or load. A plan that sells nothing
 * but third party offers the agent no room to move the premium at all.
 */
export const planAllowsDiscountLoader = (planId: PlanId): boolean =>
  getPlan(planId).coversOwnDamage;

/* ------------------------------------------------------------------ */
/* Premium                                                             */
/* ------------------------------------------------------------------ */

/** How far the agent can move the premium, either way. */
export const DISCOUNT_LOADER_LIMIT = 20;

/** Half a percent is the finest the premium can be nudged. */
export const DISCOUNT_LOADER_STEP = 0.5;

/**
 * Small movements are the agent's to make. At 10% either way the proposal
 * stops being theirs to issue and goes to their RM for approval.
 */
export const DISCOUNT_LOADER_APPROVAL_THRESHOLD = 10;

/**
 * The web widget carried a discount thumb and a loader thumb, but only one side
 * is ever in play — this collapses the pair into the single signed percentage
 * the premium calculation needs. Native uses one signed slider and holds that
 * number directly; this is kept so the ported rules tests still cover the
 * collapse, and for any caller still holding a `[low, high]` pair.
 */
export const effectiveDiscountLoader = (value: [number, number]): number =>
  value[0] < 0 ? value[0] : value[1] > 0 ? value[1] : 0;

export const needsApproval = (discountLoaderPercent: number): boolean =>
  Math.abs(discountLoaderPercent) >= DISCOUNT_LOADER_APPROVAL_THRESHOLD;

/** Third party is IRDAI-notified, so it is the same number for every insurer. */
export const THIRD_PARTY_BASIC = 3416;
export const PA_OWNER_DRIVER = 375;
export const GST_RATE = 0.18;

export interface PremiumInput {
  vehicle: VehicleRecord;
  planId: PlanId;
  idv: number;
  ncbPercent: number;
  selectedAddOnIds: string[];
  /** Negative for a discount, positive for a loader, as a percentage. */
  discountLoaderPercent: number;
}

export interface PremiumBreakup {
  idv: number | null;

  ownDamage: {
    basic: number;
    addOns: number;
    addOnCount: number;
    ncbPercent: number;
    ncbAmount: number;
    net: number;
    /** Years this half runs for — the two can differ on a bundled policy. */
    years: number;
  } | null;

  thirdParty: {
    basic: number;
    paCover: number;
    net: number;
    years: number;
  } | null;

  /** Rupee value of the discount (negative) or loader (positive). */
  adjustment: number;
  netPremium: number;
  gst: number;
  total: number;
}

export const calculatePremium = ({
  vehicle,
  planId,
  idv,
  ncbPercent,
  selectedAddOnIds,
  discountLoaderPercent,
}: PremiumInput): PremiumBreakup => {
  const plan = getPlan(planId);

  let ownDamage: PremiumBreakup['ownDamage'] = null;

  if (plan.coversOwnDamage) {
    const basic = Math.round(idv * vehicle.ownDamageRate);

    const selected = ADD_ONS.filter((addOn) =>
      selectedAddOnIds.includes(addOn.id),
    );

    const addOns = selected.reduce((sum, addOn) => sum + addOn.price, 0);
    const ncbAmount = Math.round((basic * ncbPercent) / 100);

    ownDamage = {
      basic,
      addOns,
      addOnCount: selected.length,
      ncbPercent,
      ncbAmount,
      net: basic + addOns - ncbAmount,
      years: plan.ownDamageYears,
    };
  }

  // A long-term third-party leg is paid once, up front, for all its years.
  const thirdParty: PremiumBreakup['thirdParty'] = plan.coversThirdParty
    ? {
        basic: THIRD_PARTY_BASIC * plan.thirdPartyYears,
        paCover: PA_OWNER_DRIVER * plan.thirdPartyYears,
        net: (THIRD_PARTY_BASIC + PA_OWNER_DRIVER) * plan.thirdPartyYears,
        years: plan.thirdPartyYears,
      }
    : null;

  const subtotal = (ownDamage?.net ?? 0) + (thirdParty?.net ?? 0);

  // Guarded here as well as in the UI so a value left over from a previous
  // plan can't quietly move the price of a policy that has no discretion.
  const adjustment = planAllowsDiscountLoader(planId)
    ? Math.round((subtotal * discountLoaderPercent) / 100)
    : 0;
  const netPremium = subtotal + adjustment;
  const gst = Math.round(netPremium * GST_RATE);

  return {
    // A third-party policy pays nothing for the customer's own car, so
    // there is no insured value to quote.
    idv: plan.coversOwnDamage ? idv : null,
    ownDamage,
    thirdParty,
    adjustment,
    netPremium,
    gst,
    total: netPremium + gst,
  };
};

/**
 * Indian digit grouping — 5,20,000, not 520,000.
 *
 * Written out rather than handed to `Intl.NumberFormat('en-IN')`: Hermes ships
 * a cut-down ICU whose locale data varies by platform and build, and a silent
 * fall back to Western grouping would be wrong on every price on every screen.
 */
export const formatRupees = (value: number): string => {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded));

  if (digits.length <= 3) return sign + digits;

  // Last three digits stand alone; everything before them groups in pairs.
  return (
    sign +
    digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
    ',' +
    digits.slice(-3)
  );
};

/* ------------------------------------------------------------------ */
/* Ready-made quotes                                                   */
/* ------------------------------------------------------------------ */

export interface ReadyMadeQuote {
  id: string;
  name: string;
  /** Add-ons bundled into this package. */
  addOnIds: string[];
  /** IDV as a multiple of the recommended value. */
  idvFactor: number;
  /** Compulsory deductible the customer bears per claim. */
  excess: number;
  theme: 'eco' | 'premium' | 'super';
}

export const READY_MADE_QUOTES: ReadyMadeQuote[] = [
  {
    id: 'eco',
    name: 'Eco Plan',
    addOnIds: ['roadside', 'key-lock'],
    idvFactor: 0.85,
    excess: 5000,
    theme: 'eco',
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    addOnIds: ['roadside', 'key-lock', 'personal-baggage', 'consumables'],
    idvFactor: 1,
    excess: 0,
    theme: 'premium',
  },
  {
    id: 'super',
    name: 'Super Plan',
    addOnIds: [
      'roadside',
      'key-lock',
      'personal-baggage',
      'consumables',
      'engine-protect',
      'conveyance',
    ],
    idvFactor: 1.15,
    excess: 0,
    theme: 'super',
  },
];

/**
 * A package lists what it includes first, then the notable covers it leaves
 * out — so the agent can see at a glance what the next tier up would add.
 */
export const READY_MADE_EXCLUSION_ORDER = [
  'engine-protect',
  'consumables',
  'zero-dep',
  'return-to-invoice',
];

/** Own damage, third party and total for one ready-made package. */
export const priceReadyMadeQuote = (
  quote: ReadyMadeQuote,
  vehicle: VehicleRecord,
  planId: PlanId,
  ncbPercent: number,
): PremiumBreakup =>
  calculatePremium({
    vehicle,
    planId,
    idv: Math.round(vehicle.recommendedIdv * quote.idvFactor),
    ncbPercent,
    selectedAddOnIds: quote.addOnIds,
    discountLoaderPercent: 0,
  });

/* ------------------------------------------------------------------ */
/* Screen chrome                                                       */
/* ------------------------------------------------------------------ */

/** Quotes stay valid for 21 days from the day they're generated. */
export const QUOTE_VALIDITY_DAYS = 21;

/** "31st Aug 2026" — ordinal day, short month. */
export const formatQuoteValidity = (date: Date): string => {
  const day = date.getDate();

  const suffix =
    day % 10 === 1 && day !== 11 ? 'st'
      : day % 10 === 2 && day !== 12 ? 'nd'
        : day % 10 === 3 && day !== 13 ? 'rd'
          : 'th';

  return `${day}${suffix} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/** IDV track bounds, in rupees. */
export const IDV_MIN = 50000;
export const IDV_MAX = 1500000;

/** IDV for an unregistered vehicle, where there is no lookup to price against. */
export const DEFAULT_IDV = 800000;

/**
 * Browse Categories products that route to the motor flow — and so need a
 * vehicle type chosen before the flow can mount. Shared by `BusinessScreen`
 * (which opens the standalone sheet) and `QuickQuotes` (which asks in-sheet).
 */
export const MOTOR_PRODUCTS = ['Private Car', 'Two Wheeler', 'Commercial Vehicle', 'Pay as you Consume'];

/** Options for the unregistered-vehicle form, where there is nothing to look up. */
export const MODEL_OPTIONS = ['Swift', 'Baleno', 'i20'].map((v) => ({ label: v, value: v }));
export const MAKE_OPTIONS = ['Maruti', 'Hyundai', 'Tata', 'Honda'].map((v) => ({ label: v, value: v }));
export const SUBTYPE_OPTIONS = ['Hatchback', 'Sedan', 'SUV', 'MUV'].map((v) => ({ label: v, value: v }));
export const LOCATION_OPTIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'].map((v) => ({ label: v, value: v }));

/**
 * Manufacturing years, newest first. Runs back far enough that the manually
 * entered flow can reach vehicles past the 15-year add-on cutoff
 * (`isTooOldForAddOns`), same as a looked-up one.
 */
const OLDEST_MANUFACTURING_YEAR = 2005;
export const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - OLDEST_MANUFACTURING_YEAR + 1 },
  (_, i) => String(new Date().getFullYear() - i),
).map((v) => ({ label: v, value: v }));
