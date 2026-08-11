import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CaretDown, Check } from 'phosphor-react-native';
import { BottomSheet, colors, spacing, radius, typography } from '@atlas-ds/react-native';

export type SheetSelectOption = { label: string; value: string };

interface SheetSelectProps {
  options: SheetSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  /** Sheet heading — defaults to the field label. */
  sheetTitle?: string;
}

/**
 * A Dropdown-shaped trigger whose options open in a `BottomSheet` instead of an
 * anchored popover — the phone pattern used elsewhere in the app (Tasks'
 * "Update status"). The trigger mirrors the design system Dropdown's field so
 * it sits flush with the real dropdowns on the same form.
 */
export const SheetSelect: React.FC<SheetSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select',
  sheetTitle,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        style={styles.input}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityValue={{ text: selected?.label ?? '' }}
      >
        <Text style={[styles.value, selected ? styles.valueSelected : styles.valuePlaceholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <CaretDown size={16} color={colors.textBody} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={sheetTitle ?? label ?? placeholder}>
        <View style={styles.list}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                style={[styles.option, isSelected && styles.optionActive]}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
                {isSelected ? <Check size={18} color={colors.brand} weight="bold" /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: spacing.sm },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  value: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20 },
  valueSelected: { color: colors.textHeading },
  valuePlaceholder: { color: colors.textMuted },
  list: { gap: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  optionActive: { backgroundColor: colors.surfaceSubtle },
  optionLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
});
