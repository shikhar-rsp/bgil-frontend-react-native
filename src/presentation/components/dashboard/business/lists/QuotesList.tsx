import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Copy, Trash, PencilSimple, FileText } from 'phosphor-react-native';
import { colors } from '@atlas-ds/react-native';
import { RowActionMenu } from './RowActionMenu';
import { RecordCard } from './RecordCard';
import { ListEmptyState, type SearchStatus } from './ListEmptyState';
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
}) => (
  <FlatList
    data={data}
    keyExtractor={(q) => String(q.id)}
    scrollEnabled={false}
    ItemSeparatorComponent={() => <View style={styles.sep} />}
    ListEmptyComponent={
      <ListEmptyState status={searchStatus} noun="quotes" showCreate={isSourceEmpty} onCreateQuote={onCreateQuote} />
    }
    renderItem={({ item }) => (
      <RecordCard
        title={item.customer}
        subtitle={`${item.quoteId} · ${item.product}`}
        note={item.copiedFrom ? `Copy of ${item.copiedFrom}` : undefined}
        amount={`₹ ${item.premium.toLocaleString('en-IN')}`}
        meta={item.date}
        status={item.status}
        statusColor={statusColor(item.status)}
        menu={
          <RowActionMenu
            items={[
              { key: 'duplicate', label: 'Duplicate', icon: <Copy size={ICON} color={colors.textBody} />, onPress: () => onDuplicate(item) },
              { key: 'delete', label: 'Delete', icon: <Trash size={ICON} color={colors.textBody} />, onPress: () => onDelete(item) },
              { key: 'edit', label: 'Edit Quote', icon: <PencilSimple size={ICON} color={colors.textBody} />, onPress: () => onEdit(item) },
              { key: 'convert', label: 'Convert to Proposal', icon: <FileText size={ICON} color={colors.textBody} />, onPress: () => onConvert(item) },
            ]}
          />
        }
      />
    )}
  />
);

const styles = StyleSheet.create({
  sep: { height: 1, backgroundColor: colors.surfaceMuted },
});
