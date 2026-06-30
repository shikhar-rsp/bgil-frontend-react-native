import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  ListChecks,
  HandCoins,
  PencilSimpleLine,
  Trophy,
  BookOpen,
  Toolbox,
} from 'phosphor-react-native';
import { colors, spacing, typography } from '../../theme';
import { BOTTOM_NAV_SCRIM_INSET } from '../BottomNav/BottomNav';

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

/** Built-in Phosphor glyphs for `iconName`. */
export type MoreMenuIconName =
  | 'tasks'
  | 'claims'
  | 'endorsements'
  | 'campaign'
  | 'learn'
  | 'tools';

export interface MoreMenuItem {
  /** Stable id. */
  key: string;
  /** Caption under the tile (Body 3 / 12px). */
  label: string;
  /** Coloured tile background (e.g. `#0D9488`). */
  color: string;
  /** One of the built-in glyphs. Ignored when `icon` is supplied. */
  iconName?: MoreMenuIconName;
  /** Custom icon node (recommended 28×28, white). Overrides `iconName`. */
  icon?: React.ReactNode;
  /** Tapped handler. */
  onPress?: () => void;
}

export interface MoreMenuProps {
  /** Controls visibility — when false the popup is unmounted. */
  visible: boolean;
  /** Fired when the backdrop is tapped (or an item is chosen, if you choose to close). */
  onClose: () => void;
  /** Grid items (the Figma reference shows 6 in a 3-column grid). */
  items: MoreMenuItem[];
  /** Columns per row. Default 3 (matches Figma). */
  columns?: number;
  /**
   * Gap between the popup card and the bottom of the screen, in px. Default
   * 128 (Figma `Space-15`) so the card floats above the BottomNav.
   */
  bottomOffset?: number;
  /**
   * Scrim stops this many px above the screen bottom — the fade begins at the
   * top edge of the BottomNav (default = nav row + home indicator, matches
   * `BOTTOM_NAV_SCRIM_INSET`). Pass `BOTTOM_NAV_BAR_HEIGHT` if the nav hides
   * its home indicator.
   */
  scrimBottomInset?: number;
  /** Close when the backdrop is tapped. Default true. */
  closeOnBackdrop?: boolean;
  /** Style override on the popup card (not the backdrop). */
  style?: object;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * MoreMenu — the "More" popup that opens from the BottomNav's More tab.
 *
 * Figma source: vHExm4J0Y43BZkLYswSKm8 node 9036:44485.
 *
 * A scrim-backed card docked near the bottom (above the BottomNav) holding a
 * grid of coloured icon tiles + labels. Built-in `iconName` glyphs use Phosphor
 * (regular weight, white). Override with a custom 28×28 white node via `icon`.
 *
 * Wire it to BottomNav — drive `activeKey` from menu visibility so More
 * looks selected while the popup is open:
 *
 *   const [tab, setTab] = useState('home');
 *   const [moreOpen, setMoreOpen] = useState(false);
 *
 *   <BottomNav
 *     activeKey={moreOpen ? 'more' : tab}
 *     onChange={(key) => {
 *       if (key === 'more') setMoreOpen((open) => !open);
 *       else { setMoreOpen(false); setTab(key); }
 *     }}
 *     items={[ ..., { key: 'more', label: 'More', iconName: 'grid' } ]}
 *   />
 *   <MoreMenu visible={moreOpen} onClose={() => setMoreOpen(false)} items={items} />
 */
export const MoreMenu: React.FC<MoreMenuProps> = ({
  visible,
  onClose,
  items,
  columns = 3,
  bottomOffset = 128,
  scrimBottomInset = BOTTOM_NAV_SCRIM_INSET,
  closeOnBackdrop = true,
  style,
}) => {
  // In-screen overlay (NOT a native <Modal>): MoreMenu is designed to float
  // ABOVE the BottomNav while the nav stays visible + interactive (the scrim
  // stops at `scrimBottomInset`). Render it as a sibling of the BottomNav at the
  // screen root so the absolute overlay fills the screen on iOS/Android, then
  // render the BottomNav AFTER it so the bar + centre button sit above the scrim.
  if (!visible) return null;

  // Chunk items into rows of `columns`, padding the final row with spacers so
  // every column keeps an equal width.
  const rows: (MoreMenuItem | null)[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    const row: (MoreMenuItem | null)[] = items.slice(i, i + columns);
    while (row.length < columns) row.push(null);
    rows.push(row);
  }

  return (
    <View style={[styles.root, { paddingBottom: bottomOffset }]} pointerEvents="box-none">
      {/* Backdrop — full-bleed scrim, dismisses on tap. */}
      <Pressable
        style={[styles.backdrop, { bottom: scrimBottomInset }]}
        onPress={() => closeOnBackdrop && onClose()}
        accessibilityRole="button"
        accessibilityLabel="Dismiss menu"
      />

      {/* Popup card */}
      <View style={[styles.card, style]} pointerEvents="auto" accessibilityRole="menu">
        <View style={styles.body}>
          {rows.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((item, c) =>
                item ? (
                  <Pressable
                    key={item.key}
                    style={styles.item}
                    onPress={item.onPress}
                    accessibilityRole="menuitem"
                    accessibilityLabel={item.label}
                  >
                    <View style={[styles.tile, { backgroundColor: item.color }]}>
                      {item.icon ??
                        (item.iconName ? builtInIcon(item.iconName) : <FallbackGlyph />)}
                    </View>
                    <Text style={styles.label} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </Pressable>
                ) : (
                  <View key={`spacer-${c}`} style={styles.item} />
                )
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Built-in tile icons — Phosphor regular, fixed white (no active weight).
// ---------------------------------------------------------------------------

const TILE_ICON_SIZE = 28;
const TILE_ICON_COLOR = colors.textOnBrand; // #FFFFFF

function builtInIcon(name: MoreMenuIconName): React.ReactNode {
  const props = { size: TILE_ICON_SIZE, color: TILE_ICON_COLOR };
  switch (name) {
    case 'tasks':
      return <ListChecks {...props} />;
    case 'claims':
      return <HandCoins {...props} />;
    case 'endorsements':
      return <PencilSimpleLine {...props} />;
    case 'campaign':
      return <Trophy {...props} />;
    case 'learn':
      return <BookOpen {...props} />;
    case 'tools':
      return <Toolbox {...props} />;
  }
}

/** Neutral fallback when an item supplies neither `icon` nor `iconName`. */
const FallbackGlyph: React.FC = () => (
  <View style={glyphStyles.box} accessibilityElementsHidden>
    <View style={glyphStyles.fallbackDot} />
  </View>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Overlay — Figma: column, items center, justify end, pb 128.
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // Scrim — Figma "elevation.surface.overlay" rgba(26,26,26,0.36).
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.36)',
  },
  // Card — Figma: width 335, radius 16, Shadow/lg, white.
  card: {
    width: 335,
    maxWidth: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  // Body — Figma: padding 20, gap 16.
  body: {
    padding: 20,
    gap: spacing.lg, // 16
  },
  // Row — Figma: gap 12, items start, full width.
  row: {
    flexDirection: 'row',
    gap: spacing.md, // 12
    alignItems: 'flex-start',
  },
  // Item — Figma: flex 1, col, gap 8, centered.
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm, // 8
  },
  // Tile — Figma: padding 8, radius 8, holds a 28×28 icon.
  tile: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Label — Body 3/regular, black, centered.
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body3.fontSize,     // 12
    lineHeight: typography.body3.lineHeight, // 16
    fontWeight: typography.body3.fontWeight, // 400
    color: '#000000',
    textAlign: 'center',
  },
});

const glyphStyles = StyleSheet.create({
  box: {
    width: TILE_ICON_SIZE,
    height: TILE_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TILE_ICON_COLOR,
  },
});
