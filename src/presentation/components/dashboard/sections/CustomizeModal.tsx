import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BottomSheet,
  Button,
  Checkbox,
  ToastGlobal,
  colors,
  spacing,
  radius,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';

export type CustomizeOption = { label: string; value: string };

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelections: string[];
  onUpdate: (next: string[]) => void;
  title?: string;
  description?: string;
  options?: CustomizeOption[];
  maxSelections?: number;
  /** Error banner copy when the cap is exceeded. Defaults to the LOB wording. */
  limitMessage?: string;
}

/**
 * Multi-select customiser used by Quick Quotes and Your Toolkit.
 *
 * The cap is *soft*: rows keep toggling past `maxSelections` so the user sees
 * what they picked, but an error toast appears and Confirm is disabled until
 * they drop back to the limit. (Silently swallowing the tap read as a broken
 * checkbox.)
 *
 * The actions live in the content slot rather than the sheet's `primaryAction`
 * footer because Confirm needs a disabled state, which `BottomSheetAction`
 * doesn't carry.
 */
export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  initialSelections,
  onUpdate,
  title = 'Customise Toolkit',
  description = 'Select the items to show on your dashboard',
  options = [],
  maxSelections = 6,
  limitMessage,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [toastDismissed, setToastDismissed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelections.slice(0, maxSelections));
      setToastDismissed(false);
    }
  }, [isOpen, initialSelections, maxSelections]);

  const overLimit = selected.length > maxSelections;

  const toggle = (value: string) => {
    setToastDismissed(false);
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      title={title}
      subtitle={description}
      contentMinHeight={0}
    >
      {overLimit && !toastDismissed ? (
        <ToastGlobal
          variant="error"
          title={limitMessage ?? `Maximum ${maxSelections} LOBs can be selected`}
          onClose={() => setToastDismissed(true)}
          style={styles.toast}
        />
      ) : null}

      <View style={styles.counterPill}>
        <Text style={styles.counterText}>
          {selected.length}/{options.length}
        </Text>
      </View>

      <View style={styles.list}>
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <View key={opt.value} style={[styles.row, checked && styles.rowSelected]}>
              <Checkbox
                size="md"
                checked={checked}
                label={opt.label}
                onChange={() => toggle(opt.value)}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          label="Confirm"
          variant="primary"
          disabled={overLimit || selected.length === 0}
          onPress={() => {
            onUpdate(selected);
            onClose();
          }}
          style={styles.footerBtn}
        />
        <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.footerBtn} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  toast: { marginBottom: spacing.md },
  counterPill: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  counterText: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textBody,
  },
  list: { gap: spacing.sm },
  // Selected rows carry the same tint the Dropdown gives its chosen option.
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  rowSelected: { backgroundColor: colors.brandSubtle },
  footer: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg },
  // `stretch` overrides Button's own `alignSelf: 'flex-start'` so both halves
  // are equal width and height.
  footerBtn: { flex: 1, alignSelf: 'stretch' },
});
