import React from 'react';
import { Trash, PencilSimple } from 'phosphor-react-native';
import { colors, type TableColumn } from '@atlas-ds/react-native';
import { ActionMenu } from '../../common/ActionMenu';
import { RecordTable, StatusCell, TextCell } from './RecordTable';
import { type SearchStatus } from './ListEmptyState';
import { statusColor, type Proposal } from '../businessData';

interface ProposalsListProps {
  data: Proposal[];
  searchStatus: SearchStatus;
  isSourceEmpty: boolean;
  onCreateQuote?: () => void;
  onDelete: (p: Proposal) => void;
  onEdit: (p: Proposal) => void;
}

const ICON = 18;

export const ProposalsList: React.FC<ProposalsListProps> = ({
  data,
  searchStatus,
  isSourceEmpty,
  onCreateQuote,
  onDelete,
  onEdit,
}) => {
  const columns: TableColumn<Proposal>[] = [
    { key: 'customer', header: 'Customer', width: 150, align: 'center', render: (p) => <TextCell strong value={p.customer} /> },
    { key: 'proposalId', header: 'Proposal ID', width: 130, align: 'center', render: (p) => <TextCell value={p.proposalId} /> },
    { key: 'product', header: 'Product', width: 200, align: 'center', render: (p) => <TextCell value={p.product} /> },
    {
      key: 'premium',
      header: 'Premium',
      width: 120,
      align: 'center',
      render: (p) => <TextCell strong value={`₹ ${p.premium.toLocaleString('en-IN')}`} />,
    },
    {
      key: 'businessType',
      header: 'Business Type',
      width: 130,
      align: 'center',
      render: (p) => <TextCell value={p.businessType === 'new' ? 'New' : 'Portability'} />,
    },
    { key: 'date', header: 'Date', width: 120, align: 'center', render: (p) => <TextCell value={p.date} /> },
    {
      key: 'status',
      header: 'Status',
      width: 160,
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
            { key: 'delete', label: 'Delete', icon: <Trash size={ICON} color={colors.textBody} />, onPress: () => onDelete(p) },
            { key: 'edit', label: 'Edit Proposal', icon: <PencilSimple size={ICON} color={colors.textBody} />, onPress: () => onEdit(p) },
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
      noun="proposals"
      searchStatus={searchStatus}
      isSourceEmpty={isSourceEmpty}
      onCreateQuote={onCreateQuote}
    />
  );
};
