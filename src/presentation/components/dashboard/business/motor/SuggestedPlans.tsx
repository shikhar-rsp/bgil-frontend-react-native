import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CheckCircle,
  ShieldCheck,
  CrownSimple,
  Shield as ShieldIcon,
  type IconProps,
} from 'phosphor-react-native';
import { Radio, colors, spacing, radius, typography, fontFamilyForWeight, shadow } from '@atlas-ds/react-native';

type PlanTheme = {
  icon: React.ComponentType<IconProps>;
  iconColor: string;
  iconBg: string;
  priceColor: string;
  /** End colour of the card's white→tint gradient. */
  gradientTo: string;
  selectedBorder: string;
};

type Plan = {
  id: string;
  name: string;
  price: string;
  addOnTotal: string;
  covered: string[];
  theme: PlanTheme;
};

const PLANS: Plan[] = [
  {
    id: 'eco',
    name: 'Eco Plan',
    price: 'Rs. 1,700',
    addOnTotal: 'Rs. 800',
    covered: [
      'Eco Assure Repair Protection',
      'Personal Baggage Cover',
      'Personal Baggage Cover',
      'Personal Baggage Cover',
    ],
    theme: {
      icon: ShieldCheck,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
      priceColor: '#1D4ED8',
      gradientTo: '#EFF6FF',
      selectedBorder: '#3B82F6',
    },
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 'Rs. 3,500',
    addOnTotal: 'Rs. 1500',
    covered: [
      'Eco Assure Repair Protection',
      'Personal Baggage Cover',
      'Personal Baggage Cover',
      'Personal Baggage Cover',
    ],
    theme: {
      icon: CrownSimple,
      iconColor: '#D97706',
      iconBg: '#FFFBEB',
      priceColor: '#D97706',
      gradientTo: '#FFF7ED',
      selectedBorder: '#FB923C',
    },
  },
  {
    id: 'mid',
    name: 'Mid Plan',
    price: 'Rs. 1,500',
    addOnTotal: 'Rs. 1000',
    covered: [
      'Eco Assure Repair Protection',
      'Personal Baggage Cover',
      'Personal Baggage Cover',
      'Personal Baggage Cover',
    ],
    theme: {
      icon: ShieldIcon,
      iconColor: '#0D9488',
      iconBg: '#F0FDFA',
      priceColor: '#0D9488',
      gradientTo: '#F0FDFA',
      selectedBorder: '#22C55E',
    },
  },
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
        const { theme } = plan;
        const Icon = theme.icon;
        return (
          <Pressable
            key={plan.id}
            onPress={() => setSelectedPlan(plan.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.plan,
              { borderColor: selected ? theme.selectedBorder : colors.borderSubtle },
            ]}
          >

            {/* White → tint gradient behind the card content. */}
            {selected && (
              <LinearGradient
                colors={['#FFFFFF', theme.gradientTo]}
                style={StyleSheet.absoluteFill}
              />
            )}


            <View style={styles.planTop}>
              <View style={[styles.planIcon, { backgroundColor: theme.iconBg }]}>
                <Icon size={20} color={theme.iconColor} weight="regular" />
              </View>
              <Radio selected={selected} onPress={() => setSelectedPlan(plan.id)} />
            </View>

            <Text style={styles.planName}>{plan.name}</Text>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: theme.priceColor }]}>{plan.price}</Text>
              <Text style={[styles.priceUnit, { color: theme.priceColor }]}> / Year</Text>
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  plans: { gap: spacing.md },
  // overflow:hidden keeps the gradient inside the rounded border.
  plan: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  planTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  planIcon: { width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  planName: { fontFamily: fontFamilyForWeight('500'), fontSize: 13, fontWeight: '500', color: colors.textHeading },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontFamily: fontFamilyForWeight('500'), fontSize: 24, fontWeight: '500' },
  priceUnit: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500' },
  addOnTotal: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs },
  coveredHeading: { fontFamily: fontFamilyForWeight('500'), fontSize: 13, fontWeight: '600', color: colors.textBody },
  coveredRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coveredText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
});
