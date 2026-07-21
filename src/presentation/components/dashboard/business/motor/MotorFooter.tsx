import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, colors, spacing, radius, shadow } from '@atlas-ds/react-native';

interface MotorFooterProps {
  currentStep: number;
  isProceedDisabled?: boolean;
  onReset?: () => void;
  onBack?: () => void;
  onProceed?: () => void;
  onShareQuote?: () => void;
  onConvertToProposal?: () => void;
}

export const MotorFooter: React.FC<MotorFooterProps> = ({
  currentStep,
  isProceedDisabled,
  onReset,
  onBack,
  onProceed,
  onShareQuote,
  onConvertToProposal,
}) => {
  const isPreview = currentStep === 3;
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        {isPreview ? (
          <Button label="Back" variant="secondary" size="sm" onPress={onBack} />
        ) : (
          <Button label="Reset Form" variant="secondaryGray" size="sm" onPress={onReset} />
        )}
      </View>
      <View style={styles.right}>
        <Button
          label={isPreview ? 'Convert to Proposal' : 'Back'}
          variant="secondary"
          size="sm"
          onPress={isPreview ? onConvertToProposal : onBack}
        />
        <Button
          label={isPreview ? 'Share Quote' : 'Preview Quotes'}
          size="sm"
          disabled={!isPreview && isProceedDisabled}
          onPress={isPreview ? onShareQuote : onProceed}
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
});
