import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IdentificationCard } from 'phosphor-react-native';
import {
  BottomSheet,
  colors,
  spacing,
  BOTTOM_SHEET_HEADER_GLYPH_SIZE,
} from '@atlas-ds/react-native';
import type { VirtualIdCardDraft } from '../../../../domain/entities/profile_entities';
import { DEFAULT_VIRTUAL_ID_LANGUAGE } from '../constants';
import { VirtualIdBenefitsPanel } from './VirtualIdBenefitsPanel';
import { VirtualIdEditForm, type VirtualIdDraftState } from './VirtualIdEditForm';

interface CreateVirtualIdSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (draft: VirtualIdCardDraft) => Promise<void>;
}

const EMPTY_DRAFT: VirtualIdDraftState = {
  secondaryLanguage: null,
  shortBio: '',
  selectedServiceIds: [],
};

/**
 * First-time "Create Virtual ID Card" sheet, shown when the agent has no card
 * yet. Shares the explainer and form with the edit flow; only the heading copy
 * and the primary action differ.
 */
export const CreateVirtualIdSheet: React.FC<CreateVirtualIdSheetProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [draft, setDraft] = useState<VirtualIdDraftState>(EMPTY_DRAFT);
  const [isCreating, setIsCreating] = useState(false);

  // Start from a blank draft each time the sheet is reopened.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setDraft(EMPTY_DRAFT);
  }

  // At least one service must be shown on the card; the bio stays optional.
  const canCreate = draft.selectedServiceIds.length > 0;

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await onCreate(draft);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      icon={<IdentificationCard size={BOTTOM_SHEET_HEADER_GLYPH_SIZE} color={colors.brand} />}
      title="Create Virtual ID Card"
      subtitle="Set up the card you share with customers."
      primaryAction={{
        label: 'Create ID',
        onPress: handleCreate,
        disabled: !canCreate || isCreating,
      }}
      secondaryAction={{ label: 'Cancel', onPress: onClose }}
    >
      <View style={styles.content}>
        <VirtualIdBenefitsPanel />
        <VirtualIdEditForm
          mode="create"
          defaultLanguage={DEFAULT_VIRTUAL_ID_LANGUAGE}
          draft={draft}
          onChange={setDraft}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.sm },
});
