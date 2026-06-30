import type { AccentColor } from '@atlas-ds/react-native';

/** Mock business data (ported from the web tab components' fixtures). */

export type QuoteStatus = 'Accepted' | 'Rejected' | 'Awaiting';

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
};

export type Proposal = {
  id: number;
  customer: string;
  proposalId: string;
  underwriting: boolean;
  product: string;
  premium: string;
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
      return 'lime';
    case 'Rejected':
      return 'red';
    case 'Awaiting':
      return 'orange';
    default:
      return 'neutral';
  }
};

export const QUOTES: Quote[] = [
  { id: 1, customer: 'Rakesh Kumar', quoteId: 'QT123452', product: '2 Wheeler - Individual', premium: 21000, date: '07/01/26', status: 'Accepted', planType: 'individual', subPlan: 'gold', sumInsured: '200000', dob: '1985-02-11' },
  { id: 2, customer: 'Rakesh Kumar', quoteId: 'QT123453', product: '2 Wheeler - Float', premium: 24000, date: '07/01/26', status: 'Rejected', planType: 'float', subPlan: 'gold', sumInsured: '500000', dob: '1985-02-11' },
  { id: 3, customer: 'Rakesh Kumar', quoteId: 'QT123454', product: 'Health Guard - Individual', premium: 31000, date: '07/01/26', status: 'Awaiting', planType: 'individual', subPlan: 'gold', sumInsured: '1000000', dob: '1985-02-11' },
  { id: 4, customer: 'Priya Sharma', quoteId: 'QT123455', product: 'Private car - Comprehensive', premium: 19000, date: '07/01/26', status: 'Accepted', planType: 'individual', subPlan: 'gold', sumInsured: '500000', dob: '1990-05-15' },
  { id: 5, customer: 'Priya Sharma', quoteId: 'QT123456', product: 'Private car - Comprehensive', premium: 11000, date: '07/01/26', status: 'Awaiting', planType: 'float', subPlan: 'gold', sumInsured: '300000', dob: '1990-05-15' },
  { id: 6, customer: 'Rohit Sharma', quoteId: 'QT223452', product: 'Private car - Comprehensive', premium: 14000, date: '07/01/26', status: 'Accepted', planType: 'float', subPlan: 'gold', sumInsured: '750000', dob: '1988-10-20' },
];

export const PROPOSALS: Proposal[] = [
  { id: 1, customer: 'Priya Sharma', proposalId: 'PR123455', underwriting: true, product: '2 Wheeler - OD only', premium: 'Rs. 21,000', date: '07/01/26', planType: 'individual', businessType: 'new' },
  { id: 2, customer: 'Anurag Jain', proposalId: 'PR123456', underwriting: true, product: '2 Wheeler - Comprehensive', premium: 'Rs. 24,000', date: '07/01/26', planType: 'float', businessType: 'portability' },
  { id: 3, customer: 'Shalini Kumar', proposalId: 'PR123457', underwriting: false, product: 'Health Guard - Individual', premium: 'Rs. 31,000', date: '07/01/26', planType: 'individual', businessType: 'new' },
  { id: 4, customer: 'Mayank Agrawal', proposalId: 'PR123458', underwriting: false, product: 'Private car - Comprehensive', premium: 'Rs. 19,000', date: '07/01/26', planType: 'float', businessType: 'new' },
];

export const POLICIES: Policy[] = [
  { id: 1, customer: 'Rajesh Chaurasia', policyId: 'PL983771', product: 'Health Guard - Individual', premium: 31000, status: 'Payment Received', type: 'Individual', date: '07/01/26' },
  { id: 2, customer: 'Priya Sharma', policyId: 'PL983772', product: 'Private car - Comprehensive', premium: 19000, status: 'Issued', type: 'Individual', date: '07/01/26' },
  { id: 3, customer: 'Vijay Raj', policyId: 'PL983773', product: 'Health Guard - Individual', premium: 11000, status: 'Issued', type: 'Float', date: '07/01/26' },
];

export const DRAFTS: Draft[] = [
  { id: 1, customer: 'Priya Sharma', quoteId: 'QT123455', product: '2 Wheeler - OD only', premium: 'Rs. 21,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
  { id: 2, customer: 'Anurag Jain', quoteId: 'QT123456', product: '2 Wheeler - Comprehensive', premium: 'Rs. 24,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
  { id: 3, customer: 'Shalini Kumar', quoteId: 'QT123457', product: 'Health Guard - Individual', premium: 'Rs. 31,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
  { id: 4, customer: 'Mayank Agrawal', quoteId: 'QT123458', product: 'Private car - Comprehensive', premium: 'Rs. 19,000', createdOn: '07/01/26', lastOpened: '07/01/26' },
];
