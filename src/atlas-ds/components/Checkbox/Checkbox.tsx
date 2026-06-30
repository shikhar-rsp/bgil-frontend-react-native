import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check, Minus } from 'phosphor-react-native';
import { colors, radius, typography } from '../../theme';

export type CheckboxSize = 'sm' | 'md';

// Figma sizes: Small 16px box / 14px label, Medium 20px box / 16px label.
// Supporting text is Body 2/Regular (14/20) in both. Icon scales with the box.
const DIMS: Record<CheckboxSize, { box: number; icon: number; label: number; labelLh: number; desc: number; descLh: number }> = {
  sm: { box: 16, icon: 12, label: 14, labelLh: 20, desc: 14, descLh: 20 },
  md: { box: 20, icon: 14, label: 16, labelLh: 24, desc: 14, descLh: 20 },
};

export interface CheckboxProps {
  /** Checked state (controlled). */
  checked: boolean;
  /** Fired with the next checked value. */
  onChange?: (checked: boolean) => void;
  /** Optional label to the right of the box. */
  label?: string;
  /** Supporting text shown under the label (Figma "CheckboxLabel"). */
  description?: string;
  /** Show a dash instead of a tick (mixed state). */
  indeterminate?: boolean;
  /** Box size — `sm` (16px) or `md` (20px). Default `md`. */
  size?: CheckboxSize;
  /** Disable interaction + dim. */
  disabled?: boolean;
  style?: object;
}

/**
 * Checkbox — square box with a tick / indeterminate dash. Mirrors Figma
 * node 72:27286 (size Small/Medium × Unselected/Selected/Intermediate ×
 * Default/Disabled).
 *
 * Per Figma (tokens):
 *   • Unselected   — white bg, #CBD5E1 (border.bold) border.
 *   • Selected     — #005DAC (brand) bg + border, white Check.
 *   • Intermediate — white bg, #005DAC (brand) border, brand Minus.
 *   • Disabled     — #F1F5F9 (surfaceMuted) bg, #E2E8F0 (borderSubtle) border,
 *                    #CBD5E1 (textDisabled) icon.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  indeterminate = false,
  size = 'md',
  disabled = false,
  style,
}) => {
  const dims = DIMS[size];
  const showMinus = indeterminate;
  const showCheck = checked && !indeterminate;

  // Box chrome by state — Figma maps each (state × type) to explicit tokens.
  const boxColorStyle = disabled
    ? styles.boxDisabled
    : indeterminate
      ? styles.boxIntermediate
      : checked
        ? styles.boxSelected
        : styles.boxUnselected;

  // Icon colour: white on the filled Selected box; brand on the outlined
  // Intermediate box; muted grey when disabled.
  const iconColor = disabled ? colors.textDisabled : showCheck ? colors.textOnBrand : colors.brand;

  return (
    <Pressable
      style={[styles.row, style]}
      onPress={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
    >
      {/* 2px vertical padding aligns the box with the first text line. */}
      <View style={styles.inputWrap}>
        <View style={[styles.box, { width: dims.box, height: dims.box }, boxColorStyle]}>
          {showMinus ? (
            <Minus size={dims.icon} color={iconColor} weight="bold" />
          ) : showCheck ? (
            <Check size={dims.icon} color={iconColor} weight="bold" />
          ) : null}
        </View>
      </View>

      {(label || description) && (
        <View style={styles.textCol}>
          {label ? (
            <Text
              style={[
                styles.label,
                { fontSize: dims.label, lineHeight: dims.labelLh },
                disabled && styles.textDisabled,
              ]}
            >
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text
              style={[
                styles.description,
                { fontSize: dims.desc, lineHeight: dims.descLh },
                disabled && styles.textDisabled,
              ]}
            >
              {description}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Top-aligned so the box lines up with the first line of label/supporting text.
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, alignSelf: 'flex-start' },
  inputWrap: { paddingVertical: 2 },
  textCol: { flexShrink: 1 },
  box: {
    borderRadius: radius.sm, // 4
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Unselected — white bg, #CBD5E1 border (border.bold).
  boxUnselected: { backgroundColor: colors.surface, borderColor: colors.border },
  // Selected — brand bg + border.
  boxSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  // Intermediate — white bg, brand border (dash is brand-coloured).
  boxIntermediate: { backgroundColor: colors.surface, borderColor: colors.brand },
  // Disabled — muted bg, subtle border (icon greyed via iconColor).
  boxDisabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
  // Font size/lineHeight applied inline per size. Label #1E293B (color.text).
  label: {
    fontFamily: typography.fontFamily,
    fontWeight: '400',
    color: colors.textHeading,
  },
  // Supporting text — Body 2/Regular, #475569 (color.text.subtle).
  description: {
    fontFamily: typography.fontFamily,
    fontWeight: '400',
    color: colors.textBody,
  },
  // Disabled label + supporting text → #94A3B8 (color.text.subtlest).
  textDisabled: { color: colors.textMuted },
});

/* ========================== CheckboxGroup ========================== */

/** A single option in a CheckboxGroup. */
export interface CheckboxGroupOption {
  /** Stable identifier stored in `values`. */
  value: string;
  /** Visible label. */
  label: string;
  /** Optional supporting text under the label. */
  description?: string;
  /** Disable just this option. */
  disabled?: boolean;
}

export type CheckboxGroupLayout = 'vertical' | 'horizontal';

export interface CheckboxGroupProps {
  /** Options to render. */
  options: CheckboxGroupOption[];
  /** Selected option values (controlled). */
  values: string[];
  /** Fired with the full next selection whenever an option toggles. */
  onChange: (next: string[]) => void;
  /** Optional field label shown above the options. */
  label?: string;
  /** Append a red required asterisk after the label. */
  required?: boolean;
  /** Append "(Optional)" after the label. */
  optional?: boolean;
  /** Stack the options (`vertical`, default) or lay them in a wrapping row. */
  layout?: CheckboxGroupLayout;
  /** Size of every checkbox — `sm` (16px) or `md` (20px). Default `md`. */
  size?: CheckboxSize;
  /** Disable the whole group. */
  disabled?: boolean;
  style?: object;
}

// Gap between options per layout × size (Figma node 4076:6961, space tokens):
//   vertical   → 12 (sm) / 16 (md);  horizontal → 16 (sm) / 20 (md).
const OPTION_GAP: Record<CheckboxGroupLayout, Record<CheckboxSize, number>> = {
  vertical: { sm: 12, md: 16 },
  horizontal: { sm: 16, md: 20 },
};

/**
 * CheckboxGroup — a labelled set of checkboxes (Figma node 4076:6961). A
 * composition of {@link Checkbox}:
 *   • Optional input label: "Label" + red `*` (required) + "(Optional)".
 *   • Options laid out vertically (stack) or horizontally (wrapping row).
 *   • Small/Medium sizing flows down to every Checkbox.
 *
 * Selection is controlled via `values` / `onChange` (a string[] of selected
 * option values).
 */
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  values,
  onChange,
  label,
  required = false,
  optional = false,
  layout = 'vertical',
  size = 'md',
  disabled = false,
  style,
}) => {
  const selected = new Set(values);

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(Array.from(next));
  };

  const gap = OPTION_GAP[layout][size];

  return (
    <View style={[groupStyles.group, style]}>
      {label ? (
        <View style={groupStyles.labelRow}>
          <Text style={groupStyles.label}>{label}</Text>
          {required ? <Text style={groupStyles.required}>*</Text> : null}
          {optional ? <Text style={groupStyles.label}>(Optional)</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          layout === 'horizontal' ? groupStyles.contentRow : groupStyles.contentCol,
          { gap },
        ]}
      >
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            checked={selected.has(opt.value)}
            onChange={() => toggle(opt.value)}
            label={opt.label}
            description={opt.description}
            size={size}
            disabled={disabled || opt.disabled}
          />
        ))}
      </View>
    </View>
  );
};

const groupStyles = StyleSheet.create({
  // space-03 (8) between the label and the options block.
  group: { gap: 8, alignSelf: 'flex-start' },
  // "Label" + "*" + "(Optional)" inline.
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody, // #475569 (color.text.subtle)
  },
  required: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.dangerText, // #B91C1C (color.text.danger)
  },
  contentRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  contentCol: { flexDirection: 'column', alignItems: 'flex-start' },
});
