import React, { useState } from 'react';
import { Text, Pressable, StyleSheet, type PressableStateCallbackType } from 'react-native';
import { colors, radius, spacing, typography, noFocusOutline } from '../../theme';
import { TagCloseIcon, TagTickIcon } from './icons';

export type TagSize = 'sm' | 'md';
/** `pill` = full radius; `rounded` = 8px corners. */
export type TagShape = 'pill' | 'rounded';

export interface TagProps {
  /** Tag text. */
  label: string;
  /** `sm` (12px / body3) or `md` (14px / body2). Default `md`. */
  size?: TagSize;
  /** `pill` (full radius) or `rounded` (8px). Default `pill`. */
  shape?: TagShape;
  selected?: boolean;
  disabled?: boolean;
  /** Fired when the tag body is pressed (e.g. toggle selection). */
  onPress?: () => void;
  /** While unselected, tapping the × icon calls this (e.g. remove from a list). */
  onRemove?: () => void;
  style?: object;
}

type TagVisualState = { pressed: boolean; focused: boolean };

type PressableState = PressableStateCallbackType;

function getTagColors(selected: boolean, disabled: boolean, state: TagVisualState) {
  const { pressed, focused } = state;
  const isActive = pressed || focused;
  const selectedPressedBg = '#C1DBF1';

  if (disabled) {
    const textColor = colors.textDisabled;
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: 'transparent',
      textColor,
    };
  }

  if (selected) {
    const textColor = colors.brandPressed;
    if (isActive) {
      return {
        backgroundColor: selectedPressedBg,
        borderColor: colors.brand,
        textColor,
      };
    }
    return {
      backgroundColor: colors.surface,
      borderColor: colors.brand,
      textColor,
    };
  }

  const textColor = colors.textBody;
  if (isActive) {
    return {
      backgroundColor: colors.border,
      borderColor: 'transparent',
      textColor,
    };
  }
  return {
    backgroundColor: colors.surfaceMuted,
    borderColor: 'transparent',
    textColor,
  };
}

/**
 * Tag — selectable / removable chip. Four variants: pill or rounded (8px) × sm or md.
 * Mirrors `@atlas-ds/react` `<Tag>` states (default, hover, pressed, focus, selected).
 */
export const Tag: React.FC<TagProps> = ({
  label,
  size = 'md',
  shape = 'pill',
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const textStyle = size === 'sm' ? typography.body3 : typography.body2;
  const borderRadius = shape === 'pill' ? radius.full : radius.lg;
  const minHeight = size === 'sm' ? 24 : 28;

  const pressableStyle = (state: PressableStateCallbackType) => {
    const s = state as PressableState;
    const visual = getTagColors(selected, !!disabled, {
      pressed: s.pressed,
      focused,
    });
    return [
      styles.base,
      {
        minHeight,
        borderRadius,
        backgroundColor: visual.backgroundColor,
        borderColor: visual.borderColor,
      },
      noFocusOutline,
      style,
    ];
  };

  const renderContent = (state: PressableStateCallbackType) => {
    const s = state as PressableState;
    const visual = getTagColors(selected, !!disabled, {
      pressed: s.pressed,
      focused,
    });
    const contentColor = visual.textColor;
    return (
      <>
        <Text style={[styles.label, textStyle, { color: contentColor }]} numberOfLines={1}>
          {label}
        </Text>
        {selected ? (
          <TagTickIcon color={contentColor} />
        ) : onRemove ? (
          <Pressable
            onPress={(e) => {
              e?.stopPropagation?.();
              onRemove();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${label}`}
            disabled={disabled}
          >
            <TagCloseIcon color={contentColor} />
          </Pressable>
        ) : (
          <TagCloseIcon color={contentColor} />
        )}
      </>
    );
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={pressableStyle}
    >
      {renderContent}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontWeight: '400',
  },
});
