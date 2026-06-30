import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

/** A tab inside the notifications header. */
export interface NotificationTab {
  /** Stable identifier passed to onTabChange. */
  key: string;
  /** Visible label (e.g. "All", "General", "Updates"). */
  label: string;
  /** Optional count badge — hides when undefined/0. */
  count?: number;
}

export interface NotificationsBaseProps {
  /** Screen title — default "Notifications". */
  title?: string;
  /**
   * Tap handler for the back button. When undefined the back affordance is
   * hidden, so the same component can be used inside a Bottom Sheet or
   * a screen that has its own navigation.
   */
  onBack?: () => void;
  /** Override the inline-drawn back arrow with an icon-pack node. */
  backIcon?: React.ReactNode;

  /** Tabs rendered below the header. Pass `[]` (or omit) to hide. */
  tabs?: NotificationTab[];
  /** `key` of the currently active tab. */
  activeTab?: string;
  onTabChange?: (key: string) => void;

  /** Label for the right-side text link. Default "Mark as read". */
  markAsReadLabel?: string;
  /** When undefined the link is hidden. */
  onMarkAsRead?: () => void;

  /** Body content — consumer plugs in the notification list. */
  children?: React.ReactNode;
  /** Style override on the outer container. */
  style?: object;
}

/**
 * NotificationsBase — Figma node 2188:12649 ("Notifications base").
 *
 * Foundational scaffold for a notifications screen:
 *   1. Header row: optional back button | title "Notifications" | "Mark as
 *      read" link (right). Padding 16, gap 12, 1px bottom border #E2E8F0.
 *   2. Tabs row: horizontally scrolling tab strip with active underline
 *      (#005DAC) and per-tab count badges (brand-tinted for active, slate
 *      for inactive). Renders only when `tabs` is non-empty.
 *   3. Body slot: empty by default — consumer fills with notification rows,
 *      empty-state, or whatever else.
 *
 * Designed to live at the top of a real screen (sibling of any scroll view),
 * or stretched inside a 375×812 phone preview.
 */
export const NotificationsBase: React.FC<NotificationsBaseProps> = ({
  title = 'Notifications',
  onBack,
  backIcon,
  tabs = [],
  activeTab,
  onTabChange,
  markAsReadLabel = 'Mark as read',
  onMarkAsRead,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* ---- Header ---- */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Left slot — equal flex to the right slot so the title centres. */}
          <View style={styles.headerSide}>
            {onBack && (
              <Pressable
                onPress={onBack}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                {backIcon ?? <CaretLeftGlyph color={colors.textHeading} />}
              </Pressable>
            )}
          </View>

          {/* Centred title — natural width, sits between the two equal sides. */}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>

          {/* Right slot — mirrors the left so the centre stays screen-centred. */}
          <View style={[styles.headerSide, styles.headerSideRight]}>
            {onMarkAsRead && (
              <Pressable
                onPress={onMarkAsRead}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel={markAsReadLabel}
              >
                <Text style={styles.markAsRead}>{markAsReadLabel}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ---- Tabs ---- */}
        {tabs.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={styles.tabsScroll}
          >
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => onTabChange?.(tab.key)}
                  style={[styles.tab, isActive && styles.tabActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                  {tab.count != null && tab.count > 0 && (
                    <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
                      <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
                        {tab.count}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ---- Body slot ---- */}
      <View style={styles.body}>{children}</View>
    </View>
  );
};

// Inline back-arrow glyph — drawn with rotated View borders so the package
// stays icon-pack-free. Consumers can swap via `backIcon` prop.
const CaretLeftGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.caretWrap} accessibilityElementsHidden>
    <View
      style={{
        width: 7,
        height: 7,
        borderLeftWidth: 1.6,
        borderBottomWidth: 1.6,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  // Header — column, gap 12, top padding only (no left/right padding so the
  // header row and tabs sit flush to the container edge). 1px bottom border.
  header: {
    paddingTop: spacing.lg,         // 16
    gap: spacing.md,                // 12
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle, // #E2E8F0
  },
  // Header row — back | title | mark-as-read. Title takes remaining space.
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.sm,           // 8
    borderRadius: radius.lg,       // 8
  },
  iconBtnPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  // Equal-width side slots flanking the centred title. Both flex:1 so the
  // title (natural width, between them) lands in the screen centre regardless
  // of the back button / mark-as-read widths.
  headerSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSideRight: {
    justifyContent: 'flex-end',
  },
  // Body 1/Medium per Figma: Rubik 500, 16/24, #1E293B
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
    textAlign: 'center',
  },
  // Body 3/Regular link in #004E91 per Figma
  markAsRead: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.brandPressed,
  },
  // Tabs strip
  tabsScroll: {
    alignSelf: 'stretch',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Each tab — padding 8×12, gap 8 per Figma `layout_VH5BG0`
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  // Active tab — bottom border #005DAC (Figma's underline indicator)
  tabActive: {
    borderBottomWidth: 1,
    borderBottomColor: colors.brand,
  },
  // Inactive tab label — Body 2/Regular #475569
  tabLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody,
  },
  // Active tab label — same size, brand-pressed color
  tabLabelActive: {
    color: colors.brandPressed,
  },
  // Count badge — pill, radius 16, padding 0 × 8
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  badgeActive: {
    backgroundColor: colors.brandSubtle, // #E8F4FF per Figma
  },
  badgeInactive: {
    backgroundColor: colors.surfaceMuted, // #F1F5F9 per Figma
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  badgeTextActive: {
    color: colors.brandPressed,
  },
  badgeTextInactive: {
    color: colors.textHeading,
  },
  body: {
    flex: 1,
  },
});

const glyphs = StyleSheet.create({
  caretWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
