import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

// ---------------------------------------------------------------------------
// Column / cell types
// ---------------------------------------------------------------------------

/**
 * Defines one column's header + how each row's cell renders.
 * Three rendering paths (pick whichever's least typing):
 *   1. `render(row)` — full custom JSX (best for toggles, badges, action rows)
 *   2. `primaryKey` + optional `secondaryKey` — stacked primary/secondary text
 *   3. neither — falls back to `String(row[column.key])`
 */
export interface TableColumn<T = any> {
  /** Stable identifier — also used as React key. */
  key: string;
  /** Header label (e.g. "Heading", "Status"). */
  header: string;
  /** Fixed column width in px. Default 160. */
  width?: number;
  /** Render an info `ⓘ` icon next to the header label. */
  info?: boolean;
  /** Override the inline info glyph (e.g. Phosphor `<Info />`). */
  infoIcon?: React.ReactNode;
  /** Tap handler for the info icon — opens a tooltip / sheet in the consumer. */
  onInfoPress?: () => void;
  /** Horizontal text alignment. Default `'left'`. */
  align?: 'left' | 'right';
  /** Field on `row` to use as the primary (Body 2/Medium) text. */
  primaryKey?: keyof T;
  /** Field on `row` to use as the secondary (Body 3/Regular) text below primary. */
  secondaryKey?: keyof T;
  /** Field on `row` containing an image URL — renders a 32×32 avatar left of primary. */
  avatarKey?: keyof T;
  /** Full custom cell renderer. Wins over primary/secondary/avatar shorthands. */
  render?: (row: T, rowIndex: number) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  /** Key for React reconciliation — either a field on `row` or a function. */
  rowKey: keyof T | ((row: T, index: number) => string | number);
  /** Header bg variant. Default `'grey'` (matches Figma `#F8FAFC`). */
  headerVariant?: 'grey' | 'white';
  /** Show row dividers under each row. Default true. */
  showRowDividers?: boolean;
  /** Style override on the outer container. */
  style?: object;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Table — horizontally-scrollable data table matching Figma node 9424:3479.
 *
 * Layout:
 *   • Outer container wraps the table in a horizontal ScrollView so wide
 *     tables overflow the phone width gracefully (Figma sample has 4–5
 *     columns totalling ~745px, scrolls on a 375px screen).
 *   • Header row: grey/white background (per `headerVariant`), 1px bottom
 *     border, each cell padded 8×16, includes optional info icon.
 *   • Body rows: 52px tall, padding 8×16, bottom border #E2E8F0 between.
 *
 * The component is data-driven (`columns` + `data` props) rather than the
 * compound `<TableRow><TableCell />` API of the web version. This is more
 * compact on mobile and lets sort/filter/selection state live cleanly in
 * the consumer.
 */
export function Table<T = any>({
  columns,
  data,
  rowKey,
  headerVariant = 'grey',
  showRowDividers = true,
  style,
}: TableProps<T>) {
  const getRowKey = (row: T, i: number): string | number =>
    typeof rowKey === 'function' ? rowKey(row, i) : (row[rowKey] as any);

  const totalWidth = columns.reduce((sum, c) => sum + (c.width ?? 160), 0);
  const headerBg = headerVariant === 'white' ? colors.surface : colors.surfaceSubtle;

  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: totalWidth }}>
          {/* ---- Header row ---- */}
          <View style={[styles.headerRow, { backgroundColor: headerBg }]}>
            {columns.map((col) => (
              <View
                key={col.key}
                style={[
                  styles.headerCell,
                  { width: col.width ?? 160 },
                  col.align === 'right' && styles.cellRight,
                ]}
              >
                <Text style={styles.headerLabel} numberOfLines={1}>{col.header}</Text>
                {col.info && (
                  <View style={styles.headerInfoSlot}>
                    {col.infoIcon ?? <InfoGlyph color={colors.textMuted} />}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* ---- Body rows ---- */}
          {data.map((row, rowIdx) => (
            <View
              key={getRowKey(row, rowIdx)}
              style={[styles.row, showRowDividers && styles.rowDivider]}
            >
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    { width: col.width ?? 160 },
                    col.align === 'right' && styles.cellRight,
                  ]}
                >
                  {renderCellContent(col, row, rowIdx)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Cell rendering — picks the right path based on which column fields are set
// ---------------------------------------------------------------------------

function renderCellContent<T>(col: TableColumn<T>, row: T, rowIdx: number): React.ReactNode {
  // 1. Custom render function wins.
  if (col.render) return col.render(row, rowIdx);

  // 2. Avatar + primary text shorthand.
  if (col.avatarKey) {
    const url = row[col.avatarKey] as any;
    const primary = col.primaryKey ? String(row[col.primaryKey] ?? '') : '';
    return (
      <View style={styles.avatarCellRow}>
        <View style={styles.avatar}>
          {url
            ? <View style={styles.avatarImageWrap}><AvatarImage uri={url} /></View>
            : <InitialsAvatar name={primary} />}
        </View>
        <Text style={styles.primary} numberOfLines={1}>{primary}</Text>
      </View>
    );
  }

  // 3. Stacked primary / secondary text shorthand.
  if (col.primaryKey || col.secondaryKey) {
    return (
      <View style={styles.textStack}>
        {col.primaryKey && (
          <Text style={styles.primaryStacked} numberOfLines={1}>
            {String(row[col.primaryKey] ?? '')}
          </Text>
        )}
        {col.secondaryKey && (
          <Text style={styles.secondary} numberOfLines={1}>
            {String(row[col.secondaryKey] ?? '')}
          </Text>
        )}
      </View>
    );
  }

  // 4. Fallback — coerce row[key] to string.
  return (
    <Text style={styles.primary} numberOfLines={1}>
      {String((row as any)[col.key] ?? '')}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Avatar image via the platform's `<img>` (web) or RN `Image`. */
const AvatarImage: React.FC<{ uri: string }> = ({ uri }) => {
  // We use a plain Image — on react-native-web it resolves to <img>.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Image } = require('react-native');
  return <Image source={{ uri }} style={styles.avatarImage} />;
};

/** Fallback initials when no avatar URL is provided. */
const InitialsAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View style={styles.initialsAvatar}>
      <Text style={styles.initialsAvatarText}>{initials || '?'}</Text>
    </View>
  );
};

/** Inline info `ⓘ` glyph drawn with a circle + lowercase i. */
const InfoGlyph: React.FC<{ color: string }> = ({ color }) => (
  <View style={[infoStyles.wrap, { borderColor: color }]}>
    <View style={[infoStyles.dot, { backgroundColor: color }]} />
    <View style={[infoStyles.stem, { backgroundColor: color }]} />
  </View>
);

const infoStyles = StyleSheet.create({
  wrap: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 1.6,
    height: 1.6,
    borderRadius: 1,
    position: 'absolute',
    top: 2.5,
  },
  stem: {
    width: 1.6,
    height: 5,
    borderRadius: 0.5,
    position: 'absolute',
    bottom: 2,
  },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 36;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl, // 12 per Figma container radius
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  // Header row — Figma bg #F8FAFC, 1px bottom border, padding 8×16.
  headerRow: {
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg, // 16
  },
  headerLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.textHeading, // #1E293B per Figma
  },
  headerInfoSlot: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Body row
  row: {
    flexDirection: 'row',
    height: ROW_HEIGHT,
    backgroundColor: colors.surface,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cellRight: {
    justifyContent: 'flex-end',
  },
  // First column: avatar (32×32 circle) + name
  avatarCellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 12
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 256,
    overflow: 'hidden',
  },
  avatarImageWrap: {
    width: 32,
    height: 32,
    borderRadius: 256,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 256,
  },
  initialsAvatar: {
    width: 32,
    height: 32,
    borderRadius: 256,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsAvatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.textBody,
  },
  // Primary text (single line — used in avatar column).
  primary: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textHeading,
    flex: 1,
  },
  // Stacked primary/secondary text group (label + subtext).
  textStack: {
    justifyContent: 'center',
    flex: 1,
  },
  primaryStacked: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.textHeading,
  },
  secondary: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.textBody, // #475569
  },
});
