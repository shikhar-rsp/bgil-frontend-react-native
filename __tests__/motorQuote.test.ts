import {
  ADD_ONS,
  calculatePremium,
  effectiveDiscountLoader,
  findVehicle,
  formatRupees,
  getAvailablePlans,
  getDaysExpired,
  getNcbSlab,
  getPrefetchedPolicyPeriod,
  getVehicleAgeBucket,
  isAddOnAvailable,
  isVehicleFound,
  lookupVehicle,
  needsApproval,
  parseShortDate,
  planAllowsDiscountLoader,
  validateRegistration,
} from '../src/presentation/components/dashboard/business/motor/motorQuoteData';

/** Pinned local midnight, so neither the age buckets nor the date maths drift. */
const TODAY = new Date(2026, 7, 12);

const OVER_5 = findVehicle('MH08L9834')!;
const UNDER_3 = findVehicle('KL07AB1234')!;
const UNDER_3_SUV = findVehicle('MH08L9036')!;
const EXPIRED = findVehicle('KL07CD5678')!;
const LONG_EXPIRED = findVehicle('MH08L9037')!;

describe('getVehicleAgeBucket', () => {
  it('sorts the demo vehicles into their scenarios', () => {
    expect(getVehicleAgeBucket(OVER_5, TODAY)).toBe('over5');
    expect(getVehicleAgeBucket(UNDER_3, TODAY)).toBe('under3');
    expect(getVehicleAgeBucket(UNDER_3_SUV, TODAY)).toBe('under3');
  });

  it('lets a lapsed policy outrank the age of the vehicle', () => {
    expect(getVehicleAgeBucket(EXPIRED, TODAY)).toBe('expired');
    expect(getDaysExpired(EXPIRED)).toBe(34);

    expect(getVehicleAgeBucket(LONG_EXPIRED, TODAY)).toBe('expired');
    expect(getDaysExpired(LONG_EXPIRED)).toBe(128);
  });

  it('reports no lapse while the policy is still in force', () => {
    expect(getDaysExpired(OVER_5)).toBe(0);
  });
});

describe('lookupVehicle', () => {
  it('returns the demo record for a scripted plate', () => {
    expect(lookupVehicle('MH08L9834')).toBe(findVehicle('MH08L9834'));
  });

  it('falls back so every well-formed plate resolves, and prefetches its dates', () => {
    const vehicle = lookupVehicle('MH12AB4321')!;

    expect(vehicle).toBeDefined();
    expect(isVehicleFound('MH12AB4321')).toBe(true);
    // The whole point: a vehicle means a prefetched policy period.
    expect(getPrefetchedPolicyPeriod(vehicle, TODAY).start).toBeInstanceOf(Date);
  });

  it('refuses a malformed plate', () => {
    expect(lookupVehicle('NOTAPLATE')).toBeUndefined();
    expect(isVehicleFound('MH08')).toBe(false);
  });

  /** Phone keyboards readily drop a space into a plate; desktop typing does not. */
  it('ignores stray whitespace and case', () => {
    expect(lookupVehicle('mh08 l9834')).toBe(findVehicle('MH08L9834'));
    expect(validateRegistration(' MH08L9834 ')).toBe(true);
  });
});

/**
 * Hermes does not guarantee `Date.parse` on "30 Nov 2020". If this regresses to
 * Invalid Date every bucket silently collapses to `over5`, so it is checked
 * directly rather than only through the buckets above.
 */
describe('parseShortDate', () => {
  it('reads the stored regDate format without leaning on the engine', () => {
    const parsed = parseShortDate('30 Nov 2020');

    expect(parsed.getFullYear()).toBe(2020);
    expect(parsed.getMonth()).toBe(10);
    expect(parsed.getDate()).toBe(30);
  });

  it('parses every demo vehicle to a real date', () => {
    ['MH08L9834', 'KL07AB1234', 'MH08L9036', 'KL07CD5678', 'MH08L9037',
      'KL07EF9012', 'KL07GH3456', 'KL07JK7890', 'MH08L9035'].forEach((plate) => {
      const date = parseShortDate(findVehicle(plate)!.regDate);
      expect(Number.isNaN(date.getTime())).toBe(false);
    });
  });
});

/**
 * `Intl.NumberFormat('en-IN')` is not dependable on Hermes, and a silent fall
 * back to Western grouping would be wrong on every price on every screen.
 */
describe('formatRupees', () => {
  it('groups in the Indian system', () => {
    expect(formatRupees(520000)).toBe('5,20,000');
    expect(formatRupees(1500000)).toBe('15,00,000');
    expect(formatRupees(78000)).toBe('78,000');
    expect(formatRupees(3416)).toBe('3,416');
    expect(formatRupees(375)).toBe('375');
    expect(formatRupees(12108)).toBe('12,108');
  });

  it('rounds and keeps the sign', () => {
    expect(formatRupees(1026.4)).toBe('1,026');
    expect(formatRupees(-1026)).toBe('-1,026');
  });
});

describe('getPrefetchedPolicyPeriod', () => {
  /** Local date parts — the offsets are applied in local time. */
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;

  it('picks up the day after an in-force policy expires', () => {
    // MH08L9834's policy still has 110 days to run, so it ends 30 Nov 2026.
    const { start, end } = getPrefetchedPolicyPeriod(OVER_5, TODAY);

    expect(ymd(start)).toBe('2026-12-01');
    expect(ymd(end)).toBe('2027-11-30');
  });

  it('runs a one-year policy to the day before its anniversary', () => {
    // MH08L9036's own-damage year runs out in 37 days.
    const { start, end } = getPrefetchedPolicyPeriod(UNDER_3_SUV, TODAY);

    expect(ymd(start)).toBe('2026-09-19');
    expect(ymd(end)).toBe('2027-09-18');
  });

  it('cannot backdate cover for a lapsed policy, so it starts today', () => {
    expect(ymd(getPrefetchedPolicyPeriod(EXPIRED, TODAY).start)).toBe(ymd(TODAY));
    expect(ymd(getPrefetchedPolicyPeriod(LONG_EXPIRED, TODAY).start)).toBe(ymd(TODAY));
  });
});

describe('getAvailablePlans', () => {
  it('offers own damage only while the bundled third party still runs', () => {
    expect(getAvailablePlans('under3').map((p) => p.id)).toEqual(['od']);
  });

  it('offers all three once the vehicle is off its bundled cover', () => {
    expect(getAvailablePlans('mid')).toHaveLength(3);
    expect(getAvailablePlans('over5')).toHaveLength(3);
    expect(getAvailablePlans('expired')).toHaveLength(3);
  });
});

describe('getNcbSlab', () => {
  it('climbs the slab with claim-free years', () => {
    expect(getNcbSlab('under3', false).percent).toBe(25);
    expect(getNcbSlab('mid', false).percent).toBe(35);
    expect(getNcbSlab('over5', false).percent).toBe(50);
  });

  it('wipes the bonus when a claim was made on the expiring policy', () => {
    expect(getNcbSlab('over5', true).percent).toBe(0);
  });

  it('keeps the bonus while the lapse is inside the grace window', () => {
    expect(getNcbSlab('expired', false, 34).percent).toBe(50);
    expect(getNcbSlab('expired', false, 90).percent).toBe(50);
  });

  it('wipes the bonus once the lapse runs past the grace window', () => {
    expect(getNcbSlab('expired', false, 91).percent).toBe(0);
    expect(getNcbSlab('expired', false, 128).percent).toBe(0);
  });

  /**
   * An earlier web build showed the "bonus has lapsed" copy while still
   * applying a 50% discount — the break-in screen and the premium have to
   * agree.
   */
  it('gives the long-lapsed demo vehicle a break-in and no bonus', () => {
    expect(getVehicleAgeBucket(LONG_EXPIRED, TODAY)).toBe('expired');
    expect(
      getNcbSlab('expired', false, getDaysExpired(LONG_EXPIRED)).percent,
    ).toBe(0);
  });
});

describe('calculatePremium', () => {
  const base = {
    vehicle: OVER_5,
    idv: OVER_5.recommendedIdv,
    ncbPercent: 50,
    selectedAddOnIds: [
      'consumables',
      'roadside',
      'key-lock',
      'personal-baggage',
    ],
    discountLoaderPercent: 0,
  };

  it('bills both halves for a comprehensive policy', () => {
    const premium = calculatePremium({ ...base, planId: 'comprehensive' });

    expect(premium.idv).toBe(520000);
    expect(premium.ownDamage).toMatchObject({
      basic: 10400,
      addOns: 1270,
      addOnCount: 4,
      ncbAmount: 5200,
      net: 6470,
    });
    expect(premium.thirdParty).toMatchObject({ net: 3791 });
    expect(premium.netPremium).toBe(10261);
    expect(premium.total).toBe(12108);
  });

  it('quotes no insured value on a third-party-only policy', () => {
    const premium = calculatePremium({ ...base, planId: 'tp' });

    expect(premium.idv).toBeNull();
    expect(premium.ownDamage).toBeNull();
    expect(premium.netPremium).toBe(3791);
    expect(premium.total).toBe(4473);
  });

  it('drops the third-party half on an own-damage policy', () => {
    const premium = calculatePremium({ ...base, planId: 'od' });

    expect(premium.thirdParty).toBeNull();
    expect(premium.netPremium).toBe(6470);
  });

  it('tracks the IDV slider', () => {
    const premium = calculatePremium({ ...base, planId: 'od', idv: 600000 });

    expect(premium.ownDamage?.basic).toBe(12000);
  });

  it('leaves an IRDAI-rated third-party policy untouched by a discount', () => {
    const premium = calculatePremium({
      ...base,
      planId: 'tp',
      discountLoaderPercent: -15,
    });

    expect(premium.adjustment).toBe(0);
    expect(premium.netPremium).toBe(3791);
    expect(premium.total).toBe(4473);
  });

  it('applies a discount and a loader either side of the net premium', () => {
    const discounted = calculatePremium({
      ...base,
      planId: 'comprehensive',
      discountLoaderPercent: -10,
    });

    const loaded = calculatePremium({
      ...base,
      planId: 'comprehensive',
      discountLoaderPercent: 10,
    });

    expect(discounted.adjustment).toBe(-1026);
    expect(discounted.netPremium).toBe(9235);

    expect(loaded.adjustment).toBe(1026);
    expect(loaded.netPremium).toBe(11287);
  });
});

describe('effectiveDiscountLoader', () => {
  it('reads whichever thumb has been moved', () => {
    expect(effectiveDiscountLoader([0, 0])).toBe(0);
    expect(effectiveDiscountLoader([-15, 0])).toBe(-15);
    expect(effectiveDiscountLoader([0, 12])).toBe(12);
  });

  it('carries half-percent movements through', () => {
    expect(effectiveDiscountLoader([-7.5, 0])).toBe(-7.5);
    expect(effectiveDiscountLoader([0, 0.5])).toBe(0.5);
  });
});

describe('planAllowsDiscountLoader', () => {
  it('gives the agent no room to move a third-party-only premium', () => {
    expect(planAllowsDiscountLoader('tp')).toBe(false);
  });

  it('allows movement wherever own damage is being sold', () => {
    expect(planAllowsDiscountLoader('comprehensive')).toBe(true);
    expect(planAllowsDiscountLoader('od')).toBe(true);
  });
});

describe('needsApproval', () => {
  it('leaves small movements with the agent', () => {
    expect(needsApproval(0)).toBe(false);
    expect(needsApproval(-9.5)).toBe(false);
    expect(needsApproval(9.5)).toBe(false);
  });

  it('escalates from ten percent either way, inclusive', () => {
    expect(needsApproval(10)).toBe(true);
    expect(needsApproval(-10)).toBe(true);
    expect(needsApproval(20)).toBe(true);
    expect(needsApproval(-20)).toBe(true);
  });
});

describe('isAddOnAvailable', () => {
  const zeroDep = ADD_ONS.find((a) => a.id === 'zero-dep')!;
  const roadside = ADD_ONS.find((a) => a.id === 'roadside')!;

  it('withdraws depreciation covers once the vehicle is past five years', () => {
    expect(isAddOnAvailable(zeroDep, '2024', 2026)).toBe(true);
    expect(isAddOnAvailable(zeroDep, '2020', 2026)).toBe(false);
  });

  it('keeps the age-agnostic covers on offer', () => {
    expect(isAddOnAvailable(roadside, '2020', 2026)).toBe(true);
  });

  it('withdraws everything past fifteen years', () => {
    expect(isAddOnAvailable(roadside, '2005', 2026)).toBe(false);
  });
});
