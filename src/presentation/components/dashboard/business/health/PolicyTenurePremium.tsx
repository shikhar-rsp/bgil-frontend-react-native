import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Radio, Badge, ToastGlobal, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';

type Tenure = { value: string; label: string; price: string; badge?: string };

const TENURES: Tenure[] = [
  { value: '1y', label: '1 year', price: '8,500' },
  { value: '2y', label: '2 years', price: '11,500' },
  { value: '3y', label: '3 years', price: '12,500', badge: 'MAXX Saver' },
];

const Row: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <View style={styles.premiumRow}>
    <Text style={styles.premiumLabel}>{label}</Text>
    <Text style={[styles.premiumValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

/**
 * Policy-tenure picker + premium breakdown for the Health Guard Plan Details
 * step. Mirrors the motor flow's side container, but the validity banner uses
 * the design-system {@link ToastGlobal} and the tenure list carries the health
 * "MAXX Saver" badge.
 */
export const PolicyTenurePremium: React.FC = () => {
  const [tenure, setTenure] = useState('2y');

  return (
    <View style={styles.card}>
      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <Text style={styles.heading}>Premium Details</Text>
        </View>
        <View style={styles.premiumBody}>
          <View style={styles.sumInsured}>
            <Text style={styles.sumLabel}>Sum Insured</Text>
            <Text style={styles.sumValue}>Rs. 15,00,000</Text>
          </View>
          <View style={styles.premiumRows}>
            <Row label="Base Premium" value="Rs. 34,000" />
            <Row label="Total Add ons (3)" value="Rs. 3,200" />
            <Row label="Discount" value="-Rs. 3,200" valueColor={colors.success} />
          </View>
          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Total Premium</Text>
            <Text style={styles.totalValue}>Rs. 34,000</Text>
          </View>
        </View>
      </View>

      <ToastGlobal variant="info" title="21 days validity." message="Quote valid till 21st Feb 2026." />

      <View style={styles.tenureBlock}>
        <Text style={styles.heading}>Choose Policy Tenure</Text>
        {TENURES.map((t) => {
          const selected = tenure === t.value;
          return (
            <Pressable
              key={t.value}
              style={[styles.tenure, selected && styles.tenureSel]}
              onPress={() => setTenure(t.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={styles.tenureLeft}>
                <Radio selected={selected} onPress={() => setTenure(t.value)} />
                <Text style={styles.tenureLabel}>{t.label}</Text>
                {t.badge ? <Badge variant="solid" size="sm" color="emerald" label={t.badge} /> : null}
              </View>
              <Text style={[styles.tenurePrice, selected && styles.tenurePriceSel]}>Rs. {t.price}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.xl },
  tenureBlock: { gap: spacing.md },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  tenure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl },
  tenureSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  tenureLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  tenureLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  tenurePrice: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '500', color: colors.textBody },
  tenurePriceSel: { color: colors.textHeading },
  premiumCard: { borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.xl, overflow: 'hidden' },
  premiumHeader: { padding: spacing.md, backgroundColor: '#EFF6FF' },
  premiumBody: { padding: spacing.md, gap: spacing.md },
  sumInsured: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg, padding: spacing.md },
  sumLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  sumValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, fontWeight: '500', color: colors.textHeading },
  premiumRows: { gap: spacing.sm },
  premiumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  premiumLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  premiumValue: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  totalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.success, borderRadius: radius.lg, padding: spacing.md },
  totalLabel: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textOnBrand },
  totalValue: { fontFamily: typography.fontFamily, fontSize: 22, fontWeight: '500', color: colors.textOnBrand },
});
