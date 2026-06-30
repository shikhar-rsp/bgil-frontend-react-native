import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { colors, radius, spacing, typography, noFocusOutline, inputShadowDefault, inputShadowFocus } from '../../theme';

const FOCUS_RING = '#F1F5F9'; // gray-100

export interface TextAreaProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  /** Read-only — value visible but not editable; no focus ring. */
  readOnly?: boolean;
  /** Visible rows (min height). Default 4. */
  rows?: number;
  /** Max characters — shows a counter when set. */
  maxLength?: number;
  style?: object;
}

/**
 * TextArea — multiline input with helper/error states and an optional
 * character counter. Field chrome (border, padding, shadow) lives on the
 * TextInput — same pattern as Textfield.
 */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  disabled = false,
  readOnly = false,
  rows = 4,
  maxLength,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const isInactive = disabled || readOnly;
  const hasValue = !!value?.length;
  const showFocusShadow = focused && !isInactive;
  const inputShadow = showFocusShadow ? inputShadowFocus : inputShadowDefault;
  const borderColor = error
    ? '#F87171'
    : isInactive
    ? colors.surfaceMuted
    : hasValue
    ? colors.border
    : colors.borderSubtle;

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputShell} pointerEvents={disabled ? 'none' : 'auto'}>
        {/* Grey focus ring — 4px gray-100 frame behind the textarea */}
        {showFocusShadow && <View pointerEvents="none" style={styles.activeRing} />}
        {disabled ? (
          // Disabled: render a static look-alike (no TextInput) so the field is
          // impossible to tap, focus, or type into on any platform — `editable`
          // alone still leaves the field focusable on react-native-web.
          <View
            style={[styles.input, styles.inputDisplay, { borderColor, minHeight: rows * 22 }, inputShadow, styles.inputInactive]}
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
              { borderColor, minHeight: rows * 22 },
              inputShadow,
              readOnly && styles.inputInactive,
              noFocusOutline,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            readOnly={readOnly}
            multiline
            textAlignVertical="top"
            maxLength={maxLength}
            onFocus={() => {
              if (readOnly) return;
              setFocused(true);
            }}
            onBlur={() => setFocused(false)}
            {...(Platform.OS === 'android' ? { includeFontPadding: false } : null)}
          />
        )}
      </View>
      <View style={styles.footer}>
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
        ) : (
          <View />
        )}
        {maxLength ? (
          <Text style={[styles.counter, isInactive && styles.counterInactive]}>
            {(value?.length ?? 0)}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 8, alignSelf: 'stretch' },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textBody },
  inputShell: { position: 'relative', alignSelf: 'stretch' },
  // The grey focus ring: a gray-100 rounded frame inset by -4 behind the opaque textarea box.
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
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  inputInactive: {
    color: colors.textMuted,
    backgroundColor: colors.surface,
  },
  // Disabled look-alike box + its text (mirrors the TextInput's type ramp).
  inputDisplay: { justifyContent: 'flex-start' },
  inputText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  placeholderText: { color: colors.textMuted },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  helper: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  helperInactive: { color: colors.textDisabled },
  errorText: { color: colors.danger },
  counter: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  counterInactive: { color: colors.textDisabled },
});
