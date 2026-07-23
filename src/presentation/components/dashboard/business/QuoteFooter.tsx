import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, colors, spacing, radius, shadow } from '@atlas-ds/react-native';

interface QuoteFooterProps {
  currentStep: number;
  /** The read-only preview step (last). */
  previewStep: number;
  /** The step whose primary action opens the preview. */
  previewQuoteStep: number;
  isProceedDisabled?: boolean;
  onReset?: () => void;
  onBack?: () => void;
  onProceed?: () => void;
  onShareQuote?: () => void;
  onConvertToProposal?: () => void;
}

/**
 * Shared quote/proposal wizard footer. Steps before the preview show
 * Reset / Back / (Submit | Preview Quote); the preview step shows Share Quote on
 * its own row, then Back + Convert to Proposal. Used by the motor and Health
 * Guard flows.
 */
export const QuoteFooter: React.FC<QuoteFooterProps> = ({
  currentStep,
  previewStep,
  previewQuoteStep,
  isProceedDisabled,
  onReset,
  onBack,
  onProceed,
  onShareQuote,
  onConvertToProposal,
}) => {
  if (currentStep === previewStep) {
    return (
      <View style={styles.previewBar}>
        <Button label="Share Quote" onPress={onShareQuote} fullWidth />
        <View style={styles.previewRow}>
          <Button label="Back" variant="secondaryGray" size="sm" onPress={onBack} style={styles.previewBtn} />
          <Button label="Convert to Proposal" variant="secondary" size="sm" onPress={onConvertToProposal} style={styles.previewBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Button label="Reset Form" variant="secondaryGray" size="sm" onPress={onReset} />
      </View>
      <View style={styles.right}>
        <Button label="Back" variant="secondary" size="sm" onPress={onBack} />
        <Button
          label={currentStep === previewQuoteStep ? 'Preview Quote' : 'Submit'}
          size="sm"
          disabled={isProceedDisabled}
          onPress={onProceed}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    ...shadow.lg,
  },
  left: { flexDirection: 'row', gap: spacing.sm },
  right: { flexDirection: 'row', gap: spacing.sm },
  previewBar: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    ...shadow.lg,
  },
  previewRow: { flexDirection: 'row', gap: spacing.sm },
  previewBtn: { flex: 1, alignSelf: 'stretch' },
});
