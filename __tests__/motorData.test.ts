import {
  isTooOldForAddOns,
  formatQuoteValidity,
  lookupVehicle,
  validateRegistration,
  YEAR_OPTIONS,
} from '../src/presentation/components/dashboard/business/motor/motorData';

describe('isTooOldForAddOns', () => {
  it('blocks add-ons only past 15 years', () => {
    expect(isTooOldForAddOns('2010', 2026)).toBe(true); // 16 years
    expect(isTooOldForAddOns('2011', 2026)).toBe(false); // exactly 15
    expect(isTooOldForAddOns('2020', 2026)).toBe(false);
  });

  it('stays quiet when the year is missing or junk', () => {
    expect(isTooOldForAddOns('', 2026)).toBe(false);
    expect(isTooOldForAddOns('   ', 2026)).toBe(false);
    expect(isTooOldForAddOns('abcd', 2026)).toBe(false);
  });

  it('fires for the aged demo vehicle', () => {
    expect(isTooOldForAddOns(lookupVehicle('mh08l9035')!.year, 2026)).toBe(true);
    expect(isTooOldForAddOns(lookupVehicle('MH08L9834')!.year, 2026)).toBe(false);
  });
});

describe('YEAR_OPTIONS', () => {
  it('lets a manually entered vehicle reach past the 15-year cutoff', () => {
    const now = new Date().getFullYear();
    const years = YEAR_OPTIONS.map((o) => o.value);
    expect(years[0]).toBe(String(now));
    expect(years[years.length - 1]).toBe('2005');
    expect(years.some((y) => isTooOldForAddOns(y, now))).toBe(true);
  });
});

describe('validateRegistration', () => {
  it('accepts one to three series letters', () => {
    expect(validateRegistration('MH08L9834')).toBe(true);
    expect(validateRegistration('KL07AB1234')).toBe(true);
    expect(validateRegistration('kl07abc1234')).toBe(true);
    expect(validateRegistration('KL07ABCD1234')).toBe(false);
    expect(validateRegistration('KL071234')).toBe(false);
  });
});

describe('formatQuoteValidity', () => {
  it('picks the right ordinal suffix, including the 11-13 exceptions', () => {
    expect(formatQuoteValidity(new Date(2026, 1, 21))).toBe('21st Feb 2026');
    expect(formatQuoteValidity(new Date(2026, 1, 22))).toBe('22nd Feb 2026');
    expect(formatQuoteValidity(new Date(2026, 1, 23))).toBe('23rd Feb 2026');
    expect(formatQuoteValidity(new Date(2026, 1, 24))).toBe('24th Feb 2026');
    expect(formatQuoteValidity(new Date(2026, 1, 11))).toBe('11th Feb 2026');
    expect(formatQuoteValidity(new Date(2026, 1, 12))).toBe('12th Feb 2026');
    expect(formatQuoteValidity(new Date(2026, 1, 13))).toBe('13th Feb 2026');
    expect(formatQuoteValidity(new Date(2026, 0, 1))).toBe('1st Jan 2026');
  });
});
