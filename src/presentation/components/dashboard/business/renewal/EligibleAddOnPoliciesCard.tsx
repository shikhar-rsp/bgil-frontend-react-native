import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Checkbox, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { ELIGIBLE_ADDON_POLICIES, formatRupees } from './renewalData';

interface EligibleAddOnPoliciesCardProps {
  selectedEligible: string[];
  onToggle: (id: string) => void;
}

/**
 * Cross-sell "Eligible add-on policies" card, shown below the add-ons, nominee
 * and proposer sections of a renewal. Selection is owned by the parent so the
 * same choices flow through to the premium summary.
 */
export const EligibleAddOnPoliciesCard: React.FC<EligibleAddOnPoliciesCardProps> = ({
  selectedEligible,
  onToggle,
}) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.heading}>Eligible add-on policies</Text>
      <Text style={styles.sub}>
        Based on the customer's profile and existing policy details, these policies may be relevant for cross-sell.
      </Text>
    </View>

    {ELIGIBLE_ADDON_POLICIES.map((p) => {
      const selected = selectedEligible.includes(p.id);
      return (
        <View key={p.id} style={styles.policy}>
          <View style={styles.policyTop}>
            <View style={[styles.iconBox, { backgroundColor: p.iconBg }]}>
              <p.Icon size={20} color="#FFFFFF" weight="fill" />
            </View>
            <Checkbox size="sm" checked={selected} onChange={() => onToggle(p.id)} label="Add to purchase" />
          </View>

          <View style={styles.policyMeta}>
            <Text style={styles.policyTitle}>{p.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>
                Per year: <Text style={styles.metaValue}>{p.perYear}</Text>
              </Text>
              <Text style={styles.metaLabel}>
                Policy period: <Text style={styles.metaValue}>{p.period}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.premiumBlock}>
            <Text style={styles.metaLabel}>Total premium:</Text>
            <Text style={styles.premiumValue}>{formatRupees(p.premium)}</Text>
          </View>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  header: { gap: spacing.xs },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  sub: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  policy: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  policyTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  iconBox: { width: 32, height: 32, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  policyMeta: { gap: 2 },
  policyTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 24, fontWeight: '500', color: colors.textHeading },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xxs },
  metaLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
  metaValue: { color: colors.textHeading },
  premiumBlock: { gap: 2 },
  premiumValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 24, fontWeight: '500', color: '#15803D' },
});
