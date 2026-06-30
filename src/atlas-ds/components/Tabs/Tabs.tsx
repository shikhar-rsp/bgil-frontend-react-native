import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

export type TabsSize = 'sm' | 'md';
export type TabsVariant = 'primary' | 'secondary';
export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabItem {
  label: string;
  value: string;
  /** Icon rendered to the LEFT of the label (size ~16, tint to match text). */
  leftIcon?: React.ReactNode;
  /** Icon rendered to the RIGHT of the label/badge (e.g. X, caret). */
  rightIcon?: React.ReactNode;
  /** Optional count badge after the label. */
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Selected value (controlled). */
  value: string;
  onChange?: (value: string) => void;
  /** `sm` or `md`. Default `md`. */
  size?: TabsSize;
  /** `primary` (blue-tint selected) or `secondary` (white selected). Default `primary`. */
  variant?: TabsVariant;
  /** `horizontal` (underline) or `vertical` (left bar). Default `horizontal`. */
  orientation?: TabsOrientation;
  style?: object;
}

/**
 * Tabs — mirrors `@atlas-ds/react` tabs. Primary selected tab is blue-tinted
 * (#E8F4FF), secondary selected is white; both show #004E91 text and a #005DAC
 * indicator (bottom border when horizontal, left border when vertical) over a
 * #E2E8F0 baseline. Optional left/right icons and a count badge per tab.
 * sm/md sizes. Horizontal tabs scroll on overflow.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  size = 'md',
  variant = 'primary',
  orientation = 'horizontal',
  style,
}) => {
  const lineW = size === 'md' ? 2 : 1;
  const vertical = orientation === 'vertical';

  const renderTab = (tab: TabItem) => {
    const active = tab.value === value;
    const indicatorColor = active ? colors.brand : colors.borderSubtle;
    const bg = active ? (variant === 'primary' ? colors.brandSubtle : colors.surface) : colors.surface;
    return (
      <Pressable
        key={tab.value}
        onPress={() => !tab.disabled && onChange?.(tab.value)}
        disabled={tab.disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected: active, disabled: tab.disabled }}
        style={[
          styles.tab,
          size === 'md' ? styles.tabMd : styles.tabSm,
          vertical ? styles.tabVertical : styles.tabHorizontal,
          { backgroundColor: bg },
          tab.disabled && styles.tabDisabled,
          vertical
            ? { marginLeft: -lineW, borderLeftWidth: lineW, borderLeftColor: indicatorColor }
            : { marginBottom: -lineW, borderBottomWidth: lineW, borderBottomColor: indicatorColor },
        ]}
      >
        {tab.leftIcon != null ? <View style={styles.icon}>{tab.leftIcon}</View> : null}
        <Text
          style={[
            size === 'md' ? styles.labelMd : styles.labelSm,
            { color: tab.disabled ? colors.textDisabled : active ? colors.brandPressed : colors.textBody },
          ]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
        {tab.badge != null ? (
          <View style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>
              {tab.badge}
            </Text>
          </View>
        ) : null}
        {tab.rightIcon != null ? <View style={styles.icon}>{tab.rightIcon}</View> : null}
      </Pressable>
    );
  };

  if (vertical) {
    return (
      <View style={[styles.listVertical, { borderLeftWidth: lineW }, style]} accessibilityRole="tablist">
        {tabs.map(renderTab)}
      </View>
    );
  }

  // Horizontal: the grey baseline lives on the scrolling row (the tabs' direct
  // parent) — with flexGrow:1 it spans the full width when tabs are narrow and
  // extends with the content when they overflow. Putting it here (not on the
  // outer View) lets each active tab's brand bottom-border overlap it, so the
  // selected underline actually shows — same overlap the vertical bar relies on.
  return (
    <View style={[styles.list, style]} accessibilityRole="tablist">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, { borderBottomWidth: lineW }]}>
        {tabs.map(renderTab)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Horizontal list wrapper — full width; the baseline is on the row below.
  list: { alignSelf: 'stretch' },
  // Scrolling row carries the grey baseline; flexGrow fills the viewport width.
  row: { flexDirection: 'row', gap: 8, flexGrow: 1, borderBottomColor: colors.borderSubtle },
  // Vertical list: column, grey left baseline.
  listVertical: { alignSelf: 'stretch', borderLeftColor: colors.borderSubtle, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tabHorizontal: { justifyContent: 'center', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tabVertical: { justifyContent: 'flex-start', borderTopRightRadius: 8, borderBottomRightRadius: 8, alignSelf: 'stretch' },
  tabDisabled: { opacity: 1 },
  // Web md: min-width 116, height 48, padding 12/16, font 16. sm: 96, 36, 8/12, 14.
  tabMd: { minWidth: 116, height: 48, paddingHorizontal: 16 },
  tabSm: { minWidth: 96, height: 36, paddingHorizontal: 12 },
  labelMd: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '400' },
  labelSm: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '400' },
  icon: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  // Badge — pill (radius 16, px 8). Active: brand bg / white. Inactive: #F1F5F9 / #1E293B.
  badge: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 0, alignItems: 'center', justifyContent: 'center' },
  badgeActive: { backgroundColor: colors.brand },
  badgeInactive: { backgroundColor: colors.surfaceMuted },
  badgeText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  badgeTextActive: { color: '#FFFFFF' },
  badgeTextInactive: { color: colors.textHeading },
});
