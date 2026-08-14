import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Check, X } from 'phosphor-react-native';
import { Badge, Radio, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard, motorColors } from './motorUi';
import { formatRupees, type PlanId, type PlanOption } from './motorQuoteData';

interface PlanDetailsStepProps {
  plans: PlanOption[];

  selectedPlanType: PlanId | '';
  setSelectedPlanType: (val: PlanId) => void;

  /** Total premium per plan, keyed by plan id. */
  planPrices: Partial<Record<PlanId, number>>;
}

/** "Own Damage · 1 yr" — ticked when the plan includes that half. */
const CoverChip: React.FC<{
  label: string;
  years: number;
  included: boolean;
}> = ({ label, years, included }) => (
  <View style={[styles.chip, included ? styles.chipOn : styles.chipOff]}>
    {included ? (
      <Check size={12} color="#1D4ED8" weight="bold" />
    ) : (
      <X size={12} color={colors.textMuted} weight="bold" />
    )}

    <Text style={[styles.chipText, included ? styles.chipTextOn : styles.chipTextOff]}>
      {included ? `${label} · ${years} ${years === 1 ? 'yr' : 'yrs'}` : label}
    </Text>
  </View>
);

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
}> = ({ plan, price, isSelected, onSelect }) => {
  // A plan whose legs run different lengths, or run past a year, is paid for
  // once up front rather than "for 1 year".
  const isMultiYear = plan.ownDamageYears > 1 || plan.thirdPartyYears > 1;

  return (
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
      {plan.recommended ? (
        <View style={styles.badge}>
          <Badge variant="solid" color="emerald" size="sm" label="Recommended" />
        </View>
      ) : null}

      <View style={styles.ramp}>
        <LinearGradient
          colors={['#FFFFFF', motorColors.gradientBlue]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.rampTop}>
          <View style={styles.rampHeader}>
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{plan.name}</Text>
              <Text style={styles.tagline}>{plan.tagline}</Text>
            </View>

            <Radio selected={isSelected} size="md" />
          </View>

          <View style={styles.chips}>
            <CoverChip
              label="Own Damage"
              years={plan.ownDamageYears}
              included={plan.coversOwnDamage}
            />

            <CoverChip
              label="Third Party"
              years={plan.thirdPartyYears}
              included={plan.coversThirdParty}
            />
          </View>
        </View>

        <Text style={styles.description}>{plan.description}</Text>
      </View>

      <View>
        <Text style={styles.price}>Rs. {formatRupees(price)}</Text>
        <Text style={styles.priceNote}>
          {isMultiYear
            ? 'total at inception, incl. GST'
            : 'total for 1 year, incl. GST'}
        </Text>
      </View>
    </Pressable>
  );
};

export const PlanDetailsStep: React.FC<PlanDetailsStepProps> = ({
  plans,
  selectedPlanType,
  setSelectedPlanType,
  planPrices,
}) => {
  // Where there is nothing to choose — an under-3-year vehicle leaves own
  // damage as the only offerable plan — pick it rather than block on an empty
  // form.
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
          price={planPrices[plan.id] ?? 0}
          isSelected={selectedPlanType === plan.id}
          onSelect={() => setSelectedPlanType(plan.id)}
        />
      ))}
    </MotorCard>
  );
};

const styles = StyleSheet.create({
  card: {
    // `position: relative` so the Recommended badge can straddle the top edge.
    // No `overflow: hidden` here — that would clip it away.
    position: 'relative',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  badge: { position: 'absolute', top: -10, right: spacing.lg, zIndex: 1 },
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
  rampTop: { gap: spacing.md },
  rampHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  nameBlock: { flex: 1 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipOn: { backgroundColor: motorColors.gradientBlue },
  chipOff: { backgroundColor: colors.surfaceMuted },
  chipText: { fontFamily: fontFamilyForWeight('500'), fontSize: 12, lineHeight: 16, fontWeight: '500' },
  chipTextOn: { color: '#1D4ED8' },
  chipTextOff: { color: colors.textMuted },
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
