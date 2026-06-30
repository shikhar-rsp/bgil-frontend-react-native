import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export type CardVariant = 'horizontal' | 'vertical';

export interface CardProps {
  /** Layout — `horizontal` (media left of content) or `vertical` (media on top, centred). Default `horizontal`. */
  variant?: CardVariant;
  /** Title (Body L / 600). */
  title?: string;
  /** Supporting description (Body S, subtle). */
  description?: string;
  /** Media slot — icon/image shown in the grey media box. */
  media?: React.ReactNode;
  /** Selected state — blue-50 bg, brand border + text. */
  selected?: boolean;
  disabled?: boolean;
  /** Makes the whole card pressable. */
  onPress?: () => void;
  /** Custom content (overrides title/description). */
  children?: React.ReactNode;
  style?: object;
}

/**
 * Card — a selectable media card. Mirrors `@atlas-ds/react` `<Card>` /
 * `<CardMedia>` / `<CardContent>`: horizontal/vertical layout, a grey media box
 * (48px horizontal / 64px vertical), title + description, and selected/disabled
 * states (selected = #E8F4FF bg, #005DAC border + text). Full width (responsive).
 */
export const Card: React.FC<CardProps> = ({
  variant = 'horizontal',
  title,
  description,
  media,
  selected = false,
  disabled = false,
  onPress,
  children,
  style,
}) => {
  const vertical = variant === 'vertical';
  const Wrapper: React.ComponentType<any> = onPress && !disabled ? Pressable : View;

  const titleColor = disabled ? colors.textMuted : selected ? colors.brand : colors.textHeading;
  const descColor = disabled ? colors.textMuted : selected ? colors.brand : colors.textBody;

  return (
    <Wrapper
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.card,
        vertical ? styles.vertical : styles.horizontal,
        selected ? styles.selected : styles.idle,
        disabled && styles.disabled,
        style,
      ]}
    >
      {media != null ? (
        <View style={[styles.media, vertical ? styles.mediaVertical : styles.mediaHorizontal]}>{media}</View>
      ) : null}

      {children ?? (
        <View style={[styles.content, vertical && styles.contentVertical]}>
          {title ? (
            <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text style={[styles.description, { color: descColor }]} numberOfLines={3}>
              {description}
            </Text>
          ) : null}
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  // Web: padding 12, gap 16, radius 8, 1px border, overflow hidden.
  card: {
    padding: spacing.md, // 12
    gap: spacing.lg, // 16
    borderRadius: radius.lg, // 8
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  horizontal: { flexDirection: 'row', alignItems: 'flex-start' },
  vertical: { flexDirection: 'column', alignItems: 'center' },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  // Web selected: blue-50 bg, brand border.
  selected: { backgroundColor: colors.brandSubtle, borderColor: colors.brand },
  // Web disabled: subtle bg, #E2E8F0 border.
  disabled: { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
  // Web media: neutral-100 bg, radius 6; 48 horizontal / 64 vertical.
  media: { flexShrink: 0, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  mediaHorizontal: { width: 48, height: 48 },
  mediaVertical: { width: 64, height: 64, marginBottom: spacing.xs },
  // Web content: flex 1, column, gap 4.
  content: { flex: 1, flexDirection: 'column', gap: spacing.xs, minWidth: 0 },
  contentVertical: { alignItems: 'center' },
  title: { fontFamily: typography.fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  description: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20 },
});
