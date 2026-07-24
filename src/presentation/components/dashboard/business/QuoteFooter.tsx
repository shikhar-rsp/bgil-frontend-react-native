import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, colors, spacing } from '@atlas-ds/react-native';

interface QuoteFooterProps {
  currentStep: number;
  /** The read-only preview step (last). */
  previewStep: number;
  /** The step whose primary action opens the preview. */
  previewQuoteStep: number;
  isProceedDisabled?: boolean;
  onBack?: () => void;
  onProceed?: () => void;
  onShareQuote?: () => void;
  onConvertToProposal?: () => void;
}

/**
 * Shared quote/proposal wizard footer — a flat, full-bleed bar. Steps before the
 * preview show Back + (Submit | Preview Quote); the preview step shows Share
 * Quote on its own row, then Back + Convert to Proposal.
 */
export const QuoteFooter: React.FC<QuoteFooterProps> = ({
  currentStep,
  previewStep,
  previewQuoteStep,
  isProceedDisabled,
  onBack,
  onProceed,
  onShareQuote,
  onConvertToProposal,
}) => {
  if (currentStep === previewStep) {
    return (
      <View style={styles.previewBar}>
        <Button label="Share Quote" onPress={onShareQuote} fullWidth />
        <View style={styles.row}>
          <Button label="Back" variant="secondaryGray" onPress={onBack} style={styles.btn} />
          <Button label="Convert to Proposal" variant="secondary" onPress={onConvertToProposal} style={styles.btn} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <Button label="Back" variant="secondaryGray" onPress={onBack} style={styles.btn} />
      <Button
        label={currentStep === previewQuoteStep ? 'Preview Quote' : 'Submit'}
        disabled={isProceedDisabled}
        onPress={onProceed}
        style={styles.btn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  previewBar: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  // `stretch` overrides Button's own `alignSelf: 'flex-start'`.
  btn: { flex: 1, alignSelf: 'stretch' },
});
