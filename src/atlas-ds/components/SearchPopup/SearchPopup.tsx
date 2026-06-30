import React from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, noFocusOutline } from '../../theme';

/** A tab in the search popup's category strip. */
export interface SearchPopupTab {
  /** Stable identifier passed to onTabChange. */
  key: string;
  /** Visible label (e.g. "All", "Policies", "Customers"). */
  label: string;
}

export interface SearchPopupProps {
  /**
   * Tap handler for the back button. When undefined the back affordance is
   * hidden — useful if the popup lives inside a modal that has its own
   * dismiss control.
   */
  onBack?: () => void;
  /** Override the inline-drawn back chevron with an icon-pack node. */
  backIcon?: React.ReactNode;

  /** Placeholder shown when the search field is empty. */
  searchPlaceholder?: string;
  /** Controlled value of the search input. */
  searchValue?: string;
  /** Fired on every keystroke. */
  onSearchChange?: (text: string) => void;
  /** Override the inline magnifying-glass with an icon-pack node. */
  searchIcon?: React.ReactNode;
  /**
   * Override the default inline-drawn clear (X) button shown when the field
   * has text. Pass `null` (or set `onSearchChange` to undefined) to hide it.
   */
  clearIcon?: React.ReactNode;

  /** Horizontal tab strip. Renders only when non-empty. */
  tabs?: SearchPopupTab[];
  /** `key` of the currently active tab. */
  activeTab?: string;
  onTabChange?: (key: string) => void;

  /** Body slot — search results / empty state / recent searches. */
  children?: React.ReactNode;
  /** Style override on the outer container. */
  style?: object;
}

/**
 * SearchPopup — Figma node 9222:94909 ("Search pop up").
 *
 * Full-screen mobile search experience:
 *   1. Header row: back button + search input field, padding 16/16/0, gap 16.
 *   2. Tabs strip: horizontal scrolling, 1px bottom border. Active tab gets a
 *      brand-blue bottom border and #004E91 text; inactive #475569.
 *   3. Body slot: padding 16, fills remaining height — host fills with
 *      results, empty state, or recent-search suggestions.
 *
 * Designed to sit directly below a TopBar (status bar chrome). See the docs
 * preview for the stacked composition; the SearchPopup itself doesn't bake
 * in a status bar so consumers can choose their own (or skip it on Android).
 */
export const SearchPopup: React.FC<SearchPopupProps> = ({
  onBack,
  backIcon,
  searchPlaceholder = 'Search',
  searchValue,
  onSearchChange,
  searchIcon,
  clearIcon,
  tabs = [],
  activeTab,
  onTabChange,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* ---- Header row: back + search input ---- */}
      <View style={styles.headerRow}>
        {onBack && (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            {backIcon ?? <CaretLeftGlyph color={colors.textBody} />}
          </Pressable>
        )}

        <View style={styles.searchField}>
          {searchIcon ?? <MagnifierGlyph color={colors.textMuted} />}
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, noFocusOutline]}
            returnKeyType="search"
          />
          {/* Clear button — appears only when there's text AND the consumer
              provided an onSearchChange handler we can use to reset it. */}
          {(searchValue?.length ?? 0) > 0 && !!onSearchChange && (
            <Pressable
              onPress={() => onSearchChange('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              {clearIcon ?? <XGlyph color={colors.textMuted} />}
            </Pressable>
          )}
        </View>
      </View>

      {/* ---- Tabs strip ---- */}
      {tabs.length > 0 && (
        <View style={styles.tabsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
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
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ---- Body slot — scrolls independently; the header (back + search)
           and the tabs strip above stay fixed. ---- */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
};

// Inline back-chevron — drawn with a rotated View border so the package
// stays icon-pack-free. Consumer can swap via `backIcon` prop.
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

// Inline magnifying glass — circle + handle. Consumer can swap via `searchIcon`.
const MagnifierGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.searchWrap} accessibilityElementsHidden>
    <View style={[glyphs.searchCircle, { borderColor: color }]} />
    <View style={[glyphs.searchHandle, { backgroundColor: color }]} />
  </View>
);

// Inline X (clear) — two rotated rectangles forming a cross. Consumer can
// swap via `clearIcon` prop.
const XGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.xWrap} accessibilityElementsHidden>
    <View style={[glyphs.xBar, { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
    <View style={[glyphs.xBar, { backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
  },
  // Header: single ROW — back button + search field side by side, vertically
  // centred. Padding 16/16/0, gap 16 between the two.
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 16
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg, // gap to tabs strip
  },
  // Back button — fixed-size hit area on the left of the row.
  backBtn: {
    padding: spacing.sm,        // 8
    borderRadius: radius.lg,    // 8
  },
  backBtnPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  // Search input shell — Figma `layout_42M2Y5`: row, padding 8/12, gap 8,
  // border 1px #E2E8F0, radius 8, height 40. flex:1 so it fills the row to the
  // right of the back button.
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    height: 40,
  },
  // Rubik 14/20, placeholder #94A3B8, text #1E293B
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
    paddingVertical: 0,
  },
  // Tabs container — Figma `layout_4MVXKX`: row, full width, 1px bottom
  // border #E2E8F0 (the strip's "rail" line).
  tabsWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  // 16px page margin on both sides. The grey rail stays full-width because it
  // lives on `tabsWrap`, not this scrolling row.
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // 16
  },
  // Each tab — Figma `layout_I616W3`: padding 8/12, gap 8. Carries a 2px
  // transparent bottom border so switching active state only changes the
  // colour (no height jump that would misalign tabs under alignItems:center).
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  // Active tab — Figma: brand-blue bottom border. Kept fully inside the tab
  // bounds (no negative margin) so the horizontal ScrollView's overflow:hidden
  // doesn't clip it. 2px so it reads clearly over the 1px grey rail below.
  tabActive: {
    borderBottomColor: colors.brand,
  },
  tabLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody, // #475569
  },
  tabLabelActive: {
    color: colors.brandPressed, // #004E91
  },
  // Body slot — Figma `layout_GSTXMA`: fills the remaining height and scrolls
  // internally (header + tabs stay pinned). Padding lives on the scroll
  // content, not the viewport.
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: spacing.lg,
  },
});

const glyphs = StyleSheet.create({
  caretWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.6,
    position: 'absolute',
    top: 2,
    left: 2,
  },
  searchHandle: {
    position: 'absolute',
    width: 5,
    height: 1.6,
    bottom: 3.5,
    right: 2.5,
    transform: [{ rotate: '45deg' }],
    borderRadius: 0.5,
  },
  // X (clear) glyph — two thin rotated bars meeting in the middle.
  xWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xBar: {
    position: 'absolute',
    width: 12,
    height: 1.6,
    borderRadius: 1,
  },
});
