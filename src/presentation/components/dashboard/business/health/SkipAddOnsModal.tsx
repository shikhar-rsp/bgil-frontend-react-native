import React from 'react';
import { Warning } from 'phosphor-react-native';
import {
  BottomSheet,
  BOTTOM_SHEET_HEADER_GLYPH_SIZE,
  accent,
} from '@atlas-ds/react-native';

interface SkipAddOnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipAndProceed: () => void;
}

/**
 * "Continue without add-ons?" — shown when the agent advances past the add-ons
 * step having picked none. `contentSlot={false}` collapses the sheet to just
 * its header and footer; there's no body to reserve 308px for.
 */
export const SkipAddOnsModal: React.FC<SkipAddOnsModalProps> = ({ isOpen, onClose, onSkipAndProceed }) => (
  <BottomSheet
    visible={isOpen}
    onClose={onClose}
    icon={<Warning size={BOTTOM_SHEET_HEADER_GLYPH_SIZE} color={accent.amber.solidBg} />}
    featuredIconColor="amber"
    title="Continue without add-ons?"
    subtitle="You have not selected any add-ons. However, they can be selected at the proposal stage as well. Do you want to continue without them?"
    contentSlot={false}
    primaryAction={{
      label: 'Skip and move to next step',
      onPress: () => {
        onSkipAndProceed();
        onClose();
      },
    }}
    secondaryAction={{ label: 'Go back to select', onPress: onClose }}
  />
);
