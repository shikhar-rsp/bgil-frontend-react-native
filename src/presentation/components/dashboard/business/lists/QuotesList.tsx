import React from 'react';
import { Copy, Trash, PencilSimple, FileText } from 'phosphor-react-native';
import { colors, type TableColumn } from '@atlas-ds/react-native';
import { ActionMenu } from '../../common/ActionMenu';
import { RecordTable, StatusCell, TextCell } from './RecordTable';
import { type SearchStatus } from './ListEmptyState';
import { statusColor, type Quote } from '../businessData';

interface QuotesListProps {
  data: Quote[];
  searchStatus: SearchStatus;
  /** True when the whole data set is empty, not just the filtered view. */
  isSourceEmpty: boolean;
  onCreateQuote?: () => void;
  onDuplicate: (q: Quote) => void;
  onDelete: (q: Quote) => void;
  onEdit: (q: Quote) => void;
  onConvert: (q: Quote) => void;
}

const ICON = 18;

export const QuotesList: React.FC<QuotesListProps> = ({
  data,
  searchStatus,
  isSourceEmpty,
  onCreateQuote,
  onDuplicate,
  onDelete,
  onEdit,
  onConvert,
}) => {
  const columns: TableColumn<Quote>[] = [
    { key: 'customer', header: 'Customer', width: 150, render: (q) => <TextCell strong value={q.customer} /> },
    {
      key: 'quoteId',
      header: 'Quote ID',
      width: 150,
      render: (q) => <TextCell value={q.quoteId} note={q.copiedFrom ? `Copy of ${q.copiedFrom}` : undefined} />,
    },
    { key: 'product', header: 'Product', width: 200, render: (q) => <TextCell value={q.product} /> },
    {
      key: 'premium',
      header: 'Premium',
      width: 120,
      align: 'right',
      render: (q) => <TextCell strong align="right" value={`₹ ${q.premium.toLocaleString('en-IN')}`} />,
    },
    { key: 'date', header: 'Date', width: 120, render: (q) => <TextCell value={q.date} /> },
    {
      key: 'status',
      header: 'Status',
      width: 130,
      align: 'center',
      render: (q) => <StatusCell label={q.status} color={statusColor(q.status)} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 88,
      align: 'center',
      render: (q) => (
        <ActionMenu
          items={[
            { key: 'duplicate', label: 'Duplicate', icon: <Copy size={ICON} color={colors.textBody} />, onPress: () => onDuplicate(q) },
            { key: 'delete', label: 'Delete', icon: <Trash size={ICON} color={colors.textBody} />, onPress: () => onDelete(q) },
            { key: 'edit', label: 'Edit Quote', icon: <PencilSimple size={ICON} color={colors.textBody} />, onPress: () => onEdit(q) },
            { key: 'convert', label: 'Convert to Proposal', icon: <FileText size={ICON} color={colors.textBody} />, onPress: () => onConvert(q) },
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
      noun="quotes"
      searchStatus={searchStatus}
      isSourceEmpty={isSourceEmpty}
      onCreateQuote={onCreateQuote}
    />
  );
};
