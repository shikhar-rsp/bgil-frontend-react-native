import type { ImageSourcePropType } from 'react-native';
import { dashboardImages } from '../../images';

/** Mock vehicle-lookup + plan/add-on data for the Two-Wheeler / Motor flow. */

export type VehicleInfo = {
  type: string;
  model: string;
  make: string;
  subType: string;
  year: string;
  location: string;
  regDate: string;
  icon: ImageSourcePropType;
};

/** Registration numbers that resolve to a pre-filled vehicle. */
export const VEHICLE_LOOKUP: Record<string, VehicleInfo> = {
  KL07AB1234: { type: 'car', model: 'Swift Dzire', make: '28914v0912', subType: 'On Year', year: '2020', location: 'Pune', regDate: '30 Nov 2020', icon: dashboardImages.carPng },
  KL07CD5678: { type: 'commercial', model: 'Commercial', make: 'CMR781299', subType: 'On Year', year: '2022', location: 'Mumbai', regDate: '14 Feb 2022', icon: dashboardImages.commercialPng },
  KL07EF9012: { type: 'schoolBus', model: 'Tata Starbus', make: 'SBU223881', subType: 'On Year', year: '2021', location: 'Bangalore', regDate: '10 Jun 2021', icon: dashboardImages.schoolBus },
  KL07GH3456: { type: 'scooter', model: 'Scooter', make: 'SCT992211', subType: 'On Year', year: '2023', location: 'Chennai', regDate: '05 Jan 2023', icon: dashboardImages.cyclePng },
  KL07JK7890: { type: 'bike', model: 'Royal Enfield Classic 350', make: 'RE663388', subType: 'On Year', year: '2024', location: 'Kochi', regDate: '21 Mar 2024', icon: dashboardImages.bulletPng },
};

export const isVehicleFound = (registrationNumber: string): boolean =>
  Boolean(VEHICLE_LOOKUP[registrationNumber.toUpperCase()]);

/** Registration format XX00X(X)0000. */
export const validateRegistration = (val: string): boolean =>
  /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(val.toUpperCase());

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
        { label: '3 years', value: '3', price: '12,500', badge: 'MAXX Saver' },
        { label: '5 years', value: '5', price: '18,500' },
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
