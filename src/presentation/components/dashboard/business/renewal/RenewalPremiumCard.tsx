import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CaretDown } from 'phosphor-react-native';
import { colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { ADDON_UNIT_PREMIUM, PREMIUM_FIXTURE, formatRupees } from './renewalData';

interface RenewalPremiumCardProps {
  /** Number of add-ons selected across the policy. */
  addOnCount?: number;
  /** Cross-sell policies the agent ticked on the "Eligible add-on policies" card. */
  addonPolicies?: { title: string; premium: number }[];
  /** Render expanded on mount (used on the payment step, where it's the focus). */
  defaultExpanded?: boolean;
}

const Row: React.FC<{ label: string; value: string; valueStyle?: object }> = ({ label, value, valueStyle }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
  </View>
);

/**
 * Renewal Premium Details.
 *
 * The web app pins this as a sticky right-hand column beside every step. There
 * is no side column on a phone, so it sits under the step content as a
 * collapsible card: collapsed it still shows the renewal premium total, and
 * expanding reveals the full breakdown.
 */
export const RenewalPremiumCard: React.FC<RenewalPremiumCardProps> = ({
  addOnCount = 3,
  addonPolicies = [],
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Mirrors the web card: only the cross-sell policies move the total; the
  // add-on line is a display figure over the fixed base renewal premium.
  const crossSellPremium = addonPolicies.reduce((sum, p) => sum + p.premium, 0);
  const renewalPremium = PREMIUM_FIXTURE.baseRenewalPremium + crossSellPremium;

  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Renewal Premium Details"
          accessibilityState={{ expanded }}
        >
          {/* Background-only gradient — on iOS it paints over its own children. */}
          <View style={styles.header}>
            <LinearGradient colors={['#EFF6FF', '#DBEAFE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.heading}>Renewal Premium Details</Text>
            <View style={expanded ? styles.caretOpen : undefined}>
              <CaretDown size={18} color={colors.textBody} />
            </View>
          </View>
        </Pressable>

        {expanded ? (
          <View style={styles.body}>
            <View style={styles.currentBox}>
              <Row
                label="Current Premium:"
                value={formatRupees(PREMIUM_FIXTURE.currentPremium)}
                valueStyle={styles.strongValue}
              />
              <Row
                label="Sum Insured"
                value={formatRupees(PREMIUM_FIXTURE.sumInsured)}
                valueStyle={styles.strongValue}
              />
            </View>

            <View style={styles.lines}>
              <Row label="Base premium" value={formatRupees(PREMIUM_FIXTURE.basePremium)} />
              <Row label={`Total Add ons (${addOnCount})`} value={formatRupees(addOnCount * ADDON_UNIT_PREMIUM)} />
            </View>

            {addonPolicies.length > 0 ? (
              <View style={styles.group}>
                <Text style={styles.groupTitle}>Add-on policies</Text>
                {addonPolicies.map((p) => (
                  <Row key={p.title} label={p.title} value={formatRupees(p.premium)} />
                ))}
              </View>
            ) : null}

            <View style={styles.group}>
              <Row label="Discount" value={`-${formatRupees(PREMIUM_FIXTURE.discount)}`} valueStyle={styles.discount} />
              <Row label="Central GST" value={String(PREMIUM_FIXTURE.centralGst)} />
              <Row label="State GST" value={String(PREMIUM_FIXTURE.stateGst)} />
            </View>
          </View>
        ) : null}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Renewal Premium</Text>
          <Text style={styles.totalValue}>{formatRupees(renewalPremium)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, ...shadow.lg },
  inner: { borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.lg, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, gap: spacing.sm },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '500', color: colors.textHeading, flexShrink: 1 },
  // A static flip is enough to signal state here (the DS Accordion caret does
  // the same rather than animating).
  caretOpen: { transform: [{ rotate: '180deg' }] },
  body: { padding: spacing.lg, gap: spacing.lg },
  currentBox: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  lines: { gap: spacing.md },
  group: { borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.sm, gap: spacing.md },
  groupTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 12, fontWeight: '500', color: colors.textBody },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  rowLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody, flexShrink: 1 },
  rowValue: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  strongValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 24, fontWeight: '500' },
  discount: { color: '#4D7C0F' },
  total: {
    backgroundColor: '#059669',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  totalLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textOnBrand },
  totalValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 22, fontWeight: '500', color: colors.textOnBrand },
});
