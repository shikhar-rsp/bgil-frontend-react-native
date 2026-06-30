import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions, Platform } from 'react-native';
import { CaretDown, Info } from 'phosphor-react-native';
import { colors, radius, spacing, typography, noFocusOutline, inputShadowDefault, inputShadowFocus } from '../../theme';

const FOCUS_RING = '#F1F5F9'; // gray-100

export interface TextfieldProps {
  /** Field label above the input. */
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Helper text below the field. */
  helper?: string;
  /** Error message — turns the border red and replaces the helper. */
  error?: string;
  disabled?: boolean;
  /** Read-only — value visible but not editable; no focus ring. */
  readOnly?: boolean;
  /** Icon inside the field, left / right (recommended 18×18). */
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  /** Renders a down-caret trailing icon for read-only select/dropdown triggers. */
  dropdown?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  style?: object;
}

/**
 * Textfield — labelled single-line input with helper/error states and
 * leading/trailing icons. Mirrors `@atlas-ds/react` text input.
 */
export const Textfield: React.FC<TextfieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  disabled = false,
  readOnly = false,
  leadingIcon,
  trailingIcon,
  dropdown = false,
  keyboardType = 'default' as KeyboardTypeOptions,
  secureTextEntry,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const isInactive = disabled || readOnly;
  const hasValue = !!value?.length;
  const showFocusShadow = focused && !isInactive;
  const inputShadow = showFocusShadow ? inputShadowFocus : inputShadowDefault;
  const borderColor = error
    ? '#F87171' // web --error border (red-400)
    : isInactive
    ? colors.surfaceMuted
    : hasValue
    ? colors.border
    : colors.borderSubtle;
  const resolvedTrailingIcon =
    trailingIcon ??
    (dropdown ? (
      <CaretDown
        size={18}
        color={disabled ? colors.textDisabled : colors.textBody}
        weight="regular"
      />
    ) : error ? (
      // Error state carries a red Info glyph per Figma (node 2318:4091).
      <Info size={18} color={colors.danger} weight="regular" />
    ) : undefined);
  const iconInset = 18 + spacing.sm; // icon width + gap
  const inputPadding = {
    paddingLeft: leadingIcon ? spacing.md + iconInset : spacing.md,
    paddingRight: resolvedTrailingIcon ? spacing.md + iconInset : spacing.md,
  };
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputShell} pointerEvents={disabled ? 'none' : 'auto'}>
        {/* Grey focus ring — 4px gray-100 frame behind the input */}
        {showFocusShadow && <View pointerEvents="none" style={styles.activeRing} />}
        {leadingIcon ? (
          <View style={styles.iconLeading} pointerEvents="none">
            {leadingIcon}
          </View>
        ) : null}
        {disabled ? (
          // Disabled: render a static look-alike (no TextInput) so the field is
          // impossible to tap, focus, or type into on any platform — `editable`
          // alone still leaves the field focusable on react-native-web.
          <View
            style={[
              styles.input,
              styles.inputDisplay,
              inputPadding,
              { borderColor },
              inputShadow,
              styles.inputInactive,
            ]}
            accessibilityState={{ disabled: true }}
          >
            <Text style={[styles.inputText, !hasValue && styles.placeholderText]}>
              {hasValue ? value : placeholder}
            </Text>
          </View>
        ) : (
          <TextInput
            style={[
              styles.input,
              inputPadding,
              { borderColor },
              inputShadow,
              isInactive && styles.inputInactive,
              noFocusOutline,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            readOnly={readOnly}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            textAlignVertical="center"
            onFocus={() => {
              if (readOnly) return;
              setFocused(true);
            }}
            onBlur={() => setFocused(false)}
            {...(Platform.OS === 'android' ? { includeFontPadding: false } : null)}
          />
        )}
        {resolvedTrailingIcon ? (
          <View style={styles.iconTrailing} pointerEvents="none">
            {resolvedTrailingIcon}
          </View>
        ) : null}
      </View>
      {(error || helper) ? (
        <Text
          style={[
            styles.helper,
            error && styles.errorText,
            !error && isInactive && styles.helperInactive,
          ]}
        >
          {error || helper}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Web --otp/dropdown-input label: 14px / 400 / #475569.
  wrap: { gap: 8, alignSelf: 'stretch' },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textBody },
  // Layout shell only — border/padding/bg live on the TextInput so the full field is focusable.
  inputShell: { position: 'relative', alignSelf: 'stretch' },
  // The grey focus ring: a gray-100 rounded frame inset by -4 behind the opaque input box.
  activeRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12, // 8 (box) + 4 (ring)
    backgroundColor: FOCUS_RING,
    ...Platform.select({
      web: { boxShadow: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)' },
      default: {
        shadowColor: '#0A0D12',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  // Web field: height 40, zero vertical padding, border 1px #CBD5E1, radius 8.
  // No oversized lineHeight — that pushes the glyph to the bottom of the line
  // box on a TextInput (gap above the text). Centring is done by height +
  // textAlignVertical:'center' (+ includeFontPadding:false on Android).
  input: {
    alignSelf: 'stretch',
    height: 40,
    borderWidth: 1,
    borderRadius: radius.lg, // 8
    paddingVertical: 0,
    backgroundColor: colors.surface,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textHeading,
  },
  inputInactive: {
    color: colors.textMuted,
    backgroundColor: colors.surface,
  },
  // Disabled look-alike box + its text (mirrors the TextInput's type ramp).
  inputDisplay: { justifyContent: 'center' },
  inputText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  placeholderText: { color: colors.textMuted },
  iconLeading: {
    position: 'absolute',
    left: spacing.md,
    top: 0,
    bottom: 0,
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconTrailing: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  helper: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  helperInactive: { color: colors.textDisabled },
  errorText: { color: colors.danger },
});
