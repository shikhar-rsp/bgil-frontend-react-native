import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CaretUp, CaretDown } from 'phosphor-react-native';
import { colors, typography } from '../../theme';
import { Badge, type BadgeProps } from '../Badge';

export interface AccordionProps {
  /** Header label. */
  label: string;
  /** Badge text shown in the header (omit for no badge). */
  badgeText?: string;
  /** Badge colour. Default `emerald` (matches web). */
  badgeColor?: BadgeProps['color'];
  /** Badge size. Default `sm`. */
  badgeSize?: BadgeProps['size'];
  /** Badge variant. Default `light`. */
  badgeVariant?: BadgeProps['variant'];
  /** Interactive node rendered in the header (e.g. a Button). Does not toggle. */
  headerAction?: React.ReactNode;
  /** Disabled — non-interactive, greyed header. */
  disabled?: boolean;
  /** Open on first render. Default false. */
  defaultOpen?: boolean;
  /** Panel body. */
  children?: React.ReactNode;
  style?: object;
}

/**
 * Accordion — a single vertically-collapsing panel. A 1:1 port of
 * `@atlas-ds/react` `<Accordion>`: 48px header, 12/16 padding, 16/24 label
 * (#1E293B), header badge + action slot, rotating caret, and open/closed/
 * disabled states (closed #FFFFFF · open #F8FAFC · disabled #F1F5F9).
 */
export const Accordion: React.FC<AccordionProps> = ({
  label,
  badgeText,
  badgeColor = 'emerald',
  badgeSize = 'sm',
  badgeVariant = 'light',
  headerAction,
  disabled = false,
  defaultOpen = false,
  children,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    if (!disabled) setIsOpen((o) => !o);
  };

  return (
    <View
      style={[
        styles.accordion,
        isOpen && styles.accordionOpen,
        disabled && styles.accordionDisabled,
        style,
      ]}
    >
      <Pressable
        onPress={toggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, disabled }}
        style={(state) => {
          // react-native-web exposes `hovered` too — show the hover bg on
          // hover (web) or press, matching the design's middle (hover) row.
          const st = state as { pressed: boolean; hovered?: boolean };
          const hover = (st.pressed || st.hovered) && !disabled;
          return [
            styles.header,
            isOpen ? styles.headerOpen : styles.headerClosed,
            disabled && styles.headerDisabled,
            hover && (isOpen ? styles.headerOpenPressed : styles.headerClosedPressed),
          ];
        }}
      >
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              isOpen && styles.labelOpen,
              disabled && styles.labelDisabled,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>

        <View style={styles.badgeIconContainer}>
          {headerAction ? (
            <View style={styles.headerActionSlot}>{headerAction}</View>
          ) : null}
          {badgeText && !disabled ? (
            <Badge label={badgeText} color={badgeColor} size={badgeSize} variant={badgeVariant} />
          ) : null}
          <View style={styles.iconContainer}>
            {isOpen ? (
              <CaretUp
                size={20}
                color={disabled ? colors.textDisabled : colors.textBody}
              />
            ) : (
              <CaretDown
                size={20}
                color={disabled ? colors.textDisabled : colors.textBody}
              />
            )}
          </View>
        </View>
      </Pressable>

      {isOpen ? (
        <View style={styles.content}>
          {typeof children === 'string' ? (
            <Text style={styles.body}>{children}</Text>
          ) : (
            children
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container — full width, column.
  accordion: { width: '100%', alignSelf: 'stretch' },
  accordionOpen: {},
  accordionDisabled: {},

  // Header — min-height 48, padding 12/16, space-between, gap 16.
  header: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerClosed: { backgroundColor: colors.surface },        // #FFFFFF
  headerOpen: { backgroundColor: colors.surfaceSubtle },     // #F8FAFC
  headerDisabled: { backgroundColor: colors.surfaceMuted },  // #F1F5F9
  headerClosedPressed: { backgroundColor: colors.surfaceSubtle }, // hover #F8FAFC
  headerOpenPressed: { backgroundColor: colors.surfaceMuted },    // hover #F1F5F9

  labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  // Label — 14 / 20 / #1E293B; weight 400 closed, 500 open.
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textHeading,
    flex: 1,
  },
  labelOpen: { fontWeight: '500' },
  labelDisabled: { color: colors.textDisabled }, // #CBD5E1

  badgeIconContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerActionSlot: { flexDirection: 'row', alignItems: 'center' },

  // Icon container — 32×32 (Phosphor caret).
  iconContainer: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },

  // Content — no background tint or inner padding (mirrors web; only the
  // header is tinted when open). Consumers/string-children supply padding.
  content: {},
  body: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
});
