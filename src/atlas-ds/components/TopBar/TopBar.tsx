import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, radius, spacing, typography, noFocusOutline } from '../../theme';

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

/**
 * Configures the search field rendered in the nav row.
 *  - Pass `onPress` for the "tap to open" pattern (no on-bar typing).
 *  - Pass `onChangeText` (and `value`) to make it a real input.
 *  - Provide `leadingIcon` to swap the magnifying-glass icon for an
 *    icon-pack version (Phosphor / lucide). Default is an inline-drawn glyph.
 */
export interface TopBarSearch {
  placeholder?: string;
  value?: string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
  leadingIcon?: React.ReactNode;
}

export interface TopBarProps {
  // ---- Status bar (existing iOS chrome) ----
  /** Hide the iOS-style status bar row. Default true. */
  showStatusBar?: boolean;
  /** Time text shown on the left of the status bar. Default "9:41". */
  time?: string;
  /** Override the white surface — applies to the entire bar. */
  backgroundColor?: string;
  /** Override the status-bar text + glyph color. */
  tintColor?: string;
  /** Toggle the signal-strength glyph in the status bar. Default true. */
  showSignal?: boolean;
  /** Toggle the wifi glyph in the status bar. Default true. */
  showWifi?: boolean;
  /** Toggle the battery glyph in the status bar. Default true. */
  showBattery?: boolean;
  /** Replace the inline-drawn signal glyph. */
  signalIcon?: React.ReactNode;
  /** Replace the inline-drawn wifi glyph. */
  wifiIcon?: React.ReactNode;
  /** Replace the inline-drawn battery glyph. */
  batteryIcon?: React.ReactNode;

  // ---- App nav row (new) ----
  /**
   * Optional avatar node rendered on the LEFT of the nav row (recommended
   * 40×40). The component renders the row only if `avatar`, `search`, or
   * `actions` are provided — otherwise it's purely the status bar.
   */
  avatar?: React.ReactNode;
  /** Optional search field in the centre of the nav row. */
  search?: TopBarSearch;
  /** Right-side action icons / buttons (notification bell, menu, etc.). */
  actions?: React.ReactNode;

  /** Style override on the outer container. */
  style?: object;
  /** Style override on the nav row only. */
  navStyle?: object;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TopBar — composite mobile top bar matching Figma node 9281:15818.
 *
 * Two stacked sections:
 *   1. Status bar (iOS chrome — time + signal/wifi/battery glyphs). White
 *      surface, ~22px tall content area, padding 21/16/19. Hide with
 *      `showStatusBar={false}` if your app provides its own status bar.
 *   2. Optional nav row — appears only when `avatar`, `search`, or
 *      `actions` are supplied. Layout: avatar (left) | search (flex 1) |
 *      actions (right). Padding 12 × 16, gap 12.
 *
 * Default glyphs (signal/wifi/battery) are drawn inline so the package
 * stays free of icon-pack dependencies. Consumers can swap any of them
 * via `*Icon` props (e.g. `<TopBar wifiIcon={<Wifi />} />`).
 */
export const TopBar: React.FC<TopBarProps> = ({
  showStatusBar = true,
  time = '9:41',
  backgroundColor = colors.surface,
  tintColor = '#000000',
  showSignal = true,
  showWifi = true,
  showBattery = true,
  signalIcon,
  wifiIcon,
  batteryIcon,
  avatar,
  search,
  actions,
  style,
  navStyle,
}) => {
  const hasNav = Boolean(avatar || search || actions);

  return (
    <View style={[styles.container, { backgroundColor }, style]} accessibilityRole="header">
      {showStatusBar && (
        <View style={styles.statusBar}>
          <View style={styles.timeWrap}>
            <Text style={[styles.timeText, { color: tintColor }]}>{time}</Text>
          </View>

          <View style={styles.iconGroup}>
            {showSignal && (signalIcon ?? <SignalGlyph color={tintColor} />)}
            {showWifi && (wifiIcon ?? <WifiGlyph color={tintColor} />)}
            {showBattery && (batteryIcon ?? <BatteryGlyph color={tintColor} />)}
          </View>
        </View>
      )}

      {hasNav && (
        <View style={[styles.navRow, navStyle]}>
          {avatar && <View style={styles.navAvatar}>{avatar}</View>}
          {search && <SearchField {...search} />}
          {actions && <View style={styles.navActions}>{actions}</View>}
        </View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Search field — internal sub-component
// ---------------------------------------------------------------------------

const SearchField: React.FC<TopBarSearch> = ({
  placeholder = 'Search',
  value,
  onPress,
  onChangeText,
  leadingIcon,
}) => {
  // "Tap-to-open" mode (no live input) uses a Pressable wrapping a Text;
  // typed-input mode uses a TextInput. We default to typed-input so the
  // field is functional out of the box.
  if (onPress && !onChangeText) {
    return (
      <Pressable
        onPress={onPress}
        style={searchStyles.shell}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <View style={searchStyles.iconSlot}>
          {leadingIcon ?? <SearchGlyph color={colors.textMuted} />}
        </View>
        <Text style={[searchStyles.text, searchStyles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={searchStyles.shell}>
      <View style={searchStyles.iconSlot}>
        {leadingIcon ?? <SearchGlyph color={colors.textMuted} />}
      </View>
      <TextInput
        style={[searchStyles.input, noFocusOutline]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Inline glyphs — drawn with Views so the package needs no icon-pack dep.
// Consumers can override every one via props.
// ---------------------------------------------------------------------------

// iOS status-bar glyphs (Figma node 9239:3671). Rendered as react-native-svg
// so the shapes are crisp and match the design exactly on every platform.

/** Cellular signal — four solid ascending bars with rounded tops. */
const SignalGlyph: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={18} height={12} viewBox="0 0 17 12" fill="none">
    {[
      { x: 0, h: 4 },
      { x: 4.5, h: 6.5 },
      { x: 9, h: 9 },
      { x: 13.5, h: 12 },
    ].map((b, i) => (
      <Rect key={i} x={b.x} y={12 - b.h} width={3} height={b.h} rx={0.9} fill={color} />
    ))}
  </Svg>
);

/** Wifi — solid filled fan (three merged waves + dot), the iOS glyph. */
const WifiGlyph: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={17} height={13} viewBox="1 3 22 17" fill="none">
    <Path
      d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
      fill={color}
    />
  </Svg>
);

/** Battery — rounded casing (light), 100% fill, terminal nub. */
const BatteryGlyph: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={28} height={13} viewBox="0 0 28 13" fill="none">
    {/* Casing — iOS draws it at ~35% of the tint colour. */}
    <Rect x={0.5} y={0.5} width={24} height={12} rx={3.6} stroke={color} strokeOpacity={0.35} />
    {/* Terminal nub. */}
    <Rect x={25.6} y={4} width={1.6} height={5} rx={0.8} fill={color} fillOpacity={0.4} />
    {/* Charge fill. */}
    <Rect x={2} y={2} width={20} height={9} rx={2} fill={color} />
  </Svg>
);

/** Search — magnifying glass (circle + handle). */
const SearchGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.searchWrap} accessibilityElementsHidden>
    <View style={[glyphs.searchCircle, { borderColor: color }]} />
    <View style={[glyphs.searchHandle, { backgroundColor: color }]} />
  </View>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  // Status bar — Figma `layout_C4F59V`: row, padding 21/16/19, justify space-between.
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 21,
    paddingBottom: 19,
    paddingHorizontal: 16,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  timeText: {
    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, Rubik, sans-serif',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  // Nav row — Figma `layout_SDHIMX`: row, padding 12/16, gap 12.
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 12
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg, // 16
  },
  navAvatar: {
    // Avatar provides its own dimensions; the slot just stops it from stretching.
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

// Search input shell — Figma `layout_UGO3MV`: row, padding 8/12, gap 8,
// border 1px #E2E8F0, radius 8. flex:1 so it expands between avatar + actions.
const searchStyles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,    // 8
    paddingHorizontal: spacing.md,  // 12
    borderWidth: 1,
    borderColor: colors.borderSubtle, // #E2E8F0
    borderRadius: radius.lg,         // 8
    backgroundColor: colors.surface,
  },
  // Fixed slot for the leading icon. flexShrink:0 stops the (raw SVG) icon
  // from collapsing to 0 width when the row is tight — on react-native-web a
  // bare <svg> is the only shrinkable item next to the flexShrink:0 TextInput.
  iconSlot: {
    width: 20,
    height: 20,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textHeading,
  },
  placeholder: {
    color: colors.textMuted, // #94A3B8 per Figma
  },
  input: {
    flex: 1,
    minWidth: 0, // let the input shrink instead of overflowing + pushing the icon out
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textHeading,
    paddingVertical: 0, // remove default extra height in RN
  },
});

const glyphs = StyleSheet.create({
  // Search magnifying-glass (fallback when no icon prop is passed)
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
});
