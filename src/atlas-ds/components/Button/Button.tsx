import React from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { Spinner } from '../Spinner';

export type ButtonVariant =
  | 'primary'
  | 'primaryDestructive'
  | 'secondary'
  | 'secondaryGray'
  | 'secondaryDestructive'
  | 'tertiary'
  | 'tertiaryGray'
  | 'tertiaryDestructive'
  | 'link'
  | 'linkGray'
  | 'linkDestructive';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  /** Button text. */
  label: string;
  onPress?: () => void;
  /** Visual style. Default `primary`. */
  variant?: ButtonVariant;
  /** Size. Default `md`. */
  size?: ButtonSize;
  /** Stretch to fill the parent width. */
  fullWidth?: boolean;
  /** Show a spinner and block presses. */
  loading?: boolean;
  disabled?: boolean;
  /** Render the pressed/active visual statically (for the active state). */
  active?: boolean;
  /** Icon-only square button — the `label` becomes the accessibility label. */
  iconOnly?: boolean;
  /** Icon before / after the label (recommended 18×18). */
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: object;
  /** Override label typography (e.g. CoachMark footer uses body3 / 12px). */
  labelStyle?: object;
}

const SIZES: Record<ButtonSize, { h: number; px: number; font: number }> = {
  sm: { h: 32, px: 12, font: 14 },
  md: { h: 40, px: 16, font: 14 },
  lg: { h: 48, px: 20, font: 16 },
  xl: { h: 56, px: 24, font: 16 },
};

// [bg, border, text] per variant, mapped to Figma button tokens (node 70:991):
//   • brand filled  → bg color.background.brand #005DAC, text color.text.inverse #FFF
//   • brand outline/text → border color.border.brand #005DAC, text color.text.brand.default #004E91
//   • neutral → border color.border.bold #CBD5E1, text color.text.subtle #475569
//   • danger filled → bg color.background.danger.bold #DC2626, text inverse
//   • danger outline/text → border color.border.danger #DC2626, text color.text.danger #B91C1C
// `null` bg/border = transparent.
const VARIANTS: Record<ButtonVariant, { bg: string | null; border: string | null; text: string; pressed: string; link?: boolean }> = {
  primary:              { bg: colors.brand,   border: null,         text: colors.textOnBrand,  pressed: colors.brandPressed },
  primaryDestructive:   { bg: colors.danger,  border: null,         text: colors.textOnBrand,  pressed: colors.dangerText },
  secondary:            { bg: null, border: colors.brand,  text: colors.brandPressed, pressed: '#EFF6FF' },
  secondaryGray:        { bg: null, border: colors.border, text: colors.textBody,     pressed: colors.surfaceSubtle },
  secondaryDestructive: { bg: null, border: colors.danger, text: colors.dangerText,   pressed: '#FEF2F2' },
  tertiary:             { bg: null, border: null, text: colors.brandPressed, pressed: '#EFF6FF' },
  tertiaryGray:         { bg: null, border: null, text: colors.textBody,     pressed: colors.surfaceSubtle },
  tertiaryDestructive:  { bg: null, border: null, text: colors.dangerText,   pressed: '#FEF2F2' },
  link:                 { bg: null, border: null, text: colors.brandPressed, pressed: 'transparent', link: true },
  linkGray:             { bg: null, border: null, text: colors.textBody,     pressed: 'transparent', link: true },
  linkDestructive:      { bg: null, border: null, text: colors.dangerText,   pressed: 'transparent', link: true },
};

/**
 * Button — full variant/size matrix mirroring `@atlas-ds/react` `<Button>`:
 * primary/secondary/tertiary/link in brand/gray/destructive tones, sm–xl
 * sizes, full-width, loading and disabled states, plus leading/trailing icons.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  active = false,
  iconOnly = false,
  leadingIcon,
  trailingIcon,
  style,
  labelStyle,
}) => {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const blockPress = disabled || loading;
  // Disabled is a token-driven STATE (grey), not opacity. Loading stays full
  // colour (Figma loading = filled button + spinner), so only `disabled` skins.
  const showDisabled = disabled;
  // Per Figma: disabled filled → bg #F1F5F9; disabled outlined → border #F1F5F9;
  // disabled text/link → transparent. Text/icon colour → color.text.disabled.
  const disabledSkin = showDisabled
    ? v.bg
      ? styles.disabledFilled
      : v.border
      ? styles.disabledOutlined
      : styles.disabledGhost
    : null;
  const textColor = showDisabled ? colors.textDisabled : v.text;
  return (
    <Pressable
      onPress={() => !blockPress && onPress?.()}
      disabled={blockPress}
      accessibilityRole="button"
      accessibilityLabel={iconOnly ? label : undefined}
      accessibilityState={{ disabled: blockPress, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        v.link ? styles.linkBase : { height: s.h, paddingHorizontal: s.px },
        // Icon-only is square — width matches the size's height, no extra padding.
        iconOnly && !v.link ? { width: s.h, paddingHorizontal: 0 } : null,
        v.bg ? { backgroundColor: v.bg } : null,
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        fullWidth && styles.fullWidth,
        (pressed || active) && !v.link && !showDisabled ? { backgroundColor: v.pressed } : null,
        disabledSkin,
        style,
      ]}
    >
      {loading ? (
        // Loading keeps the full-colour button + the DS spinner tinted to the
        // variant's text colour (Figma loading state). Size tracks the label.
        <Spinner size={s.font >= 16 ? 20 : 16} color={v.text} />
      ) : iconOnly ? (
        <View style={styles.icon}>{leadingIcon ?? trailingIcon}</View>
      ) : (
        <View style={styles.content}>
          {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
          <Text style={[styles.label, { color: textColor, fontSize: s.font }, v.link && styles.linkText, labelStyle]}>
            {label}
          </Text>
          {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg, // 8
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  linkBase: { paddingHorizontal: 0, paddingVertical: 2, alignSelf: 'flex-start' },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  // Disabled state — Figma tokens (not opacity). Text/icon use color.text.disabled.
  disabledFilled: { backgroundColor: colors.surfaceMuted, borderWidth: 0 }, // bg #F1F5F9
  disabledOutlined: { borderColor: colors.surfaceMuted }, // border.disabled #F1F5F9
  disabledGhost: { backgroundColor: 'transparent' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: typography.fontFamily, fontWeight: '500', lineHeight: 20 },
  linkText: { textDecorationLine: 'underline' },
});
