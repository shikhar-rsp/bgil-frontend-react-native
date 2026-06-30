import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DownloadSimple, CheckCircle } from 'phosphor-react-native';
import { Button, Badge, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import type { Policy } from './businessData';

interface IssuedPolicyProps {
  policy: Policy;
  onClose: () => void;
}

/** Issued-policy detail view. */
export const IssuedPolicy: React.FC<IssuedPolicyProps> = ({ policy, onClose }) => (
  <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.banner}>
      <CheckCircle size={24} color={colors.success} weight="fill" />
      <Text style={styles.bannerTitle}>{policy.product} – {policy.type}</Text>
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
      <Badge variant="light" size="sm" color="lime" label={policy.status} />
    </View>

    <View style={styles.actions}>
      <Button
        label="Download Policy"
        leadingIcon={<DownloadSimple size={18} color={colors.textOnBrand} />}
        onPress={() => undefined}
        fullWidth
      />
      <Button label="Back" variant="secondaryGray" onPress={onClose} fullWidth />
    </View>
  </ScrollView>
);

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
