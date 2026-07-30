import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { DownloadSimple, ShareNetwork, NotePencil } from 'phosphor-react-native';
import { colors } from '@atlas-ds/react-native';
import { ActionMenu } from '../../common/ActionMenu';
import { RecordCard } from './RecordCard';
import { ListEmptyState, type SearchStatus } from './ListEmptyState';
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
  onEndorsement: (p: Policy) => void;
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
  onEndorsement,
}) => (
  <FlatList
    data={data}
    keyExtractor={(p) => String(p.id)}
    scrollEnabled={false}
    ItemSeparatorComponent={() => <View style={styles.sep} />}
    ListEmptyComponent={
      <ListEmptyState status={searchStatus} noun="policies" showCreate={isSourceEmpty} onCreateQuote={onCreateQuote} />
    }
    renderItem={({ item }) => (
      <RecordCard
        title={item.customer}
        subtitle={`${item.policyId} · ${item.product}`}
        amount={`₹ ${item.premium.toLocaleString('en-IN')}`}
        meta={item.type}
        status={item.status}
        statusColor={statusColor(item.status)}
        onPress={() => onView(item)}
        menu={
          <ActionMenu
            items={[
              { key: 'download', label: 'Download', icon: <DownloadSimple size={ICON} color={colors.textBody} />, onPress: () => onDownload(item) },
              { key: 'share', label: 'Share', icon: <ShareNetwork size={ICON} color={colors.textBody} />, onPress: () => onShare(item) },
              { key: 'endorsement', label: 'Endorsement', icon: <NotePencil size={ICON} color={colors.textBody} />, onPress: () => onEndorsement(item) },
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
