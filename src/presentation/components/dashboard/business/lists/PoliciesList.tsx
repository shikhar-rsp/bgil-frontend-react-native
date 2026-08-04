import React from 'react';
import { DownloadSimple, ShareNetwork } from 'phosphor-react-native';
import { colors, type TableColumn } from '@atlas-ds/react-native';
import { ActionMenu } from '../../common/ActionMenu';
import { RecordTable, StatusCell, TextCell } from './RecordTable';
import { type SearchStatus } from './ListEmptyState';
import { statusColor, type Policy } from '../businessData';

interface PoliciesListProps {
  data: Policy[];
  searchStatus: SearchStatus;
  isSourceEmpty: boolean;
  onCreateQuote?: () => void;
  /** Row tap opens the issued-policy detail view. */
  onView: (p: Policy) => void;
  onDownload: (p: Policy) => void;
  onShare: (p: Policy) => void;
}

const ICON = 18;

export const PoliciesList: React.FC<PoliciesListProps> = ({
  data,
  searchStatus,
  isSourceEmpty,
  onCreateQuote,
  onView,
  onDownload,
  onShare,
}) => {
  const columns: TableColumn<Policy>[] = [
    { key: 'customer', header: 'Customer', width: 150, align: 'center', render: (p) => <TextCell strong value={p.customer} /> },
    { key: 'policyId', header: 'Policy ID', width: 130, align: 'center', render: (p) => <TextCell value={p.policyId} /> },
    { key: 'product', header: 'Product', width: 200, align: 'center', render: (p) => <TextCell value={p.product} /> },
    {
      key: 'premium',
      header: 'Premium',
      width: 120,
      align: 'center',
      render: (p) => <TextCell strong value={`₹ ${p.premium.toLocaleString('en-IN')}`} />,
    },
    { key: 'type', header: 'Plan Type', width: 110, align: 'center', render: (p) => <TextCell value={p.type} /> },
    { key: 'date', header: 'Date', width: 120, align: 'center', render: (p) => <TextCell value={p.date} /> },
    {
      key: 'status',
      header: 'Status',
      width: 140,
      align: 'center',
      render: (p) => <StatusCell label={p.status} color={statusColor(p.status)} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 88,
      align: 'center',
      render: (p) => (
        <ActionMenu
          items={[
            { key: 'download', label: 'Download', icon: <DownloadSimple size={ICON} color={colors.textBody} />, onPress: () => onDownload(p) },
            { key: 'share', label: 'Share', icon: <ShareNetwork size={ICON} color={colors.textBody} />, onPress: () => onShare(p) },
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
      noun="policies"
      searchStatus={searchStatus}
      isSourceEmpty={isSourceEmpty}
      onCreateQuote={onCreateQuote}
      onRowPress={onView}
    />
  );
};
