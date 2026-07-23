import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heartbeat, DownloadSimple } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';

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
      <Button label="Download Quote" variant="link" size="sm" leadingIcon={<DownloadSimple size={16} color={colors.brand} />} onPress={onDownloadQuote} />
      <Button label="View Quote Details" variant="secondaryGray" size="sm" onPress={onViewDetails} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.surface, ...shadow.lg },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
  iconBox: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: '#FDF2F8', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '500', color: colors.textHeading, flexShrink: 1 },
  actions: { width: '100%',flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', gap: spacing.md },
});
