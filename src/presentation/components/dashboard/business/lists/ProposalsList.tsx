import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Trash, PencilSimple } from 'phosphor-react-native';
import { colors } from '@atlas-ds/react-native';
import { RowActionMenu } from './RowActionMenu';
import { RecordCard } from './RecordCard';
import { ListEmptyState, type SearchStatus } from './ListEmptyState';
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
}) => (
  <FlatList
    data={data}
    keyExtractor={(p) => String(p.id)}
    scrollEnabled={false}
    ItemSeparatorComponent={() => <View style={styles.sep} />}
    ListEmptyComponent={
      <ListEmptyState status={searchStatus} noun="proposals" showCreate={isSourceEmpty} onCreateQuote={onCreateQuote} />
    }
    renderItem={({ item }) => (
      <RecordCard
        title={item.customer}
        subtitle={`${item.proposalId} · ${item.product}`}
        amount={`₹ ${item.premium.toLocaleString('en-IN')}`}
        meta={item.businessType === 'new' ? 'New' : 'Portability'}
        status={item.status}
        statusColor={statusColor(item.status)}
        menu={
          <RowActionMenu
            items={[
              { key: 'delete', label: 'Delete', icon: <Trash size={ICON} color={colors.textBody} />, onPress: () => onDelete(item) },
              { key: 'edit', label: 'Edit Proposal', icon: <PencilSimple size={ICON} color={colors.textBody} />, onPress: () => onEdit(item) },
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
