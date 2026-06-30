import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { MagnifyingGlass, X } from 'phosphor-react-native';
import { colors, radius, spacing, typography, noFocusOutline } from '../../theme';

const SEARCH_ICON_SIZE = 20;
const CLEAR_ICON_SIZE = 18;

/**
 * Web `--shadow-active` (typing / touch-focus state): base --shadow-xs plus a
 * 4px #F1F5F9 (--color-neutral-100) ring. This is what the web SearchBar shows
 * on focus-within — NOT the blue keyboard `--focus-ring`. The ring is spread-
 * only, so it's web-only (react-native-web boxShadow); native keeps --shadow-xs.
 */
const searchActiveRing = Platform.select({
  web: { boxShadow: `0px 1px 2px 0px rgba(10, 13, 18, 0.05), 0px 0px 0px 4px ${colors.surfaceMuted}` },
  default: {},
}) as object;

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Fired when the clear (×) button is tapped. */
  onClear?: () => void;
  disabled?: boolean;
  error?: boolean;
  /** Replace the default magnifying-glass icon (Phosphor `MagnifyingGlass`, 20px). */
  leadingIcon?: React.ReactNode;
  style?: object;
}

/**
 * SearchBar — a search input with a leading glyph and a clear button. Mirrors
 * `@atlas-ds/react` `<SearchBar>` 1:1: padding 8/12 (--spacing-sm/md), radius 8
 * (--radius-md), 1px #E2E8F0 (--color-border), --shadow-xs, 16/24 input text,
 * #94A3B8 icon/placeholder; `.filled` → #F1F5F9 bg. Built-in icons use Phosphor
 * MagnifyingGlass (leading) and X (clear). States mirror web: hover → #F8FAFC bg,
 * active/focus → --shadow-active ring (no blue keyboard ring), disabled →
 * #F1F5F9 bg/border with #CBD5E1 text/icons.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  onClear,
  disabled = false,
  error = false,
  leadingIcon,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  // Web active state (:focus-within / :active) — the gray ring, not the blue keyboard ring.
  const showActiveRing = focused && !disabled;
  // Web :hover:not(.disabled):not(.error) — neutral-hovered bg.
  const showHover = hovered && !disabled && !error;
  const borderColor = error ? colors.danger : disabled ? colors.surfaceMuted : colors.borderSubtle;
  const iconColor = disabled ? colors.textDisabled : colors.textMuted;
  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.bar,
        { borderColor },
        showHover && styles.hover,
        hasValue && !disabled && styles.filled,
        disabled && styles.disabled,
        showActiveRing && searchActiveRing,
        style,
      ]}
    >
      <View style={styles.icon}>
        {leadingIcon ?? (
          <MagnifyingGlass size={SEARCH_ICON_SIZE} color={iconColor} weight="regular" />
        )}
      </View>
      <TextInput
        style={[styles.input, disabled && { color: colors.textDisabled }, noFocusOutline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={disabled ? colors.textDisabled : colors.textMuted}
        editable={!disabled}
        {...(Platform.OS === 'web' && disabled ? { tabIndex: -1 } : null)}
        onFocus={(e) => {
          if (disabled) {
            if (Platform.OS === 'web') {
              (e.nativeEvent as { target?: { blur?: () => void } }).target?.blur?.();
            }
            return;
          }
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
      />
      {hasValue && !disabled ? (
        <Pressable
          onPress={() => {
            onClear ? onClear() : onChangeText?.('');
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clear}
        >
          <X size={CLEAR_ICON_SIZE} color={iconColor} weight="regular" />
        </Pressable>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Web: row, gap 8 (--spacing-sm), padding 8/12, radius 8 (--radius-md),
  // 1px #E2E8F0 (--color-border), #FFFFFF bg, --shadow-xs (0 1px 2px rgba(10,13,18,.05)).
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignSelf: 'stretch',
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Web :hover → --color-background-neutral-hovered (#F8FAFC).
  hover: { backgroundColor: colors.surfaceSubtle },
  // Web .filled / .disabled both use --color-background-disabled (#F1F5F9).
  filled: { backgroundColor: colors.surfaceMuted },
  disabled: { backgroundColor: colors.surfaceMuted },
  icon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  // Web .searchbar-input: --font-size-body 16 / --line-height-body 24, --color-text #1E293B.
  input: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading, paddingVertical: 0 },
  clear: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
});
