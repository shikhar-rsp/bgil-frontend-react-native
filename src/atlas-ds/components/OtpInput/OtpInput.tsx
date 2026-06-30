import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, type TextInputProps } from 'react-native';
import { colors, radius, spacing, typography, noFocusOutline, inputShadowDefault, inputShadowFocus } from '../../theme';

const FOCUS_RING = '#F1F5F9'; // gray-100

const BOX_SIZE = 40;
const BOX_GAP = 12;

type OtpDigitRef = React.ElementRef<typeof TextInput>;

/** forwardRef shim — RN TextInput types omit `ref`, but runtime supports it. */
const OtpDigit = React.forwardRef<OtpDigitRef, TextInputProps>(function OtpDigit(props, ref) {
  return <TextInput {...props} ref={ref as never} />;
});

export interface OtpInputProps {
  /** Number of digits. Default 6. */
  length?: number;
  /** Current value (controlled). */
  value: string;
  /** Fired with the new concatenated value. */
  onChange?: (value: string) => void;
  /** Field label above the boxes. */
  label?: string;
  /** Helper text below the boxes. */
  helper?: string;
  /** Error message — turns borders red and replaces the helper. */
  error?: string;
  /** Footer link action — e.g. resend code. */
  onResend?: () => void;
  /** Label for the footer link. Default "Resend OTP". */
  resendLabel?: string;
  disabled?: boolean;
  style?: object;
}

/**
 * OtpInput — a row of single-digit boxes for one-time codes. Mirrors
 * `@atlas-ds/react` `<OtpInput>`. Auto-advances and supports backspace.
 */
export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  label,
  helper,
  error,
  onResend,
  resendLabel = 'Resend OTP',
  disabled = false,
  style,
}) => {
  const refs = useRef<Array<OtpDigitRef | null>>([]);
  const [focused, setFocused] = useState(-1);
  const slots = value.padEnd(length, ' ').slice(0, length).split('');
  const charAt = (i: number) => (slots[i] === ' ' ? '' : slots[i]);
  const hasError = !!error;
  const showFooter = !!(error || helper || onResend);
  const fieldMaxWidth = length * BOX_SIZE + (length - 1) * BOX_GAP;

  const setAt = (i: number, ch: string) => {
    const clean = ch.replace(/[^0-9]/g, '').slice(-1);
    const arr = [...slots];
    arr[i] = clean || ' ';
    onChange?.(arr.join('').replace(/\s+$/g, ''));
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, key: string) => {
    if (key === 'Backspace' && !charAt(i) && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.fieldBody, { maxWidth: fieldMaxWidth }]}>
      <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const ch = charAt(i);
        const hasDigit = ch.length > 0;
        const isFocused = focused === i;
        const showFocusShadow = isFocused && !disabled;
        const inputShadow = showFocusShadow ? inputShadowFocus : inputShadowDefault;
        // Figma: Active (focused) and Filled boxes both use the bold #CBD5E1
        // border; only the empty/resting Default box uses the lighter #E2E8F0.
        const borderColor = hasError
          ? '#F87171'
          : disabled
          ? colors.surfaceMuted
          : hasDigit || isFocused
          ? colors.border
          : colors.borderSubtle;
        const backgroundColor = colors.surface;

        return (
          <View key={i} style={styles.boxWrapper}>
            {/* Grey focus ring — 4px gray-100 frame behind the box */}
            {showFocusShadow && <View pointerEvents="none" style={styles.activeRing} />}
            <OtpDigit
              ref={(r) => {
                refs.current[i] = r;
              }}
              style={[
                styles.box,
                { borderColor, backgroundColor },
                inputShadow,
                disabled && styles.disabled,
                noFocusOutline,
              ]}
              value={ch}
              onChangeText={(t) => setAt(i, t)}
              onKeyPress={({ nativeEvent }) => onKey(i, nativeEvent.key)}
              onFocus={(e) => {
                if (disabled) {
                  if (Platform.OS === 'web') {
                    (e.nativeEvent as { target?: { blur?: () => void } }).target?.blur?.();
                  }
                  return;
                }
                setFocused(i);
              }}
              onBlur={() => setFocused(-1)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!disabled}
              textAlignVertical="center"
              selectTextOnFocus
              {...(Platform.OS === 'android' ? { includeFontPadding: false } : null)}
              {...(Platform.OS === 'web' && disabled ? { tabIndex: -1 } : null)}
            />
          </View>
        );
      })}
      </View>
      {showFooter ? (
        <View style={styles.footer}>
          {(error || helper) ? (
            <Text
              style={[
                styles.helper,
                styles.footerHint,
                hasError && styles.errorText,
                !hasError && disabled && styles.helperInactive,
              ]}
            >
              {error || helper}
            </Text>
          ) : null}
          {onResend ? (
            <Pressable
              onPress={onResend}
              disabled={disabled}
              hitSlop={6}
              accessibilityRole="link"
            >
              <Text style={[styles.cta, disabled && styles.ctaDisabled]}>{resendLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 8, alignSelf: 'stretch' },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textBody },
  // Width caps at digit count × box size so footer aligns with the last box.
  fieldBody: { alignSelf: 'flex-start', width: '100%', gap: 8 },
  // Web .otp-group: left-aligned row, no wrap; boxes flex up to 40×40.
  row: {
    flexDirection: 'row',
    gap: BOX_GAP,
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
  },
  // Wrapper for each OTP box with relative positioning for the focus ring.
  boxWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    maxWidth: BOX_SIZE,
    height: BOX_SIZE,
  },
  // The grey focus ring: a gray-100 rounded frame inset by -4 behind the box.
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
  box: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderRadius: radius.lg, // 8px
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    textAlign: 'center',
    // Vertical centring via textAlignVertical:'center' + includeFontPadding:false
    // (set on the input). No lineHeight: an oversized one drops the digit to the
    // bottom of the line box on a TextInput.
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textBody, // Figma Heading 2 / color.text.subtle #475569
    ...(Platform.OS === 'web' ? { boxSizing: 'border-box' as const } : null),
  },
  disabled: { color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  helper: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  footerHint: { flex: 1, flexShrink: 1 },
  helperInactive: { color: colors.textDisabled },
  errorText: { color: colors.danger },
  cta: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.brand,
  },
  ctaDisabled: { color: colors.textDisabled },
});
