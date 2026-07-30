import type { AccentColor } from '@atlas-ds/react-native';

/**
 * Mock business data, ported from the web tab components' fixtures.
 *
 * Row counts match the web (17 quotes / 14 proposals / 15 policies /
 * 13 renewals) so the tab badges and scrolling behave the same. Two data bugs
 * in the web fixtures are deliberately not carried over: `quotesData` reuses
 * the id `QT123452` on almost every row, and `policyData` repeats `id: 5`
 * twice — both would break list keys and row lookups here.
 */

export type QuoteStatus = 'Accepted' | 'Rejected' | 'Awaiting';
export type ProposalStatus = 'Payment Received' | 'Payment Rejected' | 'Payment Pending' | 'Underwriting';
export type PolicyStatus = 'Paid' | 'Rejected' | 'Pending' | 'Underwriting' | 'Issued' | 'Payment Received';
export type RenewalStatus = 'Accepted' | 'Rejected' | 'Payment Due' | 'Not Started';

export type Quote = {
  id: number;
  customer: string;
  quoteId: string;
  product: string;
  premium: number;
  date: string;
  status: QuoteStatus;
  planType: 'individual' | 'float';
  subPlan: 'silver' | 'gold' | 'platinum';
  sumInsured: string;
  dob: string;
  /** Set on rows produced by the Duplicate action. */
  copiedFrom?: string;
};

export type Proposal = {
  id: number;
  customer: string;
  proposalId: string;
  product: string;
  premium: number;
  status: ProposalStatus;
  date: string;
  planType: 'individual' | 'float';
  businessType: 'new' | 'portability';
};

export type Policy = {
  id: number;
  customer: string;
  policyId: string;
  product: string;
  premium: number;
  status: string;
  type: string;
  date: string;
};

export type Renewal = {
  id: number;
  customer: string;
  renewalPolicyId: string;
  productCode: string;
  renewalQuoteId: string;
  expiryDate: string;
  /** Human label — 'Today', 'Tomorrow' or 'N days'. */
  expiringWithin: string;
  renewalPremium: number;
  status: RenewalStatus;
  product: string;
};

export type Draft = {
  id: number;
  customer: string;
  quoteId: string;
  product: string;
  premium: string;
  createdOn: string;
  lastOpened: string;
};

export const statusColor = (status: string): AccentColor => {
  switch (status) {
    case 'Accepted':
    case 'Paid':
    case 'Issued':
    case 'Payment Received':
      return 'lime';
    case 'Rejected':
    case 'Payment Rejected':
      return 'red';
    case 'Awaiting':
    case 'Pending':
    case 'Payment Pending':
    case 'Payment Due':
      return 'orange';
    case 'Underwriting':
      return 'blue';
    default:
      return 'neutral';
  }
};

/** 'Today' → 0, 'Tomorrow' → 1, 'N days' → N. Anything else sorts last. */
export const parseExpiringDays = (label: string): number => {
  const normalized = label.trim().toLowerCase();
  if (normalized === 'today') {
    return 0;
  }
  if (normalized === 'tomorrow') {
    return 1;
  }
  const match = normalized.match(/^(\d+)\s*days?$/);
  return match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
};

/** Urgency bands from the web: red ≤7 days, orange ≤14, blue beyond. */
export const expiringWithinColor = (label: string): AccentColor => {
  const days = parseExpiringDays(label);
  if (days <= 7) {
    return 'red';
  }
  if (days <= 14) {
    return 'orange';
  }
  return 'blue';
};

export const QUOTES: Quote[] = [
  { id: 1, customer: 'Rakesh Kumar', quoteId: 'QT123452', product: '2 Wheeler - Individual', premium: 21000, date: '07/01/26', status: 'Accepted', planType: 'individual', subPlan: 'gold', sumInsured: '200000', dob: '1985-02-11' },
  { id: 2, customer: 'Rakesh Kumar', quoteId: 'QT123453', product: '2 Wheeler - Float', premium: 24000, date: '07/01/26', status: 'Rejected', planType: 'float', subPlan: 'gold', sumInsured: '500000', dob: '1985-02-11' },
  { id: 3, customer: 'Rakesh Kumar', quoteId: 'QT123454', product: 'Health Guard - Individual', premium: 31000, date: '07/01/26', status: 'Awaiting', planType: 'individual', subPlan: 'gold', sumInsured: '1000000', dob: '1985-02-11' },
  { id: 4, customer: 'Priya Sharma', quoteId: 'QT123455', product: 'Private car - Comprehensive', premium: 19000, date: '07/01/26', status: 'Accepted', planType: 'individual', subPlan: 'gold', sumInsured: '500000', dob: '1990-05-15' },
  { id: 5, customer: 'Priya Sharma', quoteId: 'QT123456', product: 'Private car - Comprehensive', premium: 11000, date: '08/01/26', status: 'Awaiting', planType: 'float', subPlan: 'gold', sumInsured: '300000', dob: '1990-05-15' },
  { id: 6, customer: 'Rohit Sharma', quoteId: 'QT223452', product: 'Private car - Comprehensive', premium: 14000, date: '08/01/26', status: 'Accepted', planType: 'float', subPlan: 'gold', sumInsured: '750000', dob: '1988-10-20' },
  { id: 7, customer: 'Anurag Jain', quoteId: 'QT123457', product: 'Health Guard - Floater', premium: 27500, date: '09/01/26', status: 'Accepted', planType: 'float', subPlan: 'platinum', sumInsured: '1500000', dob: '1982-07-04' },
  { id: 8, customer: 'Shalini Kumar', quoteId: 'QT123458', product: '2 Wheeler - Comprehensive', premium: 9800, date: '09/01/26', status: 'Awaiting', planType: 'individual', subPlan: 'silver', sumInsured: '200000', dob: '1994-11-30' },
  { id: 9, customer: 'Mayank Agrawal', quoteId: 'QT123459', product: 'Private car - Third Party', premium: 7400, date: '10/01/26', status: 'Rejected', planType: 'individual', subPlan: 'silver', sumInsured: '300000', dob: '1991-03-22' },
  { id: 10, customer: 'Neha Gupta', quoteId: 'QT123460', product: 'Health Guard - Individual', premium: 33500, date: '10/01/26', status: 'Accepted', planType: 'individual', subPlan: 'platinum', sumInsured: '2000000', dob: '1987-09-09' },
  { id: 11, customer: 'Vikram Singh', quoteId: 'QT123461', product: 'Private car - Comprehensive', premium: 22400, date: '11/01/26', status: 'Accepted', planType: 'float', subPlan: 'gold', sumInsured: '500000', dob: '1979-12-18' },
  { id: 12, customer: 'Kavita Joshi', quoteId: 'QT123462', product: '2 Wheeler - OD only', premium: 6300, date: '11/01/26', status: 'Awaiting', planType: 'individual', subPlan: 'silver', sumInsured: '150000', dob: '1996-01-27' },
  { id: 13, customer: 'Rohan Desai', quoteId: 'QT123463', product: 'Health Guard - Floater', premium: 29900, date: '12/01/26', status: 'Accepted', planType: 'float', subPlan: 'gold', sumInsured: '1000000', dob: '1984-06-12' },
  { id: 14, customer: 'Anita Verma', quoteId: 'QT123464', product: '2 Wheeler - Comprehensive', premium: 10600, date: '12/01/26', status: 'Rejected', planType: 'float', subPlan: 'silver', sumInsured: '200000', dob: '1993-04-05' },
  { id: 15, customer: 'Suresh Iyer', quoteId: 'QT123465', product: 'Private car - Comprehensive', premium: 18700, date: '13/01/26', status: 'Accepted', planType: 'individual', subPlan: 'gold', sumInsured: '600000', dob: '1981-08-16' },
  { id: 16, customer: 'Meera Nair', quoteId: 'QT323452', product: 'Health Guard - Individual', premium: 25300, date: '13/01/26', status: 'Awaiting', planType: 'float', subPlan: 'gold', sumInsured: '300000', dob: '1989-02-02' },
  { id: 17, customer: 'Deepak Rao', quoteId: 'QT423452', product: 'Private car - Comprehensive', premium: 16900, date: '14/01/26', status: 'Awaiting', planType: 'float', subPlan: 'silver', sumInsured: '400000', dob: '1986-10-25' },
];

export const PROPOSALS: Proposal[] = [
  { id: 1, customer: 'Priya Sharma', proposalId: 'AEF12', product: '2 Wheeler - OD only', premium: 21000, status: 'Payment Received', date: '07/01/26', planType: 'individual', businessType: 'new' },
  { id: 2, customer: 'Anurag Jain', proposalId: 'AEF13', product: '2 Wheeler - Comprehensive', premium: 24000, status: 'Payment Rejected', date: '07/01/26', planType: 'float', businessType: 'portability' },
  { id: 3, customer: 'Shalini Kumar', proposalId: 'AEF124', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Pending', date: '07/01/26', planType: 'individual', businessType: 'new' },
  { id: 4, customer: 'Mayank Agrawal', proposalId: 'AEF125', product: 'Health Guard - Individual', premium: 31000, status: 'Underwriting', date: '08/01/26', planType: 'float', businessType: 'new' },
  { id: 5, customer: 'Neha Gupta', proposalId: 'AEF126', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Received', date: '08/01/26', planType: 'individual', businessType: 'portability' },
  { id: 6, customer: 'Vikram Singh', proposalId: 'AEF127', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Rejected', date: '09/01/26', planType: 'float', businessType: 'new' },
  { id: 7, customer: 'Kavita Joshi', proposalId: 'AEF128', product: 'Health Guard - Individual', premium: 31000, status: 'Underwriting', date: '09/01/26', planType: 'individual', businessType: 'new' },
  { id: 8, customer: 'Rohan Desai', proposalId: 'AEF129', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Pending', date: '10/01/26', planType: 'float', businessType: 'portability' },
  { id: 9, customer: 'Anita Verma', proposalId: 'AEF1210', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Pending', date: '10/01/26', planType: 'individual', businessType: 'new' },
  { id: 10, customer: 'Suresh Iyer', proposalId: 'AEF1211', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Received', date: '11/01/26', planType: 'float', businessType: 'new' },
  { id: 11, customer: 'Meera Nair', proposalId: 'AEF1212', product: 'Health Guard - Individual', premium: 31000, status: 'Underwriting', date: '11/01/26', planType: 'individual', businessType: 'portability' },
  { id: 12, customer: 'Deepak Rao', proposalId: 'AEF1213', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Pending', date: '12/01/26', planType: 'float', businessType: 'new' },
  { id: 13, customer: 'Pooja Shah', proposalId: 'AEF1214', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Pending', date: '12/01/26', planType: 'individual', businessType: 'new' },
  { id: 14, customer: 'Arjun Mehta', proposalId: 'AEF1215', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Received', date: '13/01/26', planType: 'float', businessType: 'portability' },
];

export const POLICIES: Policy[] = [
  { id: 1, customer: 'Rajesh Chaurasia', policyId: 'BF010Y1', product: '2 Wheeler - OD only', premium: 21000, status: 'Paid', type: 'Individual', date: '07/01/26' },
  { id: 2, customer: 'Priya Sharma', policyId: 'BF010Y2', product: '2 Wheeler - Comprehensive', premium: 24000, status: 'Rejected', type: 'Floater', date: '07/01/26' },
  { id: 3, customer: 'Vijay Raj', policyId: 'BF010Y3', product: 'Health Guard - Individual', premium: 31000, status: 'Pending', type: 'Floater', date: '07/01/26' },
  { id: 4, customer: 'Anurag Jain', policyId: 'BF010Y4', product: 'Health Guard - Individual', premium: 31000, status: 'Underwriting', type: 'Individual', date: '08/01/26' },
  { id: 5, customer: 'Shalini Kumar', policyId: 'BF010Y5', product: 'Health Guard - Individual', premium: 31000, status: 'Paid', type: 'Individual', date: '08/01/26' },
  { id: 6, customer: 'Mayank Agrawal', policyId: 'BF010Y6', product: 'Health Guard - Individual', premium: 31000, status: 'Rejected', type: 'Individual', date: '09/01/26' },
  { id: 7, customer: 'Neha Gupta', policyId: 'BF010Y7', product: 'Health Guard - Individual', premium: 31000, status: 'Underwriting', type: 'Individual', date: '09/01/26' },
  { id: 8, customer: 'Vikram Singh', policyId: 'BF010Y8', product: 'Health Guard - Individual', premium: 31000, status: 'Pending', type: 'Individual', date: '10/01/26' },
  { id: 9, customer: 'Kavita Joshi', policyId: 'BF010Y9', product: 'Private car - Comprehensive', premium: 42000, status: 'Pending', type: 'Individual', date: '10/01/26' },
  { id: 10, customer: 'Rohan Desai', policyId: 'BF010Y10', product: 'Health Guard - Individual', premium: 19800, status: 'Paid', type: 'Individual', date: '11/01/26' },
  { id: 11, customer: 'Anita Verma', policyId: 'BF010Y11', product: '2 Wheeler - Comprehensive', premium: 25600, status: 'Underwriting', type: 'Individual', date: '11/01/26' },
  { id: 12, customer: 'Suresh Iyer', policyId: 'BF010Y12', product: 'Health Guard - Individual', premium: 29500, status: 'Pending', type: 'Floater', date: '12/01/26' },
  { id: 13, customer: 'Meera Nair', policyId: 'BF010Y13', product: 'Private car - Comprehensive', premium: 28900, status: 'Pending', type: 'Floater', date: '12/01/26' },
  { id: 14, customer: 'Deepak Rao', policyId: 'BF010Y14', product: '2 Wheeler - OD only', premium: 21500, status: 'Paid', type: 'Floater', date: '13/01/26' },
  { id: 15, customer: 'Pooja Shah', policyId: 'BF010Y15', product: 'Health Guard - Individual', premium: 30100, status: 'Issued', type: 'Individual', date: '13/01/26' },
];

export const RENEWALS: Renewal[] = [
  { id: 1, customer: 'Rakesh Kumar', renewalPolicyId: 'RN123452', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728387', expiryDate: '23/05/2026', expiringWithin: 'Today', renewalPremium: 21000, status: 'Accepted', product: 'Health Guard - Individual' },
  { id: 2, customer: 'Priya Sharma', renewalPolicyId: 'RN123453', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728388', expiryDate: '24/05/2026', expiringWithin: 'Tomorrow', renewalPremium: 24000, status: 'Payment Due', product: 'Health Guard - Floater' },
  { id: 3, customer: 'Amit Patel', renewalPolicyId: 'RN123454', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728389', expiryDate: '30/05/2026', expiringWithin: '7 days', renewalPremium: 31000, status: 'Rejected', product: 'Health Guard - Floater' },
  { id: 4, customer: 'Neha Gupta', renewalPolicyId: 'RN123455', productCode: 'Private Car', renewalQuoteId: 'QT - 28686-8728390', expiryDate: '28/05/2026', expiringWithin: '5 days', renewalPremium: 18500, status: 'Not Started', product: 'Private Car - Comprehensive' },
  { id: 5, customer: 'Vikram Singh', renewalPolicyId: 'RN123456', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728391', expiryDate: '02/06/2026', expiringWithin: '10 days', renewalPremium: 22000, status: 'Accepted', product: 'Health Guard - Individual' },
  { id: 6, customer: 'Arjun Mehta', renewalPolicyId: 'RN123458', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728393', expiryDate: '22/06/2026', expiringWithin: '30 days', renewalPremium: 35000, status: 'Accepted', product: 'Health Guard - Floater' },
  { id: 7, customer: 'Kavita Joshi', renewalPolicyId: 'RN123459', productCode: 'Private Car', renewalQuoteId: 'QT - 28686-8728394', expiryDate: '21/08/2026', expiringWithin: '90 days', renewalPremium: 42000, status: 'Not Started', product: 'Private Car - Comprehensive' },
  { id: 8, customer: 'Rohan Desai', renewalPolicyId: 'RN123460', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728395', expiryDate: '26/05/2026', expiringWithin: '3 days', renewalPremium: 19800, status: 'Rejected', product: 'Health Guard - Individual' },
  { id: 9, customer: 'Anita Verma', renewalPolicyId: 'RN123461', productCode: '2 Wheeler - Comprehensive', renewalQuoteId: 'QT - 28686-8728396', expiryDate: '04/06/2026', expiringWithin: '12 days', renewalPremium: 25600, status: 'Accepted', product: '2 Wheeler - Comprehensive' },
  { id: 10, customer: 'Suresh Iyer', renewalPolicyId: 'RN123462', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728397', expiryDate: '15/06/2026', expiringWithin: '25 days', renewalPremium: 29500, status: 'Not Started', product: 'Health Guard - Floater' },
  { id: 11, customer: 'Meera Nair', renewalPolicyId: 'RN123463', productCode: 'Private Car', renewalQuoteId: 'QT - 28686-8728398', expiryDate: '22/07/2026', expiringWithin: '60 days', renewalPremium: 28900, status: 'Accepted', product: 'Private Car - Comprehensive' },
  { id: 12, customer: 'Deepak Rao', renewalPolicyId: 'RN123464', productCode: '2 Wheeler - OD Only', renewalQuoteId: 'QT - 28686-8728399', expiryDate: '31/05/2026', expiringWithin: '8 days', renewalPremium: 21500, status: 'Not Started', product: '2 Wheeler - OD only' },
  { id: 13, customer: 'Pooja Shah', renewalPolicyId: 'RN123465', productCode: 'Health Guard Policy', renewalQuoteId: 'QT - 28686-8728400', expiryDate: '13/06/2026', expiringWithin: '21 days', renewalPremium: 30100, status: 'Accepted', product: 'Health Guard - Individual' },
];

export const DRAFTS: Draft[] = [
  { id: 1, customer: 'Priya Sharma', quoteId: 'QT123455', product: '2 Wheeler - OD only', premium: 'Rs. 21,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
  { id: 2, customer: 'Anurag Jain', quoteId: 'QT123456', product: '2 Wheeler - Comprehensive', premium: 'Rs. 24,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
  { id: 3, customer: 'Shalini Kumar', quoteId: 'QT123457', product: 'Health Guard - Individual', premium: 'Rs. 31,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
  { id: 4, customer: 'Mayank Agrawal', quoteId: 'QT123458', product: 'Private car - Comprehensive', premium: 'Rs. 19,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
];
