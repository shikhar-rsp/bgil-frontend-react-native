import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { House, Bank, User, SquaresFour } from 'phosphor-react-native';
import { colors, typography, shadow } from '../../theme';

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

/** Tab bar row height (Figma 56px). */
export const BOTTOM_NAV_BAR_HEIGHT = 56;
/** iOS home-indicator strip height below the nav row (Figma node 9035:44319). */
export const BOTTOM_NAV_HOME_INDICATOR_HEIGHT = 34;
/**
 * Default MoreMenu `scrimBottomInset` — scrim starts at the top edge of the
 * whole nav (bar + home indicator), so the overlay never covers either.
 */
export const BOTTOM_NAV_SCRIM_INSET = BOTTOM_NAV_BAR_HEIGHT + BOTTOM_NAV_HOME_INDICATOR_HEIGHT;

/** Built-in Phosphor glyphs for `iconName` (more names added over time). */
export type BottomNavIconName = 'home' | 'bank' | 'user' | 'grid';

export interface BottomNavItem {
  /** Stable id, also used as the active key. */
  key: string;
  /** Caption under the icon (Body 3 / 12px). */
  label: string;
  /** One of the built-in glyphs. Ignored when `icon` is supplied. */
  iconName?: BottomNavIconName;
  /** Custom icon node (recommended 24×24). Overrides `iconName`. */
  icon?: React.ReactNode;
  /** Custom icon for the active state. Falls back to `icon` / `iconName`. */
  activeIcon?: React.ReactNode;
}

/** The protruding centre action (the AI button in the Figma spec). */
export interface BottomNavCenter {
  onPress?: () => void;
  /** Override the white sparkle glyph. */
  icon?: React.ReactNode;
  /** Brand circle colour. Default brand blue. */
  color?: string;
  accessibilityLabel?: string;
}

export interface BottomNavProps {
  /**
   * Tab items. With a centre button, the list is split into two equal groups
   * (left / right of the button) — 2 + 2 matches the Figma spec. Without a
   * centre button all items sit in a single evenly-spaced row.
   */
  items: BottomNavItem[];
  /** Key of the active item. When paired with {@link MoreMenu}, use `moreOpen ? 'more' : tab`. */
  activeKey?: string;
  /** Fired when a tab is pressed. */
  onChange?: (key: string) => void;
  /** Centre AI button. Pass `null`/omit to render a plain tab bar. */
  center?: BottomNavCenter | null;
  /** Surface colour. Default white. */
  backgroundColor?: string;
  /** Render the iOS home-indicator strip below the nav row. Default true. */
  showHomeIndicator?: boolean;
  /** Style override on the outer bar. */
  style?: object;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * BottomNav — mobile bottom navigation menu matching Figma node 345:6020.
 *
 * Layout: a 56px white bar with up to four labelled tabs and an optional
 * circular brand "AI" button that floats above the centre of the bar.
 * Active tab uses brand-pressed text (#004E91) and brand icon (#005DAC);
 * inactive tabs use subtle text (#475569).
 *
 * Icons use Phosphor for built-in `iconName` glyphs (regular when inactive,
 * fill when active). Override with `icon` / `activeIcon` for full control.
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeKey,
  onChange,
  center,
  backgroundColor = colors.surface,
  showHomeIndicator = true,
  style,
}) => {
  const hasCenter = Boolean(center);
  // Split into two halves around the centre button (2 + 2 in the spec).
  const mid = Math.ceil(items.length / 2);
  const left = hasCenter ? items.slice(0, mid) : items;
  const right = hasCenter ? items.slice(mid) : [];

  const renderTab = (item: BottomNavItem) => (
    <NavTab
      key={item.key}
      item={item}
      active={item.key === activeKey}
      onPress={() => onChange?.(item.key)}
    />
  );

  return (
    <View style={[styles.root, { backgroundColor }, style]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {hasCenter ? (
          <>
            {/* Left half — a fixed 144px cluster centred in the flex:1 side
                (Figma 345:5919/345:5920), so the two tabs hug the centre button. */}
            <View style={styles.group}>
              <View style={styles.groupInner}>{left.map(renderTab)}</View>
            </View>

            <View style={styles.centerSlot}>
              <Pressable
                onPress={center?.onPress}
                style={({ pressed }) => [styles.centerHalo, pressed && styles.centerPressed]}
                accessibilityRole="button"
                accessibilityLabel={center?.accessibilityLabel ?? 'AI'}
              >
                <View style={[styles.centerButton, center?.color ? { backgroundColor: center.color } : null]}>
                  {center?.icon ?? <SparkleGlyph color={colors.textOnBrand} />}
                </View>
              </Pressable>
            </View>

            <View style={styles.group}>
              <View style={styles.groupInner}>{right.map(renderTab)}</View>
            </View>
          </>
        ) : (
          // No centre button — all items spread evenly across the full bar.
          <View style={styles.fullRow}>{left.map(renderTab)}</View>
        )}
      </View>

      {/* iOS home indicator — 144×5 pill, 8px from the bottom (Figma 9035:44319). */}
      {showHomeIndicator ? (
        <View style={styles.homeIndicator}>
          <View style={styles.homeIndicatorBar} />
        </View>
      ) : null}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Tab — internal
// ---------------------------------------------------------------------------

const NavTab: React.FC<{ item: BottomNavItem; active: boolean; onPress: () => void }> = ({
  item,
  active,
  onPress,
}) => {
  const textColor = active ? colors.brandPressed : colors.textBody;
  const iconColor = active ? colors.brand : colors.textBody;

  const icon =
    (active && item.activeIcon) ||
    item.icon ||
    (item.iconName ? builtInIcon(item.iconName, iconColor, active) : <FallbackGlyph color={iconColor} />);

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={item.label}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
};

// ---------------------------------------------------------------------------
// Built-in tab icons — Phosphor regular (inactive) / fill (active).
// ---------------------------------------------------------------------------

const TAB_ICON_SIZE = 24;

function builtInIcon(name: BottomNavIconName, color: string, active: boolean): React.ReactNode {
  const weight = active ? 'fill' : 'regular';
  switch (name) {
    case 'home':
      return <House size={TAB_ICON_SIZE} color={color} weight={weight} />;
    case 'bank':
      return <Bank size={TAB_ICON_SIZE} color={color} weight={weight} />;
    case 'user':
      return <User size={TAB_ICON_SIZE} color={color} weight={weight} />;
    case 'grid':
      return <SquaresFour size={TAB_ICON_SIZE} color={color} weight={weight} />;
  }
}

/** Sparkle — 4-point AI star (two crossed sets of spikes) + a mini sparkle. */
const SparkleGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.sparkleBox} accessibilityElementsHidden>
    <FourPointStar color={color} size={26} />
    <View style={glyphs.sparkleMini}>
      <FourPointStar color={color} size={9} />
    </View>
  </View>
);

/** A single concave 4-point star built from four triangular spikes. */
const FourPointStar: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const half = size / 2;
  const spike = half;        // spike length from centre to tip
  const base = size * 0.34;  // width of each spike's base
  return (
    <View style={{ width: size, height: size }}>
      {/* up */}
      <View
        style={[
          starStyles.spike,
          {
            left: half - base / 2,
            top: 0,
            borderLeftWidth: base / 2,
            borderRightWidth: base / 2,
            borderBottomWidth: spike,
            borderBottomColor: color,
          },
        ]}
      />
      {/* down */}
      <View
        style={[
          starStyles.spike,
          {
            left: half - base / 2,
            bottom: 0,
            borderLeftWidth: base / 2,
            borderRightWidth: base / 2,
            borderTopWidth: spike,
            borderTopColor: color,
          },
        ]}
      />
      {/* left */}
      <View
        style={[
          starStyles.spike,
          {
            top: half - base / 2,
            left: 0,
            borderTopWidth: base / 2,
            borderBottomWidth: base / 2,
            borderRightWidth: spike,
            borderRightColor: color,
          },
        ]}
      />
      {/* right */}
      <View
        style={[
          starStyles.spike,
          {
            top: half - base / 2,
            right: 0,
            borderTopWidth: base / 2,
            borderBottomWidth: base / 2,
            borderLeftWidth: spike,
            borderLeftColor: color,
          },
        ]}
      />
    </View>
  );
};

/** Neutral fallback when an item supplies neither `icon` nor `iconName`. */
const FallbackGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.box} accessibilityElementsHidden>
    <View style={[glyphs.fallbackDot, { backgroundColor: color }]} />
  </View>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Outer surface — the nav row + home indicator stacked, white, with a subtle
  // upward separator so the whole block lifts off page content.
  root: {
    alignSelf: 'stretch',
    zIndex: 2,
    shadowColor: shadow.lg.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  // Bar — Figma: row, align bottom, px 16, content height 56.
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignSelf: 'stretch',
  },
  // iOS home indicator — 34px strip, 144×5 pill #334155 sat 8px off the bottom.
  homeIndicator: {
    height: BOTTOM_NAV_HOME_INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  homeIndicatorBar: {
    width: 144,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#334155', // color.background.neutral.bold
  },
  // Half — flex:1, centres the fixed-width cluster (Figma 345:5919).
  group: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // The two tabs sit at the ends of a 144px row (Figma 345:5920) — gap ≈ 12.8px,
  // so they cluster toward the centre button instead of spreading across the half.
  groupInner: {
    width: 144,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  // No-centre layout — all items evenly spread across the whole bar.
  fullRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  // Tab — Figma: 65.6×56, py 8, icon 24 + gap 4 + label.
  tab: {
    width: 65.6,
    height: 56,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body3.fontSize,     // 12
    lineHeight: typography.body3.lineHeight, // 16
    fontWeight: typography.body3.fontWeight, // 400
    textAlign: 'center',
  },
  // Centre slot — 66 wide; button floats ~14px above the bar.
  centerSlot: {
    width: 66,
    height: 56,
    alignItems: 'center',
  },
  centerHalo: {
    position: 'absolute',
    bottom: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface, // white ring / notch behind the button
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: shadow.lg.shadowColor,
    shadowOffset: shadow.lg.shadowOffset,
    shadowOpacity: shadow.lg.shadowOpacity,
    shadowRadius: shadow.lg.shadowRadius,
    elevation: shadow.lg.elevation,
  },
  centerPressed: {
    opacity: 0.9,
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brand, // #005DAC
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const glyphs = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sparkle
  sparkleBox: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleMini: {
    position: 'absolute',
    top: 1,
    right: 1,
  },
  // Fallback
  fallbackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

const starStyles = StyleSheet.create({
  spike: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
