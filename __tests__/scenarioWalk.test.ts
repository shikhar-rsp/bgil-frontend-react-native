import {
  calculatePremium,
  findVehicle,
  getAvailablePlans,
  getDaysExpired,
  getNcbSlab,
  getVehicleAgeBucket,
  isAddOnAvailable,
  ADD_ONS,
  planAllowsDiscountLoader,
  planSupportsAddOns,
} from '../src/presentation/components/dashboard/business/motor/motorQuoteData';

const TODAY = new Date(2026, 7, 12);

const walk = (plate: string) => {
  const vehicle = findVehicle(plate)!;
  const bucket = getVehicleAgeBucket(vehicle, TODAY);
  const daysExpired = getDaysExpired(vehicle);
  const ncb = getNcbSlab(bucket, false, daysExpired);
  return { vehicle, bucket, daysExpired, ncb };
};

it('board 1 — MH08L9834, over 5 years, full flow', () => {
  const { vehicle, bucket, ncb } = walk('MH08L9834');

  expect(bucket).toBe('over5');
  expect(getAvailablePlans(bucket).map((p) => p.id)).toEqual(['comprehensive', 'tp', 'od']);
  expect(ncb.percent).toBe(50);
  expect(ncb.label).toBe('5+ years');

  // The one figure the design and the engine agree on exactly.
  const tp = calculatePremium({
    vehicle, planId: 'tp', idv: vehicle.recommendedIdv,
    ncbPercent: ncb.percent, selectedAddOnIds: [], discountLoaderPercent: 0,
  });
  expect(tp.total).toBe(4473);
});

it('board 2 — third-party only strips IDV, add-ons and discount', () => {
  const { vehicle, ncb } = walk('MH08L9834');

  expect(planSupportsAddOns('tp')).toBe(false);
  expect(planAllowsDiscountLoader('tp')).toBe(false);

  // A discount left over from another plan must not move the price.
  const tp = calculatePremium({
    vehicle, planId: 'tp', idv: vehicle.recommendedIdv, ncbPercent: ncb.percent,
    selectedAddOnIds: ['zero-dep', 'roadside'], discountLoaderPercent: -20,
  });

  expect(tp.idv).toBeNull();
  expect(tp.ownDamage).toBeNull();
  expect(tp.adjustment).toBe(0);
  expect(tp.total).toBe(4473);
});

it('board 3 — under 3 years offers Own Damage only, at the 25% slab', () => {
  const { vehicle, bucket, ncb } = walk('KL07AB1234');

  expect(bucket).toBe('under3');
  expect(getAvailablePlans(bucket).map((p) => p.id)).toEqual(['od']);
  expect(ncb.percent).toBe(25);

  const od = calculatePremium({
    vehicle, planId: 'od', idv: vehicle.recommendedIdv,
    ncbPercent: ncb.percent, selectedAddOnIds: [], discountLoaderPercent: 0,
  });

  // OD-only breakup: no third-party half at all.
  expect(od.thirdParty).toBeNull();
  expect(od.ownDamage!.basic).toBe(Math.round(593000 * 0.019));
  expect(od.ownDamage!.ncbAmount).toBe(Math.round(od.ownDamage!.basic * 0.25));
});

it('board 4 — expired inside grace keeps the bonus; past grace loses it', () => {
  const intact = walk('KL07CD5678');
  expect(intact.bucket).toBe('expired');
  expect(intact.daysExpired).toBe(34);
  expect(intact.ncb.percent).toBe(50);

  const lapsed = walk('MH08L9037');
  expect(lapsed.bucket).toBe('expired');
  expect(lapsed.daysExpired).toBe(128);
  // Break-in alert AND a zero bonus — these must agree.
  expect(lapsed.ncb.percent).toBe(0);

  const premium = calculatePremium({
    vehicle: lapsed.vehicle, planId: 'comprehensive', idv: lapsed.vehicle.recommendedIdv,
    ncbPercent: lapsed.ncb.percent, selectedAddOnIds: [], discountLoaderPercent: 0,
  });
  expect(premium.ownDamage!.ncbAmount).toBe(0);
});

it('over-15-year vehicle has every add-on withdrawn', () => {
  const { vehicle } = walk('MH08L9035');
  const available = ADD_ONS.filter((a) => isAddOnAvailable(a, vehicle.year, 2026));
  expect(available).toHaveLength(0);
});

it('a 2020 vehicle keeps the age-agnostic add-ons but loses the depreciation ones', () => {
  const available = ADD_ONS.filter((a) => isAddOnAvailable(a, '2020', 2026)).map((a) => a.id);
  expect(available).not.toContain('zero-dep');
  expect(available).not.toContain('return-to-invoice');
  expect(available).not.toContain('tyre-secure');
  expect(available).toContain('roadside');
});
