import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Modal, colors, spacing, typography } from '@atlas-ds/react-native';

interface SkipAddOnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipAndProceed: () => void;
}

export const SkipAddOnsModal: React.FC<SkipAddOnsModalProps> = ({ isOpen, onClose, onSkipAndProceed }) => (
  <Modal
    visible={isOpen}
    onClose={onClose}
    iconName="warning"
    title="Continue without add-ons?"
    subtitle='You have not selected any add-ons. However, they can be selected at the proposal stage as well. Do you want to
      continue without them?'
    primaryAction={{
      label: 'Skip and move to next step',
      onPress: () => {
        onSkipAndProceed();
        onClose();
      },
    }}
    secondaryAction={{ label: 'Go back to select', onPress: onClose, tone: 'neutral' }}
  />
    
  
);

const styles = StyleSheet.create({
  body: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
});
