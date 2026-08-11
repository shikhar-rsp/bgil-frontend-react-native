import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { DownloadSimple } from 'phosphor-react-native';
import {
  Button,
  Checkbox,
  Radio,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { RequiredLabel } from './RequiredField';
import { SheetSelect } from './SheetSelect';
import {
  criticalPlansFor,
  INCOME_OPTIONS,
  OCCUPATION_OPTIONS,
  formatRupees,
  rupeeAmount,
} from './healthData';

interface CriticalIllnessPlansProps {
  /** `''` until answered, then `yes` / `no`. */
  wantsCriticalIllness: string;
  setWantsCriticalIllness: (val: string) => void;
  grossMonthlyIncome: string;
  setGrossMonthlyIncome: (val: string) => void;
  occupation: string;
  setOccupation: (val: string) => void;
  hasDisability: string;
  setHasDisability: (val: string) => void;
  selectedPlans: string[];
  togglePlan: (id: string) => void;
  onDownloadBrochure: () => void;
}

/**
 * `radial-gradient(116.62% 116.62% at 50% 0%, background.disabled 0%,
 * background.accent.blue.subtlest 100%)` — RN has no radial gradient, so it is
 * painted as an SVG behind the block. The id has to be unique per card or every
 * instance reuses the first one's paint.
 */
const PlanTopGradient: React.FC<{ id: string }> = ({ id }) => {
  // An `Svg` with no explicit size falls back to its own 100×100 canvas, which
  // leaves most of the block unpainted — so measure the block and draw to it.
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {size.width > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <RadialGradient
              id={id}
              cx={size.width / 2}
              cy={0}
              rx={size.width * 1.1662}
              ry={size.height * 1.1662}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={colors.surface} />
              <Stop offset="1" stopColor="#EFF6FF" />
            </RadialGradient>
          </Defs>
          {/* Rounded here rather than clipping the block, so no text is cut off. */}
          <Rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            rx={radius.lg}
            ry={radius.lg}
            fill={`url(#${id})`}
          />
        </Svg>
      ) : null}
    </View>
  );
};

/** Yes / No pair styled like the plan-type chips on the step above. */
const YesNo: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => (
  <View style={styles.yesNoRow}>
    {(['yes', 'no'] as const).map((v) => (
      <Pressable
        key={v}
        style={[styles.yesNo, value === v && styles.yesNoSel]}
        onPress={() => onChange(v)}
        accessibilityRole="radio"
        accessibilityState={{ selected: value === v }}
      >
        <Radio selected={value === v} onPress={() => onChange(v)} />
        <Text style={styles.yesNoLabel}>{v === 'yes' ? 'Yes' : 'No'}</Text>
      </Pressable>
    ))}
  </View>
);

/**
 * Critical Illness / PA add-on plans, offered under the sub-plan tiers.
 *
 * The income + occupation fields hang off the first answer — they only mean
 * anything once the customer wants these covers. The Pre-existing disability
 * card is independent of it and always renders. Plan selection is multi-select,
 * unlike the single-choice sub plan above it.
 */
export const CriticalIllnessPlans: React.FC<CriticalIllnessPlansProps> = ({
  wantsCriticalIllness,
  setWantsCriticalIllness,
  grossMonthlyIncome,
  setGrossMonthlyIncome,
  occupation,
  setOccupation,
  hasDisability,
  setHasDisability,
  selectedPlans,
  togglePlan,
  onDownloadBrochure,
}) => (
  <>
    <View style={styles.card}>
      <Text style={styles.heading}>Critical Illness and PA Plans</Text>
      <View style={styles.field}>
        <RequiredLabel text="Does the customer want any critical illness and PA plan?" />
        <YesNo value={wantsCriticalIllness} onChange={setWantsCriticalIllness} />
      </View>

      {wantsCriticalIllness === 'yes' ? (
        <>
          <View style={styles.field}>
            <RequiredLabel text="Gross Monthly Income (in Rs)" />
            <SheetSelect
              placeholder="Select income"
              sheetTitle="Gross Monthly Income (in Rs)"
              options={INCOME_OPTIONS}
              value={grossMonthlyIncome}
              onChange={setGrossMonthlyIncome}
            />
          </View>
          <View style={styles.field}>
            <RequiredLabel text="Occupation" />
            <SheetSelect
              placeholder="Select occupation"
              sheetTitle="Occupation"
              options={OCCUPATION_OPTIONS}
              value={occupation}
              onChange={setOccupation}
            />
          </View>
        </>
      ) : null}
    </View>

    <View style={styles.card}>
      <Text style={styles.heading}>Pre-existing disability</Text>
      <View style={styles.field}>
        <RequiredLabel text="Does the customer have any pre-existing disability?" />
        <YesNo value={hasDisability} onChange={setHasDisability} />
      </View>

      {/* The list is tailored to the answer, so it only means anything once
          one is given — blank until then rather than showing the full set. */}
      {hasDisability !== '' ? (
        <>
          <View style={styles.plansHead}>
            <Text style={styles.plansTitle}>Customised plans for you</Text>
            {criticalPlansFor(hasDisability).length > 1 ? (
              <Text style={styles.plansHint}>Multiple plans can be selected</Text>
            ) : null}
          </View>

          <View style={styles.plans}>
            {criticalPlansFor(hasDisability).map((plan) => {
              const selected = selectedPlans.includes(plan.id);
              return (
                <Pressable
                  key={plan.id}
                  style={[styles.plan, selected && styles.planSel]}
                  onPress={() => togglePlan(plan.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  {/* Gradient block carries the identity + price; the covers
                      below sit on the card's own surface. */}
                  <View style={styles.planHead}>
                    <PlanTopGradient id={`plan-top-${plan.id}`} />
                    <View style={styles.planTop}>
                      {/* Its own press target, so downloading doesn't also
                          toggle the plan. */}
                      <Button
                        label="Brochure"
                        variant="tertiary"
                        size="sm"
                        onPress={onDownloadBrochure}
                        leadingIcon={<DownloadSimple size={14} color={colors.brand} />}
                      />
                      <Checkbox size="sm" checked={selected} onChange={() => togglePlan(plan.id)} />
                    </View>

                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>
                      <Text style={styles.planPriceCurrency}>Rs. </Text>
                      {rupeeAmount(plan.premium)}
                    </Text>
                    <Text style={styles.planTax}>Inclusive of all taxes</Text>
                  </View>

                  <View style={styles.planCovers}>
                    <View>
                      <Text style={styles.coverLabel}>Death Sum Insured</Text>
                      <Text style={styles.coverValue}>{formatRupees(plan.deathSumInsured)}</Text>
                    </View>
                    {plan.ptdSumInsured ? (
                      <View>
                        <Text style={styles.coverLabel}>PTD Sum Insured</Text>
                        <Text style={styles.coverValue}>{formatRupees(plan.ptdSumInsured)}</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  </>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  field: { gap: spacing.sm },
  yesNoRow: { flexDirection: 'row', gap: spacing.sm },
  yesNo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  yesNoSel: { borderColor: colors.brand, backgroundColor: '#EFF6FF' },
  yesNoLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  plansHead: { gap: spacing.xxs },
  plansTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 15, fontWeight: '500', color: colors.textHeading },
  plansHint: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  plans: { gap: spacing.md },
  plan: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.md, backgroundColor: colors.surface },
  // Same selected treatment as the Yes / No chips above.
  planSel: { borderColor: '#005DAC', backgroundColor: '#EFF6FF' },
  planHead: { padding: spacing.md, paddingBottom: spacing.lg, borderRadius: radius.lg, width: '100%' },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  planName: { fontFamily: fontFamilyForWeight('500'), fontSize: 15, fontWeight: '500', color: colors.textHeading, marginTop: spacing.sm },
  planPrice: { fontFamily: fontFamilyForWeight('500'), fontSize: 24, lineHeight: 30, fontWeight: '500', color: colors.textHeading, marginTop: spacing.xs },
  planPriceCurrency: { fontFamily: typography.fontFamily, fontWeight: '400' },
  planTax: { fontFamily: typography.fontFamily, fontSize: 11, lineHeight: 18, color: colors.textMuted },
  planCovers: { gap: spacing.md, paddingTop: spacing.md, paddingHorizontal: spacing.xs },
  coverLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  coverValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
});
