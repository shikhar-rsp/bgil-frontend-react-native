import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Heartbeat } from 'phosphor-react-native';
import {
  Accordion,
  Radio,
  Badge,
  ToastGlobal,
  colors,
  spacing,
  radius,
  typography,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import {
  TENURES,
  computePremium,
  formatLakhs,
  formatRupees,
  type Member,
  type MemberDatum,
} from './healthData';

interface PolicyTenurePremiumProps {
  tenure: string;
  /** Selecting a tenure also recalculates the policy end date (see HealthGuard). */
  onSelectTenure: (value: string) => void;
  subPlan: string;
  planType: string;
  members: Member[];
  memberData: Record<string, MemberDatum>;
  /** Floater's shared sum insured. */
  sumInsured: string;
  oldestMemberDOB: Date | null;
  floaterAddOns: string[];
}

const Row: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <View style={styles.premiumRow}>
    <Text style={styles.premiumLabel}>{label}</Text>
    <Text style={[styles.premiumValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

/**
 * Policy-tenure picker + premium breakdown for the Health Guard premium step.
 * Mirrors the motor flow's side container, but the validity banner uses the
 * design-system {@link ToastGlobal} and the tenure list carries its long-term
 * "Save x%" badge.
 *
 * Every figure comes off the selected sub-plan's premium (see `computePremium`),
 * so the tenure list, the rows and the member-wise split all agree. The premium
 * breakdown and the validity banner unlock only once a tenure is picked — the
 * web flow gates them the same way (`canShowPremium`). Tenure prices stay
 * visible throughout so they can be compared before choosing.
 */
export const PolicyTenurePremium: React.FC<PolicyTenurePremiumProps> = ({
  tenure,
  onSelectTenure,
  subPlan,
  planType,
  members,
  memberData,
  sumInsured,
  oldestMemberDOB,
  floaterAddOns,
}) => {
  const canShowPremium = tenure !== '';
  const quote = computePremium({
    subPlan,
    planType,
    members,
    memberData,
    sumInsured,
    oldestMemberDOB,
    floaterAddOns,
    tenure,
  });

  return (
    <View style={styles.card}>
      {canShowPremium ? (
        <ToastGlobal variant="info" title="21 days validity." message="Quote valid till 21st Feb 2026." />
      ) : null}
      {/* Tenure first: it drives the premium, so the figure it produces reads
          last rather than sitting above the choice that changes it. */}
      <View style={styles.tenureBlock}>
        <Text style={styles.heading}>Choose Policy Tenure</Text>
        {TENURES.map((t) => {
          const selected = tenure === t.value;
          const priced = computePremium({
            subPlan,
            planType,
            members,
            memberData,
            sumInsured,
            oldestMemberDOB,
            floaterAddOns,
            tenure: t.value,
          });
          return (
            
            <Pressable
              key={t.value}
              style={[styles.tenure, selected && styles.tenureSel]}
              onPress={() => onSelectTenure(t.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={styles.tenureLeft}>
                <Radio selected={selected} onPress={() => onSelectTenure(t.value)} />
                <Text style={styles.tenureLabel}>{t.label}</Text>
                {t.discount > 0 ? (
                  <Badge
                    variant="solid"
                    size="sm"
                    color="emerald"
                    label={`Save ${Math.round(t.discount * 100)}%`}
                  />
                ) : null}
              </View>
              <View style={styles.tenureRight}>
                <Text style={[styles.tenurePrice, selected && styles.tenurePriceSel]}>
                  {formatRupees(priced.total)}
                </Text>
                <Text style={styles.tenurePerYear}>{formatRupees(priced.perYear)}/yr</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <Text style={styles.heading}>Premium Details</Text>
          {/* Reminds which tier + tenure the figures below belong to. */}
          {canShowPremium && quote.tier ? (
            <Text style={styles.premiumMeta}>
              {quote.tier.name.toUpperCase()} · {quote.years}Y
            </Text>
          ) : null}
        </View>
        {canShowPremium ? (
          <View style={styles.premiumBody}>
            <View style={styles.sumInsured}>
              <Text style={styles.sumLabel}>Sum Insured</Text>
              <Text style={styles.sumValue}>{formatRupees(quote.totalSumInsured)}</Text>
            </View>
            <View style={styles.premiumRows}>
              <Row label="Base Premium" value={formatRupees(quote.basePremium)} />
              <Row label={`Total Add ons (${quote.addOnCount})`} value={formatRupees(quote.addOnTotal)} />
              <Row
                label={`Long-term discount (${Math.round(quote.discountRate * 100)}%)`}
                value={formatRupees(quote.discountAmount)}
              />
              <Row label="Discount" value={`-${formatRupees(0)}`} valueColor={colors.success} />
            </View>

            {quote.breakdown.length > 0 ? (
              <Accordion label="Member-wise breakdown" style={styles.breakdownCard}>
                <View style={styles.breakdownRows}>
                  {quote.breakdown.map((m) => (
                    <View key={m.id} style={styles.premiumRow}>
                      <Text style={styles.premiumLabel}>
                        {m.label}
                        {m.age !== null ? ` · ${m.age} yrs` : ''}
                        {m.sumInsured > 0 ? ` · ${formatLakhs(m.sumInsured)}` : ''}
                      </Text>
                      <Text style={styles.premiumValue}>{formatRupees(m.premium)}</Text>
                    </View>
                  ))}
                </View>
              </Accordion>
            ) : null}

            <View>
              <View style={styles.totalBar}>
                <Text style={styles.totalLabel}>Total Premium</Text>
                <Text style={styles.totalValue}>{formatRupees(quote.total)}</Text>
              </View>
              <Text style={styles.totalNote}>
                Works out to {formatRupees(quote.perYear)} per year · {formatRupees(quote.perMonth)} per month
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Heartbeat size={28} color={colors.textBody} />
            </View>
            <Text style={styles.emptyText}>Please select a plan to see premium details!</Text>
          </View>
        )}
      </View>

      
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.xl },
  tenureBlock: { gap: spacing.md },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  tenure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl },
  tenureSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  tenureLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  tenureLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  tenureRight: { alignItems: 'flex-end' },
  tenurePrice: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, lineHeight: 24, fontWeight: '500', color: colors.textBody },
  tenurePriceSel: { color: colors.textHeading },
  tenurePerYear: { fontFamily: typography.fontFamily, fontSize: 11, lineHeight: 14, color: colors.textMuted },
  premiumCard: { borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.xl, overflow: 'hidden' },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.md, backgroundColor: '#EFF6FF' },
  premiumMeta: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  premiumBody: { padding: spacing.md, gap: spacing.md },
  sumInsured: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg, padding: spacing.md },
  sumLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  sumValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, fontWeight: '500', color: colors.textHeading },
  premiumRows: { gap: spacing.sm },
  premiumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  premiumLabel: { flexShrink: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  premiumValue: { fontFamily: fontFamilyForWeight('500'), fontWeight: '500', fontSize: 14, color: colors.textHeading },
  breakdownCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply the row spacing here.
  breakdownRows: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  totalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.success, borderRadius: radius.lg, padding: spacing.md },
  totalLabel: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textOnBrand },
  totalValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 22, fontWeight: '500', color: colors.textOnBrand },
  // Sits under the bar, not inside it — a footnote on the figure above.
  totalNote: { fontFamily: typography.fontFamily, fontSize: 11, lineHeight: 16, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 200 },
  emptyIcon: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceSubtle },
  emptyText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
