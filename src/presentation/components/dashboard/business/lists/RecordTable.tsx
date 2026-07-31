import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Badge,
  Table,
  colors,
  fontFamilyForWeight,
  spacing,
  typography,
  type AccentColor,
  type TableColumn,
} from '@atlas-ds/react-native';
import { ListEmptyState, type SearchStatus } from './ListEmptyState';

/** Horizontal padding of the card these tables sit in (`SharedQuotes`). */
const CARD_PADDING = spacing.lg;

interface RecordTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T, index: number) => string | number);
  /** Noun used by the empty state — 'quotes', 'policies', … */
  noun: string;
  searchStatus: SearchStatus;
  /** True when the whole data set is empty, not just the filtered view. */
  isSourceEmpty: boolean;
  onCreateQuote?: () => void;
  onRowPress?: (row: T) => void;
}

/**
 * A business list rendered as a real table.
 *
 * These tabs were card lists, which forced every field to fit the phone width
 * and got tighter with each column the design added. The design scrolls the
 * table sideways instead, which is what the DS `Table` does — so the lists use
 * it directly and only add the empty state around it.
 *
 * The table bleeds past the card's padding so it can scroll edge to edge; the
 * negative margin is cancelled by the cells' own 16px padding, leaving the
 * first column aligned with the rest of the card.
 */
export function RecordTable<T>({
  columns,
  data,
  rowKey,
  noun,
  searchStatus,
  isSourceEmpty,
  onCreateQuote,
  onRowPress,
}: RecordTableProps<T>) {
  if (data.length === 0) {
    return (
      <ListEmptyState
        status={searchStatus}
        noun={noun}
        showCreate={isSourceEmpty}
        onCreateQuote={onCreateQuote}
      />
    );
  }

  return (
    <View style={styles.bleed}>
      <Table
        columns={columns}
        data={data}
        rowKey={rowKey}
        onRowPress={onRowPress ? (row) => onRowPress(row) : undefined}
        style={styles.table}
      />
    </View>
  );
}

/**
 * Standard text cell. `strong` marks the row's identifying field (customer,
 * premium); `note` adds a muted second line, e.g. a duplicate's "Copy of …".
 */
export const TextCell: React.FC<{
  value: string;
  strong?: boolean;
  note?: string;
  /** Must mirror the column's own `align` — see the note on `styles.right`. */
  align?: 'left' | 'right';
}> = ({ value, strong, note, align }) => {
  const alignment = align === 'right' && styles.right;
  return (
    <View style={styles.cell}>
      <Text style={[strong ? styles.strong : styles.text, alignment]} numberOfLines={1}>
        {value}
      </Text>
      {note ? (
        <Text style={[styles.note, alignment]} numberOfLines={1}>
          {note}
        </Text>
      ) : null}
    </View>
  );
};

/** Status pill — same badge treatment the card rows used. */
export const StatusCell: React.FC<{ label: string; color: AccentColor }> = ({ label, color }) => (
  <Badge variant="light" size="sm" color={color} label={label} />
);

const styles = StyleSheet.create({
  cell: { flex: 1, justifyContent: 'center' },
  text: { fontFamily: typography.fontFamily, ...typography.body2, color: colors.textBody },
  strong: {
    fontFamily: fontFamilyForWeight('500'),
    ...typography.body2,
    fontWeight: '500',
    color: colors.textHeading,
  },
  note: { fontFamily: typography.fontFamily, ...typography.body3, color: colors.textMuted },
  // The cell wrapper is `flex: 1`, so it already fills the column and the
  // column's own `justifyContent` has nothing left to push. Align the text
  // itself instead, or a right-aligned header won't match its values.
  right: { textAlign: 'right' },
  bleed: {
    marginHorizontal: -CARD_PADDING,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  // Square corners: the table spans the card's full width, so its own radius
  // would cut into the card's edges rather than reading as a rounded surface.
  table: { borderRadius: 0 },
});
