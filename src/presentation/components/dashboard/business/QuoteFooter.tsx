import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, colors, spacing } from '@atlas-ds/react-native';
import { useBottomActionInset } from '../../../hooks/useBottomActionInset';

interface QuoteFooterProps {
  currentStep: number;
  /** The read-only preview step (last). */
  previewStep: number;
  /** The step whose primary action opens the preview. */
  previewQuoteStep: number;
  isProceedDisabled?: boolean;
  onProceed?: () => void;
  onShareQuote?: () => void;
  onConvertToProposal?: () => void;
}

/**
 * Shared quote/proposal wizard footer — a flat, full-bleed bar. Steps before the
 * preview show a single forward action (Submit | Preview Quote); the preview
 * step shows Share Quote and Convert to Proposal.
 *
 * There is deliberately no Back control here. The screen's top bar already
 * carries one, and it walks the wizard's steps — see `onRegisterBack` on the
 * health and motor flows.
 */
export const QuoteFooter: React.FC<QuoteFooterProps> = ({
  currentStep,
  previewStep,
  previewQuoteStep,
  isProceedDisabled,
  onProceed,
  onShareQuote,
  onConvertToProposal,
}) => {
  // The wizards hide the bottom nav, so this bar is the screen's bottom edge.
  const paddingBottom = useBottomActionInset();

  if (currentStep === previewStep) {
    return (
      <View style={[styles.previewBar, { paddingBottom }]}>
        <Button label="Share Quote" onPress={onShareQuote} fullWidth />
        <Button label="Convert to Proposal" variant="secondary" onPress={onConvertToProposal} fullWidth />
      </View>
    );
  }

  return (
    <View style={[styles.bar, { paddingBottom }]}>
      <Button
        label={currentStep === previewQuoteStep ? 'Preview Quote' : 'Submit'}
        disabled={isProceedDisabled}
        onPress={onProceed}
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  previewBar: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
});
