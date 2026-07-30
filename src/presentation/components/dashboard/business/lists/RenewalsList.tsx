import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ArrowsClockwise, ShareNetwork, Eye, Phone } from 'phosphor-react-native';
import { colors } from '@atlas-ds/react-native';
import { ActionMenu } from '../../common/ActionMenu';
import { RecordCard } from './RecordCard';
import { ListEmptyState, type SearchStatus } from './ListEmptyState';
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
}) => (
  <FlatList
    data={data}
    keyExtractor={(r) => String(r.id)}
    scrollEnabled={false}
    ItemSeparatorComponent={() => <View style={styles.sep} />}
    ListEmptyComponent={<ListEmptyState status={searchStatus} noun="renewals" showCreate={isSourceEmpty} />}
    renderItem={({ item }) => (
      <RecordCard
        title={item.customer}
        subtitle={`${item.renewalPolicyId} · ${item.productCode}`}
        amount={`₹ ${item.renewalPremium.toLocaleString('en-IN')}`}
        meta={`Expires ${item.expiryDate}`}
        tag={item.expiringWithin}
        tagColor={expiringWithinColor(item.expiringWithin)}
        status={item.status}
        statusColor={statusColor(item.status)}
        menu={
          <ActionMenu
            items={[
              { key: 'renew', label: 'Renew Policy', icon: <ArrowsClockwise size={ICON} color={colors.textBody} />, onPress: () => onRenew(item) },
              { key: 'share', label: 'Share Renewal Notice', icon: <ShareNetwork size={ICON} color={colors.textBody} />, onPress: () => onShareNotice(item) },
              { key: 'view', label: 'View Policy', icon: <Eye size={ICON} color={colors.textBody} />, onPress: () => onViewPolicy(item) },
              { key: 'call', label: 'Call Customer', icon: <Phone size={ICON} color={colors.textBody} />, onPress: () => onCallCustomer(item) },
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
