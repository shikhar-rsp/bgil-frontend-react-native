import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Warning } from 'phosphor-react-native';
import { Slider, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard, motorColors } from './motorUi';
import {
  DISCOUNT_LOADER_LIMIT,
  DISCOUNT_LOADER_STEP,
  needsApproval,
} from './motorQuoteData';

interface DiscountLoaderCardProps {
  /** Signed percentage — negative discounts, positive loads. */
  value: number;
  setValue: (val: number) => void;
  /** Who the proposal routes to once the premium has been moved. */
  approverName?: string;
}

/**
 * Web draws this as a two-thumb range, but only one side is ever in play — a
 * single signed track from −20 to +20 with a standing tick at 0 is the same
 * control with half the moving parts.
 */
export const DiscountLoaderCard: React.FC<DiscountLoaderCardProps> = ({
  value,
  setValue,
  approverName = 'Manish Jain',
}) => (
  <MotorCard
    title="Select Discount or Loader"
    action={
      <Text
        style={[
          styles.value,
          value < 0 ? styles.discount : value > 0 ? styles.loader : styles.neutral,
        ]}
      >
        {value < 0 ? `-${Math.abs(value)}%` : value > 0 ? `+${value}%` : '0'}
      </Text>
    }
  >
    <Slider
      label="Discount"
      rightLabel="Loader"
      min={-DISCOUNT_LOADER_LIMIT}
      max={DISCOUNT_LOADER_LIMIT}
      step={DISCOUNT_LOADER_STEP}
      marker={0}
      value={value}
      onChange={(val) => setValue(typeof val === 'number' ? val : val[1])}
      valueLabels={[
        `-${DISCOUNT_LOADER_LIMIT}%`,
        '0%',
        `+${DISCOUNT_LOADER_LIMIT}%`,
      ]}
    />

    {needsApproval(value) ? (
      <View style={styles.warning}>
        <Warning size={20} color={motorColors.warnIcon} />
        <Text style={styles.warningText}>
          The quote can still be shared, but the proposal will route to {approverName}{' '}
          for approval before issuance.
        </Text>
      </View>
    ) : null}
  </MotorCard>
);

const styles = StyleSheet.create({
  value: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500' },
  discount: { color: motorColors.discount },
  loader: { color: motorColors.loader },
  neutral: { color: colors.textHeading },

  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: motorColors.warnBorder,
    backgroundColor: motorColors.warnFill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  warningText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
});
