import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IdentificationCard, PencilSimpleLine } from 'phosphor-react-native';
import {
  BottomSheet,
  Button,
  Dropdown,
  colors,
  spacing,
  radius,
  typography,
  BOTTOM_SHEET_HEADER_GLYPH_SIZE,
  type BottomSheetPage,
} from '@atlas-ds/react-native';
import type {
  AgentProfile,
  VirtualIdCard,
  VirtualIdCardDraft,
  VirtualIdLanguage,
} from '../../../../domain/entities/profile_entities';
import { VIRTUAL_ID_LANGUAGES } from '../constants';
import { VirtualIdBenefitsPanel } from './VirtualIdBenefitsPanel';
import { VirtualIdPreview } from './VirtualIdPreview';
import { VirtualIdEditForm, type VirtualIdDraftState } from './VirtualIdEditForm';

interface VirtualIdSheetProps {
  isOpen: boolean;
  profile: AgentProfile;
  card: VirtualIdCard;
  onClose: () => void;
  onSave: (draft: VirtualIdCardDraft) => Promise<void>;
  onCopyLink: () => void;
  onShare: () => void;
}

const toDraft = (card: VirtualIdCard): VirtualIdDraftState => ({
  secondaryLanguage: card.secondaryLanguage,
  shortBio: card.shortBio,
  selectedServiceIds: [...card.selectedServiceIds],
});

const isSameDraft = (a: VirtualIdDraftState, b: VirtualIdDraftState) =>
  a.secondaryLanguage === b.secondaryLanguage &&
  a.shortBio === b.shortBio &&
  a.selectedServiceIds.length === b.selectedServiceIds.length &&
  a.selectedServiceIds.every((id) => b.selectedServiceIds.includes(id));

/**
 * Virtual ID Card sheet. The web modal swaps its body between a read-only
 * preview and the edit form; here the two are the sheet's own pages, so moving
 * into "Edit ID Card" glides forward and carries a back control rather than
 * silently redrawing in place.
 */
export const VirtualIdSheet: React.FC<VirtualIdSheetProps> = ({
  isOpen,
  profile,
  card,
  onClose,
  onSave,
  onCopyLink,
  onShare,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [draft, setDraft] = useState<VirtualIdDraftState>(() => toDraft(card));
  const [previewLanguage, setPreviewLanguage] = useState<VirtualIdLanguage>(card.defaultLanguage);
  const [isSaving, setIsSaving] = useState(false);

  // Reset to the preview with fresh values each time the sheet opens. Adjusting
  // state during render (rather than in an effect) avoids a cascading re-render.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setPageIndex(0);
      setDraft(toDraft(card));
      setPreviewLanguage(card.defaultLanguage);
    }
  }

  const hasChanges = !isSameDraft(draft, toDraft(card));

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onSave({
        secondaryLanguage: draft.secondaryLanguage,
        shortBio: draft.shortBio,
        selectedServiceIds: draft.selectedServiceIds,
      });
      setPageIndex(0);
    } finally {
      setIsSaving(false);
    }
  };

  /** Languages offered in the preview selector: default plus the chosen secondary. */
  const previewLanguages = VIRTUAL_ID_LANGUAGES.filter(
    (language) => language === card.defaultLanguage || language === card.secondaryLanguage
  ).map((language) => ({
    value: language,
    label: language === card.defaultLanguage ? `${language} (Default)` : language,
  }));

  const pages: BottomSheetPage[] = [
    {
      key: 'preview',
      icon: <IdentificationCard size={BOTTOM_SHEET_HEADER_GLYPH_SIZE} color={colors.brand} />,
      title: 'Virtual ID Card',
      subtitle: 'Preview the card your customers receive.',
      content: (
        <View style={styles.previewPage}>
          <View style={styles.languageRow}>
            <Text style={styles.languageLabel}>Language Options</Text>
            <View style={styles.languageField}>
              <Dropdown
                options={previewLanguages}
                value={previewLanguage}
                onChange={(value) => setPreviewLanguage(value as VirtualIdLanguage)}
              />
            </View>
          </View>

          <Button
            label="Edit ID"
            variant="secondaryGray"
            size="sm"
            leadingIcon={<PencilSimpleLine size={16} color={colors.textBody} />}
            onPress={() => setPageIndex(1)}
            fullWidth
          />

          <View style={styles.previewStage}>
            <VirtualIdPreview profile={profile} card={card} />
          </View>

          <VirtualIdBenefitsPanel />
        </View>
      ),
      primaryAction: { label: 'Share', onPress: onShare },
      secondaryAction: { label: 'Copy Link', onPress: onCopyLink },
    },
    {
      key: 'edit',
      icon: <PencilSimpleLine size={BOTTOM_SHEET_HEADER_GLYPH_SIZE} color={colors.brand} />,
      title: 'Edit ID Card',
      subtitle: 'Choose what customers see on your Virtual ID.',
      content: (
        <View style={styles.editPage}>
          <VirtualIdBenefitsPanel />
          <VirtualIdEditForm
            defaultLanguage={card.defaultLanguage}
            draft={draft}
            onChange={setDraft}
          />
        </View>
      ),
      primaryAction: {
        label: 'Update',
        onPress: handleUpdate,
        disabled: !hasChanges || isSaving,
      },
      secondaryAction: { label: 'Cancel', onPress: () => setPageIndex(0) },
    },
  ];

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      pages={pages}
      pageIndex={pageIndex}
      onBack={() => setPageIndex(0)}
      backAccessibilityLabel="Back to card preview"
    />
  );
};

const styles = StyleSheet.create({
  previewPage: { gap: spacing.md },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  languageLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  languageField: { flex: 1 },
  previewStage: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  editPage: { gap: spacing.lg },
});
