import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CheckCircle, ShieldCheck, CrownSimple, Shield, type IconProps } from 'phosphor-react-native';
import { Radio, colors, spacing, radius, typography } from '@atlas-ds/react-native';

type Plan = {
  id: string;
  name: string;
  price: string;
  addOnTotal: string;
  covered: string[];
  Icon: React.ComponentType<IconProps>;
  iconColor: string;
  iconBg: string;
  priceColor: string;
  selectedBorder: string;
  gradientTint: string;
};

const COVERED = [
  'Eco Assure Repair Protection',
  'Personal Baggage Cover',
  'Personal Baggage Cover',
  'Personal Baggage Cover',
];

const PLANS: Plan[] = [
  { id: 'eco', name: 'Eco Plan', price: '₹1,700', addOnTotal: 'Rs. 800', covered: COVERED, Icon: ShieldCheck, iconColor: '#2563EB', iconBg: '#EFF6FF', priceColor: '#1D4ED8', selectedBorder: '#3B82F6', gradientTint: '#EFF6FF' },
  { id: 'premium', name: 'Premium Plan', price: '₹3,500', addOnTotal: 'Rs. 1500', covered: COVERED, Icon: CrownSimple, iconColor: '#D97706', iconBg: '#FFFBEB', priceColor: '#D97706', selectedBorder: '#FB923C', gradientTint: '#FFF7ED' },
  { id: 'mid', name: 'Mid Plan', price: '₹1,500', addOnTotal: 'Rs. 1000', covered: COVERED, Icon: Shield, iconColor: '#0D9488', iconBg: '#F0FDFA', priceColor: '#0D9488', selectedBorder: '#22C55E', gradientTint: '#F0FDFA' },
];

interface SuggestedPlansProps {
  selectedPlan: string;
  setSelectedPlan: (val: string) => void;
}

export const SuggestedPlans: React.FC<SuggestedPlansProps> = ({ selectedPlan, setSelectedPlan }) => (
  <View style={styles.card}>
    <Text style={styles.heading}>Suggested plans</Text>
    <View style={styles.plans}>
      {PLANS.map((plan) => {
        const selected = selectedPlan === plan.id;
        return (
          <Pressable
            key={plan.id}
            onPress={() => setSelectedPlan(plan.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.plan,
              { borderColor: selected ? plan.selectedBorder : colors.borderSubtle },
              selected && { backgroundColor: plan.gradientTint },
            ]}
          >
            <View style={styles.planTop}>
              <View style={[styles.planIcon, { backgroundColor: plan.iconBg }]}>
                <plan.Icon size={20} color={plan.iconColor} weight="fill" />
              </View>
              <Radio selected={selected} onPress={() => setSelectedPlan(plan.id)} />
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: plan.priceColor }]}>{plan.price}</Text>
              <Text style={[styles.priceUnit, { color: plan.priceColor }]}> / Year</Text>
            </View>
            <Text style={styles.addOnTotal}>Add on total: {plan.addOnTotal}</Text>
            <View style={styles.divider} />
            <Text style={styles.coveredHeading}>What's covered</Text>
            {plan.covered.map((item, i) => (
              <View key={i} style={styles.coveredRow}>
                <CheckCircle size={16} color={colors.textBody} />
                <Text style={styles.coveredText}>{item}</Text>
              </View>
            ))}
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  plans: { gap: spacing.md },
  plan: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  planTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  planIcon: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  planName: { fontFamily: typography.fontFamily, fontSize: 13, fontWeight: '500', color: colors.textHeading },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '500' },
  priceUnit: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500' },
  addOnTotal: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs },
  coveredHeading: { fontFamily: typography.fontFamily, fontSize: 13, fontWeight: '600', color: colors.textHeading },
  coveredRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coveredText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
});
