/** Data + helpers for the detailed Health Guard quote flow. */

export type MemberType = 'Adult' | 'Senior citizen' | 'Child';
export type Member = { id: string; label: string; type: MemberType };
export type MemberDatum = { dob: Date | null; sumInsured: string; selectedAddOns: string[]; wantsAddOns: string };

export const SUM_INSURED_MIN = 500000;
export const SUM_INSURED_MAX = 2500000;

export const PLAN_OPTIONS = [
  { label: 'Health Guard Policy', value: 'health-guard' },
  { label: 'Criti Care', value: 'criti-care' },
  { label: 'Arogya Sanjeevni', value: 'arogya-sanjeevni' },
];

export const COUNT_OPTIONS = ['0', '1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }));

export type SubPlan = {
  id: 'silver' | 'gold' | 'platinum';
  name: string;
  badge: string;
  badgeColor: 'emerald' | 'orange' | 'blue';
  iconBg: string;
  tint: string;
  border: string;
  benefits: string[];
};

export const SUB_PLANS: SubPlan[] = [
  { id: 'silver', name: 'Silver', badge: 'Economic', badgeColor: 'emerald', iconBg: '#475569', tint: '#F8FAFC', border: '#CBD5E1', benefits: ['Hospitalization Cover', 'Nurse at home', 'Pre-hospitalisation expenses', 'Pre-hospitalisation expenses'] },
  { id: 'gold', name: 'Gold', badge: 'Best seller', badgeColor: 'orange', iconBg: '#EA580C', tint: '#FFF7ED', border: '#FB923C', benefits: ['Hospitalization Cover', 'Nurse at home', 'Pre-hospitalisation expenses', 'Pre-hospitalisation expenses'] },
  { id: 'platinum', name: 'Platinum', badge: 'Recommended', badgeColor: 'blue', iconBg: '#4F46E5', tint: '#EEF2FF', border: '#818CF8', benefits: ['Hospitalization Cover', 'Nurse at home', 'Pre-hospitalisation expenses', 'Pre-hospitalisation expenses'] },
];

export const ADD_ON_ITEMS = [
  'OPD Cover',
  'Maternity Cover',
  'Critical Illness',
  'Personal Accident',
  'Hospital Cash',
  'Wellness Benefit',
];

/** Build the member list from counts + proposer (matching the web logic). */
export const buildMembers = (
  proposerIsMember: boolean,
  proposerName: string,
  adults: number,
  seniorCitizens: number,
  childrenCount: number,
): Member[] => {
  const list: Member[] = [];
  if (proposerIsMember) {
    list.push({ id: 'proposer', label: `${proposerName || 'Proposer'} Details`, type: 'Adult' });
  }
  for (let i = 0; i < adults; i += 1) {
    list.push({ id: `adult-${i}`, label: `Adult #${i + 1}`, type: 'Adult' });
  }
  for (let i = 0; i < seniorCitizens; i += 1) {
    list.push({ id: `senior-${i}`, label: `Senior citizen #${i + 1}`, type: 'Senior citizen' });
  }
  for (let i = 0; i < childrenCount; i += 1) {
    list.push({ id: `child-${i}`, label: `Child #${i + 1}`, type: 'Child' });
  }
  return list;
};

export const formatIndianCurrency = (value: string): string => {
  const numeric = value.replace(/\D/g, '');
  return numeric ? `Rs. ${Number(numeric).toLocaleString('en-IN')}` : '';
};

export const numericOnly = (value: string): string => value.replace(/\D/g, '');
