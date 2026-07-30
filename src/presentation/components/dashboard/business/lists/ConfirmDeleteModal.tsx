import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Warning } from 'phosphor-react-native';
import { BottomSheet, colors, spacing, typography } from '@atlas-ds/react-native';

interface ConfirmDeleteModalProps {
  visible: boolean;
  /** 'quote' | 'proposal' — used in the copy. */
  noun: string;
  /** Record label shown in the body, e.g. "QT123452". */
  recordLabel?: string;
  customerName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Delete confirmation for the Quotes and Proposals tabs.
 *
 * Note the web's delete never actually removes the row — it shows a modal, then
 * a danger toast, and leaves the list untouched. That is preserved here so the
 * mock data stays stable between tabs; the caller decides what "confirm" means.
 */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  noun,
  recordLabel,
  customerName,
  onCancel,
  onConfirm,
}) => (
  <BottomSheet
    visible={visible}
    onClose={onCancel}
    icon={<Warning size={20} color={colors.dangerText} weight="regular" />}
    featuredIconColor="red"
    title={`Delete this ${noun}?`}
    subtitle="This action can’t be undone."
    contentMinHeight={0}
    primaryAction={{ label: 'Delete', onPress: onConfirm }}
    secondaryAction={{ label: 'Cancel', onPress: onCancel }}
  >
    <View style={styles.body}>
      <Text style={styles.text}>
        {recordLabel ? `${recordLabel} ` : ''}
        {customerName ? `for ${customerName} ` : ''}
        will be removed from your list.
      </Text>
    </View>
  </BottomSheet>
);

const styles = StyleSheet.create({
  body: { paddingBottom: spacing.sm },
  text: { fontFamily: typography.fontFamily, ...typography.body2, color: colors.textBody },
});
