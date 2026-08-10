import type { ImageSourcePropType } from 'react-native';
import { dashboardImages } from '../../images';

/** Mock vehicle-lookup + plan/add-on data for the Two-Wheeler / Motor flow. */

/** Card artwork per vehicle type — the image follows the type, not the vehicle. */
export const VEHICLE_TYPE_IMAGES = {
  car: dashboardImages.carPng,
  commercial: dashboardImages.commercialPng,
  schoolBus: dashboardImages.schoolBus,
  // No scooter art bundled — the cycle asset stands in for it.
  scooter: dashboardImages.cyclePng,
  bike: dashboardImages.bulletPng,
} satisfies Record<string, ImageSourcePropType>;

export type VehicleTypeKey = keyof typeof VEHICLE_TYPE_IMAGES;

export type VehicleInfo = {
  type: VehicleTypeKey;
  model: string;
  make: string;
  subType: string;
  year: string;
  location: string;
  regDate: string;
};

/** Registration numbers that resolve to a pre-filled vehicle. */
export const VEHICLE_LOOKUP: Record<string, VehicleInfo> = {
  MH08L9834: { type: 'car', model: 'Swift Dzire', make: '28914y0912', subType: 'On Year', year: '2020', location: 'Pune', regDate: '30 Nov 2020' },
  KL07AB1234: { type: 'car', model: 'Swift Dzire', make: '28914v0912', subType: 'On Year', year: '2020', location: 'Pune', regDate: '30 Nov 2020' },
  KL07CD5678: { type: 'commercial', model: 'Commercial', make: 'CMR781299', subType: 'On Year', year: '2022', location: 'Mumbai', regDate: '14 Feb 2022' },
  KL07EF9012: { type: 'schoolBus', model: 'Tata Starbus', make: 'SBU223881', subType: 'On Year', year: '2021', location: 'Bangalore', regDate: '10 Jun 2021' },
  KL07GH3456: { type: 'scooter', model: 'Scooter', make: 'SCT992211', subType: 'On Year', year: '2023', location: 'Chennai', regDate: '05 Jan 2023' },
  KL07JK7890: { type: 'bike', model: 'Royal Enfield Classic 350', make: 'RE663388', subType: 'On Year', year: '2024', location: 'Kochi', regDate: '21 Mar 2024' },
  // Over 15 years old — add-ons are blocked for this one.
  MH08L9035: { type: 'car', model: 'Maruti Alto', make: '10284k7761', subType: 'On Year', year: '2010', location: 'Pune', regDate: '18 Jun 2010' },
};

export const isVehicleFound = (registrationNumber: string): boolean =>
  Boolean(VEHICLE_LOOKUP[registrationNumber.toUpperCase()]);

/** Registration format XX00X(XX)0000 — MH08L9834, KL07AB1234. */
export const validateRegistration = (val: string): boolean =>
  /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/.test(val.toUpperCase());

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

/** IDV slider starts here (Rs. 50,000 – Rs. 15,00,000 range). */
export const DEFAULT_IDV = '8,00,000';

/** Quotes stay valid for 21 days from the day they're generated. */
export const QUOTE_VALIDITY_DAYS = 21;

// Plain table rather than Intl/toLocaleString — the month names are fixed
// English here, and this sidesteps Hermes' locale data entirely.
const SHORT_MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

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

/**
 * Stand-in details for a correctly-formatted number that isn't in the mock
 * table above, so the flow can be walked with any realistic registration.
 */
export const GENERIC_VEHICLE: VehicleInfo = {
  type: 'bike',
  model: 'Two Wheeler',
  make: 'RE663388',
  subType: 'On Year',
  year: '2024',
  location: 'Kochi',
  regDate: '21 Mar 2024',
};

/**
 * Resolve a registration number to vehicle details. Numbers in `VEHICLE_LOOKUP`
 * return their own entry; any other correctly-formatted number falls back to
 * `GENERIC_VEHICLE`. Returns null only when the format itself is invalid.
 */
export const lookupVehicle = (registrationNumber: string): VehicleInfo | null =>
  validateRegistration(registrationNumber)
    ? VEHICLE_LOOKUP[registrationNumber.toUpperCase()] ?? GENERIC_VEHICLE
    : null;

/**
 * Browse Categories products that route to the motor flow — and so need a
 * vehicle type chosen before the flow can mount. Shared by `BusinessScreen`
 * (which opens the standalone sheet) and `QuickQuotes` (which asks in-sheet).
 */
export const MOTOR_PRODUCTS = ['Private Car', 'Two Wheeler', 'Commercial Vehicle', 'Pay as you Consume'];

export const PLAN_TYPE_OPTIONS = [
  { label: 'Own Damage', value: 'od' },
  { label: 'Package Policy', value: 'package-policy' },
  { label: 'Third Party', value: 'third-party' },
];

export const MODEL_OPTIONS = ['Swift', 'Baleno', 'i20'].map((v) => ({ label: v, value: v }));
export const MAKE_OPTIONS = ['Maruti', 'Hyundai', 'Tata', 'Honda'].map((v) => ({ label: v, value: v }));
export const SUBTYPE_OPTIONS = ['Hatchback', 'Sedan', 'SUV', 'MUV'].map((v) => ({ label: v, value: v }));
export const YEAR_OPTIONS = ['2026', '2025', '2024', '2023', '2022'].map((v) => ({ label: v, value: v }));
export const LOCATION_OPTIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'].map((v) => ({ label: v, value: v }));
export const NCB_OPTIONS = ['0', '20', '25', '35', '45', '50'].map((v) => ({ label: `${v}%`, value: v }));

export const MAIN_PACKAGES = [
  'Eco Assure Repair Protection',
  'Drive Assure Drive Smart',
  'Drive Assure Welcome',
  'Drive Assure Welcome Plus',
  'Drive Assure - Economy',
  '24x7 Spot Assistance',
];

export const TOPUP_PACKAGES = [
  'Personal Baggage Cover',
  'Consumable Expenses',
  'Conveyance Benefit',
  'Accidentshield',
  'Accident Prime Insured 30000',
  'Accident Prime Insured 100000',
];

export type TenureOption = { label: string; value: string; price: string; badge?: string };

export const tenureOptionsFor = (planType: string): TenureOption[] => {
  switch (planType) {
    case 'third-party':
      return [
        { label: '2 years', value: '2', price: '11,500' },
        { label: '3 years', value: '3', price: '12,500', badge: 'MAXX Saver' },
        { label: '5 years', value: '5', price: '18,500' },
      ];
    case 'od':
      return [
        { label: '1 year', value: '1', price: '8,500' },
        { label: '2 years', value: '2', price: '11,500' },
        { label: '3 years', value: '3', price: '12,500', badge: 'MAXX Saver' },
      ];
    case 'package-policy':
      return [
        { label: '1 yr + 3 yrs', value: '1+3', price: '14,500' },
        { label: '1 yr + 5 yrs', value: '1+5', price: '18,500', badge: 'MAXX Saver' },
        { label: '2 yrs + 3 yrs', value: '2+3', price: '20,500' },
      ];
    default:
      return [];
  }
};

export const TENURE_YEAR_MAP: Record<string, number> = {
  '1': 1, '2': 2, '3': 3, '5': 5, '1+3': 4, '1+5': 6, '2+3': 5,
};
