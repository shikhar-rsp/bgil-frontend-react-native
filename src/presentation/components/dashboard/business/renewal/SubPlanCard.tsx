import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle } from 'phosphor-react-native';
import { Badge, Radio, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { SUB_PLANS, SUB_PLAN_BENEFITS, type SubPlanValue } from './renewalData';

interface SubPlanCardProps {
  subPlan: SubPlanValue | null;
  onSelect: (value: SubPlanValue) => void;
}

/**
 * "Select a sub plan" — Silver / Gold / Platinum tiers. Shown on the policy
 * details step and, in the "Add-ons & Subplan" edit flow, below the add-ons.
 * The web grid becomes a single column here.
 */
export const SubPlanCard: React.FC<SubPlanCardProps> = ({ subPlan, onSelect }) => (
  <View style={styles.card}>
    <Text style={styles.heading}>Select a sub plan</Text>
    {SUB_PLANS.map((plan) => {
      const selected = subPlan === plan.value;
      return (
        <Pressable
          key={plan.value}
          onPress={() => onSelect(plan.value)}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          accessibilityLabel={`${plan.title} plan`}
          style={[
            styles.plan,
            { borderColor: selected ? plan.selectedBorder : plan.unselectedBorder },
            selected && { backgroundColor: plan.selectedBg },
          ]}
        >
          {/* Background-only gradient — on iOS it paints over its own children. */}
          <View style={styles.planHeader}>
            <LinearGradient
              colors={plan.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.planHeaderTop}>
              <View style={[styles.iconBox, { backgroundColor: plan.iconBg }]}>
                <plan.Icon size={20} color="#FFFFFF" />
              </View>
              <Radio selected={selected} onPress={() => onSelect(plan.value)} />
            </View>
            <View style={styles.planTitleRow}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Badge label={plan.badge} variant="solid" size="sm" color={plan.badgeColor} />
            </View>
          </View>

          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>What you get</Text>
            {SUB_PLAN_BENEFITS.map((item) => (
              <View key={item} style={styles.benefitRow}>
                <CheckCircle size={16} color={colors.textBody} />
                <Text style={styles.benefitText}>{item}</Text>
              </View>
            ))}
          </View>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  plan: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.lg,
    backgroundColor: colors.surface,
  },
  // `overflow` rounds off the absolutely-filled gradient behind the content.
  planHeader: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, overflow: 'hidden' },
  planHeaderTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  iconBox: { width: 32, height: 32, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  planTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, lineHeight: 28, fontWeight: '500', color: colors.textHeading },
  benefits: { gap: spacing.sm, paddingHorizontal: spacing.xs },
  benefitsTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  benefitText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody, flexShrink: 1 },
});
