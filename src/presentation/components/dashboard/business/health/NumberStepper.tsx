import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Minus, Plus } from 'phosphor-react-native';
import { colors, spacing, radius, typography } from '@atlas-ds/react-native';

interface NumberStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Blocks increments even below `max` (e.g. the policy member cap is reached). */
  disableIncrement?: boolean;
  label?: string;
}

/**
 * Local stand-in for the web design system's **Number stepper**. Swap this for
 * the library component once it lands in `@atlas-ds/react-native` — the props
 * (`value` / `onChange` / `min` / `max`) are deliberately the minimal set so
 * the call sites don't have to change.
 */
export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 99,
  disableIncrement = false,
  label,
}) => {
  const canDecrement = value > min;
  const canIncrement = value < max && !disableIncrement;
  // Neither direction available — the whole control reads as disabled.
  const inert = !canDecrement && !canIncrement;

  return (
    <View style={[styles.row, inert && styles.rowDisabled]}>
      <Pressable
        style={[styles.btn, !canDecrement && styles.btnDisabled]}
        disabled={!canDecrement}
        onPress={() => onChange(value - 1)}
        accessibilityRole="button"
        accessibilityLabel={label ? `Remove one ${label}` : 'Decrease'}
        hitSlop={6}
      >
        <Minus size={12} color={canDecrement ? colors.textBody : colors.textDisabled} />
      </Pressable>

      <Text style={styles.value}>{String(value)}</Text>

      <Pressable
        style={[styles.btn, !canIncrement && styles.btnDisabled]}
        disabled={!canIncrement}
        onPress={() => onChange(value + 1)}
        accessibilityRole="button"
        accessibilityLabel={label ? `Add one ${label}` : 'Increase'}
        hitSlop={6}
      >
        <Plus size={12} color={canIncrement ? colors.textBody : colors.textDisabled} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // Figma space-03 either side of the value.
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
  },
  rowDisabled: { backgroundColor: colors.surfaceMuted },
  btn: {
    width: 22,
    height: 22,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  // Stays white when unavailable — only the glyph greys out.
  btnDisabled: { backgroundColor: colors.surface },
  value: {
    minWidth: 16,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textHeading,
  },
});
