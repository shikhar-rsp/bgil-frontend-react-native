/** Data + types for the detailed Convert-to-Proposal flow. */

export type PlanType = 'individual' | 'float';
export type BusinessType = 'new' | 'portability';

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'transgender', label: 'Transgender' },
];
export const NATIONALITY_OPTIONS = [
  { value: 'indian', label: 'Indian' },
  { value: 'others', label: 'Others' },
];
export const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
];
export const OCCUPATION_OPTIONS = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self-employed', label: 'Self Employed' },
  { value: 'business', label: 'Business' },
  { value: 'retired', label: 'Retired' },
];

export const MEMBER_RELATIONSHIPS = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother'].map((v) => ({
  value: v.toLowerCase(),
  label: v,
}));
export const NOMINEE_RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Sibling'].map((v) => ({
  value: v.toLowerCase(),
  label: v,
}));

export const INSURER_OPTIONS = ['ICICI Lombard', 'HDFC ERGO', 'Star Health', 'Care Health'].map((v) => ({
  value: v,
  label: v,
}));

export const ADD_ON_ITEMS = [
  'OPD Cover',
  'Maternity Cover',
  'Critical Illness',
  'Personal Accident',
  'Hospital Cash',
  'Wellness Benefit',
];

export type PaymentMode = 'agent-float' | 'online-link' | 'customer-float' | 'cheque' | 'voucher';
export const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: 'agent-float', label: 'Agent Float' },
  { value: 'online-link', label: 'Online Link' },
  { value: 'customer-float', label: 'Customer Float' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'voucher', label: 'Voucher' },
];

export const MOCK_OTP = '123456';

/** Pre-existing-disease selection captured in the PED modal, per member. */
export type PedData = {
  /** Indices into the modal's fixed condition list. */
  selectedPeds: number[];
  /** Free-text detail per selected condition index. */
  details: Record<number, string>;
  /** User-entered conditions not in the fixed list. */
  customConditions: string[];
};

export type ProposalMember = {
  id: string;
  name: string;
  relationship: string;
  dob: Date | null;
  height: string;
  weight: string;
  sumInsured: string;
  hasPed: string;
  peds?: PedData;
};

export type Nominee = {
  id: string;
  name: string;
  relationship: string;
  dob: Date | null;
  /** Share of the sum insured, as a percentage string (min 15). */
  allocation: string;
};

export const newMember = (id: string): ProposalMember => ({
  id,
  name: '',
  relationship: '',
  dob: null,
  height: '',
  weight: '',
  sumInsured: '',
  hasPed: '',
});

export const newNominee = (id: string): Nominee => ({ id, name: '', relationship: '', dob: null, allocation: '15' });

export const formatIndianCurrency = (value: string): string => {
  const numeric = value.replace(/\D/g, '');
  return numeric ? `Rs. ${Number(numeric).toLocaleString('en-IN')}` : '';
};
export const numericOnly = (value: string): string => value.replace(/\D/g, '');
