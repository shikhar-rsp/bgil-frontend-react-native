import React from 'react';
import { ArrowsClockwise, ShareNetwork, Eye, Phone } from 'phosphor-react-native';
import { colors, type TableColumn } from '@atlas-ds/react-native';
import { ActionMenu } from '../../common/ActionMenu';
import { RecordTable, StatusCell, TextCell } from './RecordTable';
import { type SearchStatus } from './ListEmptyState';
import { statusColor, expiringWithinColor, type Renewal } from '../businessData';

interface RenewalsListProps {
  data: Renewal[];
  searchStatus: SearchStatus;
  isSourceEmpty: boolean;
  onRenew: (r: Renewal) => void;
  onShareNotice: (r: Renewal) => void;
  onViewPolicy: (r: Renewal) => void;
  onCallCustomer: (r: Renewal) => void;
}

const ICON = 18;

export const RenewalsList: React.FC<RenewalsListProps> = ({
  data,
  searchStatus,
  isSourceEmpty,
  onRenew,
  onShareNotice,
  onViewPolicy,
  onCallCustomer,
}) => {
  const columns: TableColumn<Renewal>[] = [
    { key: 'customer', header: 'Customer', width: 150, render: (r) => <TextCell strong value={r.customer} /> },
    { key: 'renewalPolicyId', header: 'Renewal Policy ID', width: 150, render: (r) => <TextCell value={r.renewalPolicyId} /> },
    { key: 'productCode', header: 'Product', width: 200, render: (r) => <TextCell value={r.productCode} /> },
    {
      key: 'renewalPremium',
      header: 'Renewal Premium',
      width: 150,
      align: 'right',
      render: (r) => <TextCell strong align="right" value={`₹ ${r.renewalPremium.toLocaleString('en-IN')}`} />,
    },
    // Renewal expiry carries a 4-digit year, so it needs more room than the
    // DD/MM/YY dates on the other tabs.
    { key: 'expiryDate', header: 'Expiry Date', width: 140, render: (r) => <TextCell value={r.expiryDate} /> },
    {
      key: 'expiringWithin',
      header: 'Expiring Within',
      width: 130,
      align: 'center',
      render: (r) => <StatusCell label={r.expiringWithin} color={expiringWithinColor(r.expiringWithin)} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: 130,
      align: 'center',
      render: (r) => <StatusCell label={r.status} color={statusColor(r.status)} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 88,
      align: 'center',
      render: (r) => (
        <ActionMenu
          items={[
            { key: 'renew', label: 'Renew Policy', icon: <ArrowsClockwise size={ICON} color={colors.textBody} />, onPress: () => onRenew(r) },
            { key: 'share', label: 'Share Renewal Notice', icon: <ShareNetwork size={ICON} color={colors.textBody} />, onPress: () => onShareNotice(r) },
            { key: 'view', label: 'View Policy', icon: <Eye size={ICON} color={colors.textBody} />, onPress: () => onViewPolicy(r) },
            { key: 'call', label: 'Call Customer', icon: <Phone size={ICON} color={colors.textBody} />, onPress: () => onCallCustomer(r) },
          ]}
        />
      ),
    },
  ];

  return (
    <RecordTable
      columns={columns}
      data={data}
      rowKey="id"
      noun="renewals"
      searchStatus={searchStatus}
      isSourceEmpty={isSourceEmpty}
      onRowPress={onViewPolicy}
    />
  );
};
