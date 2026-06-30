import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface PaginationProps {
  /** Total number of pages (>= 1). */
  total: number;
  /** Currently-selected page (1-based). */
  current: number;
  /** Fired with the new 1-based page when the user taps a number or chevron. */
  onPageChange: (page: number) => void;
  /**
   * Maximum visible numeric cells before collapsing the middle with ellipses.
   * Default 7 — matches the Figma reference (`1 [2] 3 4 … 10`).
   */
  maxVisible?: number;
  /** Override the inline-drawn prev chevron with an icon-pack node. */
  prevIcon?: React.ReactNode;
  /** Override the inline-drawn next chevron with an icon-pack node. */
  nextIcon?: React.ReactNode;
  /** Style override on the outer container. */
  style?: object;
}

/**
 * Pagination — compact numbered control matching Figma node 2550:20813.
 *
 * Renders: `‹  1  [2]  3  4  …  10  ›`. Active page gets a 1px slate-300
 * border and darker text; inactive pages are borderless body text on white.
 * Chevron buttons are 32×32 tertiary icon buttons.
 *
 * Layout per Figma:
 *   • Outer container: row, padding 8, 1px top border #E2E8F0, justify
 *     space-between (chevrons on the edges, numbers in the middle).
 *   • Number cell: 40×40 fixed, padding 12, radius 8.
 *   • Active cell: white bg + 1px #CBD5E1 border + #1E293B text.
 *   • Inactive cell: white bg + no border + #475569 text.
 *   • Ellipsis (`…`) renders as a non-tappable cell — visual hint for
 *     skipped pages.
 *
 * Designed to be drop-in: just `total`, `current`, `onPageChange` — the
 * sequence (which numbers to show + where to insert `…`) is computed
 * internally based on `maxVisible`.
 */
export const Pagination: React.FC<PaginationProps> = ({
  total,
  current,
  onPageChange,
  maxVisible = 7,
  prevIcon,
  nextIcon,
  style,
}) => {
  const pages = buildSequence(current, total, maxVisible);

  const goTo = (page: number) => {
    if (page < 1 || page > total || page === current) return;
    onPageChange(page);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Prev chevron */}
      <Pressable
        onPress={() => goTo(current - 1)}
        disabled={current <= 1}
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        style={({ pressed }) => [
          styles.chevronBtn,
          pressed && current > 1 && styles.chevronBtnPressed,
          current <= 1 && styles.chevronBtnDisabled,
        ]}
      >
        {prevIcon ?? <CaretLeftGlyph color={current <= 1 ? colors.textDisabled : colors.textBody} />}
      </Pressable>

      {/* Numbered cells */}
      <View style={styles.numbersRow}>
        {pages.map((p, i) => {
          if (p === '...') {
            return (
              <View key={`ellipsis-${i}`} style={styles.numberCell}>
                <Text style={styles.numberText}>...</Text>
              </View>
            );
          }
          const isActive = p === current;
          return (
            <Pressable
              key={p}
              onPress={() => goTo(p)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Page ${p}`}
              style={({ pressed }) => [
                styles.numberCell,
                isActive && styles.numberCellActive,
                pressed && !isActive && styles.numberCellPressed,
              ]}
            >
              <Text style={[styles.numberText, isActive && styles.numberTextActive]}>{p}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Next chevron */}
      <Pressable
        onPress={() => goTo(current + 1)}
        disabled={current >= total}
        accessibilityRole="button"
        accessibilityLabel="Next page"
        style={({ pressed }) => [
          styles.chevronBtn,
          pressed && current < total && styles.chevronBtnPressed,
          current >= total && styles.chevronBtnDisabled,
        ]}
      >
        {nextIcon ?? <CaretRightGlyph color={current >= total ? colors.textDisabled : colors.textBody} />}
      </Pressable>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Page sequence — always shows first + last; the middle window slides with
// `current` and inserts ellipses on either side when collapsed.
// ---------------------------------------------------------------------------

type Cell = number | '...';

function buildSequence(current: number, total: number, maxVisible: number): Cell[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // We always keep first + last visible. The "window" around current shows
  // current-1, current, current+1 (clamped). If the window doesn't touch
  // first/last, we insert an ellipsis on that side.
  const pages: Cell[] = [];
  const window = new Set<number>([1, total, current, current - 1, current + 1]);

  // When current is near the edges, expand the window so we always show at
  // least a few sibling pages (matches Figma's "1, 2, 3, 4 … 10" pattern
  // when current is 2).
  if (current <= 3) {
    window.add(2);
    window.add(3);
    window.add(4);
  }
  if (current >= total - 2) {
    window.add(total - 1);
    window.add(total - 2);
    window.add(total - 3);
  }

  const sorted = Array.from(window).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('...');
    pages.push(sorted[i]);
  }
  return pages;
}

// ---------------------------------------------------------------------------
// Inline chevron glyphs — drawn with rotated View borders so the package
// stays icon-pack-free. Consumers override via `prevIcon` / `nextIcon`.
// ---------------------------------------------------------------------------

const CaretLeftGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.wrap} accessibilityElementsHidden>
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

const CaretRightGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={glyphs.wrap} accessibilityElementsHidden>
    <View
      style={{
        width: 7,
        height: 7,
        borderRightWidth: 1.6,
        borderTopWidth: 1.6,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

const glyphs = StyleSheet.create({
  wrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  // Outer — Figma `layout_5ZKMW4`: row, padding 8, 1px top border, justify
  // space-between (chevrons on edges, numbers grouped in the middle).
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle, // #E2E8F0
    alignSelf: 'stretch',
  },
  // Chevron buttons — Figma `layout_8IV08S`: padding 8, radius 8, tertiary
  // (no border, no fill — just an icon).
  chevronBtn: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronBtnPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  chevronBtnDisabled: {
    opacity: 0.5,
  },
  // Numbers row — Figma `layout_Y4JIKV`: row, gap 4
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4
  },
  // Number cell — Figma `layout_54H4ZV`: 40×40, radius 8, padding 12
  numberCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.lg, // 8
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    // 1px transparent border so the active state's border doesn't shift layout
    borderWidth: 1,
    borderColor: 'transparent',
  },
  numberCellActive: {
    borderColor: colors.border, // #CBD5E1 per Figma `fill_PDI6SN`
  },
  numberCellPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  numberText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody, // #475569 per Figma inactive `fill_2KJP87`
  },
  numberTextActive: {
    color: colors.textHeading, // #1E293B per Figma active `fill_DUBHXS`
  },
});
