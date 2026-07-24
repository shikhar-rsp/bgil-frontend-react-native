import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Info, Scooter } from 'phosphor-react-native';
import { Radio, Badge, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { tenureOptionsFor } from './motorData';

interface MotorSideContainerProps {
  isFormValid: boolean;
  /**
   * Whether the premium breakdown can be shown: the vehicle is identified
   * (registered) or its details are filled in (new), *and* a plan type is
   * selected. Narrower than `isFormValid`, which also needs proposer details.
   */
  showPremiumDetails: boolean;
  policyTenure: string;
  setPolicyTenure: (val: string) => void;
  policyStartDate: Date | null;
  selectedPlanType: string;
  calculatePolicyEndDate: (startDate: Date | null, tenure: string) => void;
  discountLoader: [number, number];
}

const Row: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <View style={styles.premiumRow}>
    <Text style={styles.premiumLabel}>{label}</Text>
    <Text style={[styles.premiumValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

export const MotorSideContainer: React.FC<MotorSideContainerProps> = ({
  isFormValid,
  showPremiumDetails,
  policyTenure,
  setPolicyTenure,
  policyStartDate,
  selectedPlanType,
  calculatePolicyEndDate,
  discountLoader,
}) => {
  const [discount, loader] = discountLoader;
  const discountAmount = Math.abs(discount) * 160;
  const loaderAmount = loader * 120;
  const isLoaderSelected = loader > 0;

  const tenureOptions = useMemo(() => tenureOptionsFor(selectedPlanType), [selectedPlanType]);

  useEffect(() => {
    setPolicyTenure('');
  }, [selectedPlanType, setPolicyTenure]);

  return (
    <View style={styles.card}>
      

      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <Text style={styles.heading}>Premium Details</Text>
        </View>
        {showPremiumDetails ? (
          <View style={styles.premiumBody}>
            <View style={styles.sumInsured}>
              <Text style={styles.sumLabel}>Sum Insured</Text>
              <Text style={styles.sumValue}>Rs. 15,00,000</Text>
            </View>
            <View style={styles.premiumRows}>
              <Row label="Base Premium" value="Rs. 34,000" />
              <Row label="Total Add ons (3)" value="Rs. 1200" />
              <Row label="Discount" value={`Rs. ${discountAmount.toLocaleString('en-IN')}`} valueColor={colors.success} />
              {isLoaderSelected ? (
                <Row label="Loader" value={`Rs. ${loaderAmount.toLocaleString('en-IN')}`} valueColor={colors.dangerText} />
              ) : null}
              <Row label="Central GST" value="0" />
              <Row label="State GST" value="0" />
            </View>
            <View style={styles.totalBar}>
              <Text style={styles.totalLabel}>Total Premium</Text>
              <Text style={styles.totalValue}>Rs. 34,000</Text>
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Scooter size={28} color={colors.textBody} />
            </View>
            <Text style={styles.emptyText}>Please select a plan to see premium details!</Text>
          </View>
        )}
      </View>

      {selectedPlanType && policyTenure ? (
        <View style={styles.validity}>
          <Info size={22} color="#2563EB" />
          <Text style={styles.validityText}>
            Quote valid till 21st Feb 2026.
          </Text>
        </View>
      ) : null}

      {selectedPlanType ? (
        <View style={styles.tenureBlock}>
          <Text style={styles.heading}>Choose Policy Tenure</Text>
          {tenureOptions.map((t) => {
            const selected = policyTenure === t.value;
            return (
              <Pressable
                key={t.value}
                style={[styles.tenure, selected && styles.tenureSel]}
                onPress={() => {
                  setPolicyTenure(t.value);
                  calculatePolicyEndDate(policyStartDate, t.value);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={styles.tenureLeft}>
                  <Radio selected={selected} onPress={() => setPolicyTenure(t.value)} />
                  <Text style={styles.tenureLabel}>{t.label}</Text>
                  {t.badge && isFormValid ? <Badge variant="solid" size="sm" color="emerald" label={t.badge} /> : null}
                </View>
                <Text style={[styles.tenurePrice, selected && styles.tenurePriceSel]}>
                  {isFormValid ? `Rs. ${t.price}` : '-'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.xl, ...shadow.lg },
  validity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#EFF6FF', borderRadius: radius.lg, padding: spacing.md },
  validityText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  validityBold: { fontWeight: '500', color: colors.textHeading },
  tenureBlock: { gap: spacing.md },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  tenure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl },
  tenureSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  tenureLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  tenureLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  tenurePrice: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '500', color: colors.textBody },
  tenurePriceSel: { color: colors.textHeading },
  premiumCard: { borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.xl, overflow: 'hidden' },
  premiumHeader: { padding: spacing.md, backgroundColor: '#EFF6FF' },
  premiumBody: { padding: spacing.md, gap: spacing.md },
  sumInsured: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg, padding: spacing.md },
  sumLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  sumValue: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '500', color: colors.textHeading },
  premiumRows: { gap: spacing.sm },
  premiumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  premiumLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  premiumValue: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  totalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.success, borderRadius: radius.lg, padding: spacing.md },
  totalLabel: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textOnBrand },
  totalValue: { fontFamily: typography.fontFamily, fontSize: 22, fontWeight: '500', color: colors.textOnBrand },
  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 200 },
  emptyIcon: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceSubtle },
  emptyText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
