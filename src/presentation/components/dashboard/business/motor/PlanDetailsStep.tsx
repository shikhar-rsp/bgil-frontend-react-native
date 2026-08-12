import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Radio, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard, motorColors } from './motorUi';
import {
  formatRupees,
  getAvailablePlans,
  type PlanId,
  type PlanOption,
  type VehicleAgeBucket,
} from './motorQuoteData';

interface PlanDetailsStepProps {
  ageBucket: VehicleAgeBucket;

  selectedPlanType: PlanId | '';
  setSelectedPlanType: (val: PlanId) => void;

  /** Total premium per plan, keyed by plan id. */
  planPrices: Record<PlanId, number>;
}

/**
 * The name, radio and description sit together on one white-to-blue ramp — the
 * top of the gradient is what makes the title area read as white. Only the
 * price sits outside it, on the card itself. The block is identical whether or
 * not the card is selected; selection shows in the card tint and brand border.
 *
 * Web draws this as `radial-gradient(116.62% 116.62% at 50% 0%, …)`, centred at
 * the top. A vertical linear ramp is visually indistinguishable at this size and
 * costs one native view instead of an SVG.
 */
const PlanCard: React.FC<{
  plan: PlanOption;
  price: number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ plan, price, isSelected, onSelect }) => (
  <Pressable
    onPress={onSelect}
    accessibilityRole="radio"
    accessibilityState={{ selected: isSelected }}
    style={({ pressed }) => [
      styles.card,
      isSelected ? styles.cardSelected : styles.cardDefault,
      pressed && styles.pressed,
    ]}
  >
    <View style={styles.ramp}>
      <LinearGradient
        colors={['#FFFFFF', motorColors.gradientBlue]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.rampHeader}>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{plan.name}</Text>
          <Text style={styles.tagline}>{plan.tagline}</Text>
        </View>

        <Radio selected={isSelected} size="md" />
      </View>

      <Text style={styles.description}>{plan.description}</Text>
    </View>

    <View>
      <Text style={styles.price}>Rs. {formatRupees(price)}</Text>
      <Text style={styles.priceNote}>total for 1 year, incl. GST</Text>
    </View>
  </Pressable>
);

export const PlanDetailsStep: React.FC<PlanDetailsStepProps> = ({
  ageBucket,
  selectedPlanType,
  setSelectedPlanType,
  planPrices,
}) => {
  const plans = useMemo(() => getAvailablePlans(ageBucket), [ageBucket]);

  // A vehicle under 3 years leaves own damage as the only offerable plan —
  // there is nothing to choose, so pick it rather than block on an empty form.
  useEffect(() => {
    if (plans.length === 1 && selectedPlanType !== plans[0].id) {
      setSelectedPlanType(plans[0].id);
    }
  }, [plans, selectedPlanType, setSelectedPlanType]);

  return (
    <MotorCard title="Choose Plan">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          price={planPrices[plan.id]}
          isSelected={selectedPlanType === plan.id}
          onSelect={() => setSelectedPlanType(plan.id)}
        />
      ))}
    </MotorCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardDefault: { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
  cardSelected: { borderColor: colors.brand, backgroundColor: motorColors.selectedFill },
  pressed: { opacity: 0.9 },

  // overflow:hidden keeps the ramp inside its rounded corners.
  ramp: {
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  rampHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  nameBlock: { flex: 1 },
  name: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
  },
  tagline: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: '#64748B' },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },

  price: {
    fontFamily: fontFamilyForWeight('600'),
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: colors.textHeading,
  },
  priceNote: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: '#64748B' },
});
