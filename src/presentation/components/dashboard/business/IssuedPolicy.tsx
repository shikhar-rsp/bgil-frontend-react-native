import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DownloadSimple, CheckCircle } from 'phosphor-react-native';
import { Button, Badge, Toast, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { useBottomActionInset } from '../../../hooks/useBottomActionInset';
import type { Policy } from './businessData';

interface IssuedPolicyProps {
  policy: Policy;
  /** Opened from a renewal task's "View": show the expiring banner + badge. */
  expiringSoon?: boolean;
  /** Task-View: lends the screen a Back handler that exits to the Tasks tab. */
  onRegisterBack?: (handler: (() => void) | null) => void;
  onExit?: () => void;
}

/**
 * Issued-policy detail view.
 *
 * No back control of its own: this view always opens with the Business header
 * above it, which already carries one — except in the renewal task-View, where
 * Back exits to the Tasks tab.
 */
export const IssuedPolicy: React.FC<IssuedPolicyProps> = ({ policy, expiringSoon, onRegisterBack, onExit }) => {
  // Nothing is docked below this scroll view, so its own content has to clear
  // the home indicator.
  const paddingBottom = useBottomActionInset();
  const [showExpiring, setShowExpiring] = useState(!!expiringSoon);

  useEffect(() => {
    if (!expiringSoon || !onExit) {
      return;
    }
    onRegisterBack?.(() => onExit());
    return () => onRegisterBack?.(null);
  }, [expiringSoon, onExit, onRegisterBack]);

  return (
  <ScrollView
    contentContainerStyle={[styles.content, { paddingBottom }]}
    showsVerticalScrollIndicator={false}
  >
    {expiringSoon && showExpiring ? (
      <Toast
        variant="error"
        layout="stacked"
        title="Policy is expiring in 7 days! Renew it soon"
        message={`Policy ID 1973937 for ${policy.customer} is expiring soon. Follow up with the customer or send a quick renewal notice ASAP!`}
        onClose={() => setShowExpiring(false)}
      />
    ) : null}

    <View style={styles.banner}>
      {expiringSoon ? null : <CheckCircle size={24} color={colors.success} weight="fill" />}
      <Text style={styles.bannerTitle}>{policy.product} – {policy.type}</Text>
      {expiringSoon ? <Badge variant="light" size="sm" color="red" label="Expiring soon" /> : null}
    </View>

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Policy Details</Text>
      </View>
      <View style={styles.detailGrid}>
        <Detail label="Policy Name" value={policy.product} />
        <Detail label="Plan Type" value={policy.type} />
        <Detail label="Customer" value={policy.customer} />
        <Detail label="Policy Number" value={policy.policyId} />
        <Detail label="Policy Period" value="3 Years" />
        <Detail label="Premium" value={`₹ ${policy.premium.toLocaleString('en-IN')}`} />
      </View>
    </View>

    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>Status</Text>
      <Badge
        variant="light"
        size="sm"
        color={expiringSoon ? 'red' : 'lime'}
        label={expiringSoon ? 'Expiring soon' : policy.status}
      />
    </View>

    <View style={styles.actions}>
      <Button
        label="Download Policy"
        leadingIcon={<DownloadSimple size={18} color={colors.textOnBrand} />}
        onPress={() => undefined}
        fullWidth
      />
    </View>
  </ScrollView>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detail}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandSubtle,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  bannerTitle: { flex: 1, fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  section: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  sectionHeader: { backgroundColor: colors.success, padding: spacing.md },
  sectionHeaderText: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textOnBrand },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: spacing.lg },
  detail: { width: '44%', flexGrow: 1, gap: spacing.xxs },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  detailValue: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  actions: { gap: spacing.md },
});
