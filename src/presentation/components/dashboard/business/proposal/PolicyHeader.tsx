import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heartbeat, DownloadSimple } from 'phosphor-react-native';
import { Button, colors, spacing, radius, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';

interface PolicyHeaderProps {
  policyNumber: string;
  customerName: string;
  onDownloadQuote?: () => void;
  onViewDetails?: () => void;
}

export const PolicyHeader: React.FC<PolicyHeaderProps> = ({ policyNumber, customerName, onDownloadQuote, onViewDetails }) => (
  <View style={styles.card}>
    <View style={styles.left}>
      <View style={styles.iconBox}>
        <Heartbeat size={20} color="#DB2777" />
      </View>
      <Text style={styles.title} numberOfLines={1}>{policyNumber} - {customerName}</Text>
    </View>
    <View style={styles.actions}>
      <Button label="Download Quote" variant="link" size="sm" leadingIcon={<DownloadSimple size={16} color={colors.brand} />} onPress={onDownloadQuote} fullWidth />
      <Button label="View Quote Details" variant="secondaryGray" size="sm" onPress={onViewDetails} fullWidth />
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Stacked, not a wrapping row: the web header put the title and its actions
  // on one line, which on a phone squeezed the title into an ellipsis while
  // the actions wrapped underneath anyway. As a column the title gets the full
  // width and the actions read as one group.
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.surface, ...shadow.lg },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: '#FDF2F8', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '500', color: colors.textHeading },
  /**
   * One action per row, each full width.
   *
   * These sat side by side and wrapped once the labels outgrew the card, which
   * left the two buttons on separate lines at different widths and different
   * alignments — the ragged result depended entirely on the device width.
   * Stacking is deterministic: it looks the same on every screen.
   */
  actions: { gap: spacing.sm },
});
