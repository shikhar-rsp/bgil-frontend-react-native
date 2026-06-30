import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

export type RadioSize = 'sm' | 'md';

// Figma sizes: Small 16px ring / 14px label, Medium 20px ring / 16px label.
// Supporting text is Body 2/Regular (14/20) in both. Dot scales with the ring.
const DIMS: Record<RadioSize, { ring: number; dot: number; label: number; labelLh: number; desc: number; descLh: number }> = {
  sm: { ring: 16, dot: 6, label: 14, labelLh: 20, desc: 14, descLh: 20 },
  md: { ring: 20, dot: 8, label: 16, labelLh: 24, desc: 14, descLh: 20 },
};

export interface RadioProps {
  /** Selected state (controlled). */
  selected: boolean;
  /** Fired when pressed. */
  onPress?: () => void;
  /** Optional label to the right. */
  label?: string;
  /** Supporting text shown under the label. */
  description?: string;
  /** Ring size — `sm` (16px) or `md` (20px). Default `md`. */
  size?: RadioSize;
  /** Disable interaction + dim. */
  disabled?: boolean;
  style?: object;
}

/**
 * Radio — circular ring with a filled inner dot when selected. Mirrors Figma
 * node 2476:18706 (size Small/Medium × Unselected/Selected × Default/Disabled).
 *
 * Per Figma (tokens):
 *   • Unselected — white bg, #E2E8F0 (color.border) ring.
 *   • Selected   — white bg, #005DAC (brand) ring + brand inner dot.
 *   • Disabled   — #F1F5F9 (surfaceMuted) bg, #E2E8F0 (borderSubtle) ring,
 *                  #CBD5E1 (textDisabled) dot.
 */
export const Radio: React.FC<RadioProps> = ({
  selected,
  onPress,
  label,
  description,
  size = 'md',
  disabled = false,
  style,
}) => {
  const dims = DIMS[size];

  const ringColorStyle = disabled
    ? styles.ringDisabled
    : selected
      ? styles.ringSelected
      : styles.ringUnselected;
  const dotColor = disabled ? colors.textDisabled : colors.brand;

  return (
    <Pressable
      style={[styles.row, style]}
      onPress={() => !disabled && onPress?.()}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
    >
      {/* 2px vertical padding aligns the ring with the first text line. */}
      <View style={styles.inputWrap}>
        <View
          style={[
            styles.ring,
            { width: dims.ring, height: dims.ring, borderRadius: dims.ring / 2 },
            ringColorStyle,
          ]}
        >
          {selected ? (
            <View style={{ width: dims.dot, height: dims.dot, borderRadius: dims.dot / 2, backgroundColor: dotColor }} />
          ) : null}
        </View>
      </View>

      {(label || description) && (
        <View style={styles.textCol}>
          {label ? (
            <Text
              style={[styles.label, { fontSize: dims.label, lineHeight: dims.labelLh }, disabled && styles.textDisabled]}
            >
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text
              style={[styles.description, { fontSize: dims.desc, lineHeight: dims.descLh }, disabled && styles.textDisabled]}
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
  // Top-aligned so the ring lines up with the first line of label/supporting text.
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, alignSelf: 'flex-start' },
  inputWrap: { paddingVertical: 2 },
  textCol: { flexShrink: 1 },
  ring: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Unselected — white bg, #E2E8F0 (color.border) ring.
  ringUnselected: { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
  // Selected — white bg, brand ring (dot is brand-coloured).
  ringSelected: { backgroundColor: colors.surface, borderColor: colors.brand },
  // Disabled — muted bg, subtle border (dot greyed via dotColor).
  ringDisabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
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

/* ============================ RadioGroup ============================ */

/** A single option in a RadioGroup. */
export interface RadioGroupOption {
  /** Stable identifier stored as the group's value. */
  value: string;
  /** Visible label. */
  label: string;
  /** Optional supporting text under the label. */
  description?: string;
  /** Disable just this option. */
  disabled?: boolean;
}

export type RadioGroupLayout = 'vertical' | 'horizontal';

export interface RadioGroupProps {
  /** Options to render. */
  options: RadioGroupOption[];
  /** Selected option value (controlled). `null`/`undefined` for none. */
  value?: string | null;
  /** Fired with the newly selected value. */
  onChange: (value: string) => void;
  /** Optional field label shown above the options. */
  label?: string;
  /** Append a red required asterisk after the label. */
  required?: boolean;
  /** Append "(Optional)" after the label. */
  optional?: boolean;
  /** Stack the options (`vertical`, default) or lay them in a wrapping row. */
  layout?: RadioGroupLayout;
  /** Size of every radio — `sm` (16px) or `md` (20px). Default `md`. */
  size?: RadioSize;
  /** Disable the whole group. */
  disabled?: boolean;
  style?: object;
}

// Gap between options per layout × size (mirrors CheckboxGroup):
//   vertical → 12 (sm) / 16 (md);  horizontal → 16 (sm) / 20 (md).
const OPTION_GAP: Record<RadioGroupLayout, Record<RadioSize, number>> = {
  vertical: { sm: 12, md: 16 },
  horizontal: { sm: 16, md: 20 },
};

/**
 * RadioGroup — a labelled, single-select set of radios. A composition of
 * {@link Radio} mirroring CheckboxGroup:
 *   • Optional input label: "Label" + red `*` (required) + "(Optional)".
 *   • Options laid out vertically (stack) or horizontally (wrapping row).
 *   • Small/Medium sizing flows down to every Radio.
 *
 * Selection is controlled via `value` / `onChange`.
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
  required = false,
  optional = false,
  layout = 'vertical',
  size = 'md',
  disabled = false,
  style,
}) => {
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
        style={[layout === 'horizontal' ? groupStyles.contentRow : groupStyles.contentCol, { gap }]}
        accessibilityRole="radiogroup"
      >
        {options.map((opt) => (
          <Radio
            key={opt.value}
            selected={opt.value === value}
            onPress={() => onChange(opt.value)}
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
