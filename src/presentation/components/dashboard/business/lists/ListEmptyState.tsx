import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info, MagnifyingGlass, XCircle } from 'phosphor-react-native';
import { accent, Button, colors, spacing, radius, typography } from '@atlas-ds/react-native';

/** Mirrors the web's `searchStatus`, minus the 'valid' case (which shows rows). */
export type SearchStatus = 'idle' | 'invalid' | 'no-result';

/**
 * A search term only counts as well-formed if it looks like a quote id, a
 * customer name, or a product — anything else (symbols, mixed junk) shows the
 * "Invalid search" state rather than an empty result. Ported from the web's
 * `isValidSearchFormat`.
 */
export const isValidSearchFormat = (value: string): boolean => {
  const v = value.trim();
  return /^QT\d+$/i.test(v) || /^[a-zA-Z\s]+$/.test(v) || /^[a-zA-Z0-9\s-]+$/.test(v);
};

/** Resolve the empty-state variant for a term / result-count pair. */
export const resolveSearchStatus = (term: string, resultCount: number): SearchStatus => {
  if (!term.trim()) {
    return 'idle';
  }
  if (!isValidSearchFormat(term)) {
    return 'invalid';
  }
  return resultCount > 0 ? 'idle' : 'no-result';
};

interface ListEmptyStateProps {
  status: SearchStatus;
  /** Noun used in the idle copy — 'quotes', 'proposals', … */
  noun?: string;
  /** Shown only when the underlying data set is genuinely empty. */
  onCreateQuote?: () => void;
  showCreate?: boolean;
}

export const ListEmptyState: React.FC<ListEmptyStateProps> = ({
  status,
  noun = 'quotes',
  onCreateQuote,
  showCreate = false,
}) => {
  const heading =
    status === 'invalid'
      ? 'Invalid search'
      : status === 'no-result'
        ? 'No result found'
        : `No data! Start creating ${noun} to view all information`;

  const detail =
    status === 'invalid'
      ? 'Please search by customer name, quote ID or product quote.'
      : status === 'no-result'
        ? 'We can’t find any record matching what you entered. Please try another search.'
        : null;

  return (
    <View style={styles.empty}>
      <View style={[styles.icon, status === 'invalid' && styles.iconDanger]}>
        {status === 'invalid' ? (
          <XCircle size={22} color={colors.dangerText} />
        ) : status === 'no-result' ? (
          <MagnifyingGlass size={22} color={colors.brand} />
        ) : (
          <Info size={22} color={colors.brand} />
        )}
      </View>

      <Text style={styles.heading}>{heading}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}

      {showCreate && onCreateQuote ? (
        <Button label="Create a Quote!" variant="secondaryGray" size="sm" onPress={onCreateQuote} style={styles.btn} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  icon: { padding: spacing.sm, borderRadius: radius.full, backgroundColor: colors.brandSubtle },
  iconDanger: { backgroundColor: accent.red.lightBg },
  heading: {
    fontFamily: typography.fontFamily,
    ...typography.body1,
    color: colors.textHeading,
    textAlign: 'center',
    maxWidth: 260,
  },
  detail: {
    fontFamily: typography.fontFamily,
    ...typography.body2,
    color: colors.textBody,
    textAlign: 'center',
    maxWidth: 280,
  },
  // Button defaults to `alignSelf: 'flex-start'` — centre it in the empty state.
  btn: { alignSelf: 'center' },
});
