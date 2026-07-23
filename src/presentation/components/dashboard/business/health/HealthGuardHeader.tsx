import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heartbeat, DownloadSimple } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';

interface HealthGuardHeaderProps {
  productName: string;
  onDownloadBrochure?: () => void;
  onViewFeatures?: () => void;
}

export const HealthGuardHeader: React.FC<HealthGuardHeaderProps> = ({
  productName,
  onDownloadBrochure,
  onViewFeatures,
}) => (
  <View style={styles.card}>
    <View style={styles.left}>
      <View style={styles.iconBox}>
        <Heartbeat size={20} color="#DB2777" />
      </View>
      <Text style={styles.title}>{productName || 'Health Guard Policy'}</Text>
    </View>
    <View style={styles.actions}>
      <Button
        label="Brochure"
        variant="link"
        size="sm"
        leadingIcon={<DownloadSimple size={16} color={colors.brand} />}
        onPress={onDownloadBrochure}
      />
      <Button label="View features" variant="secondaryGray" size="sm" onPress={onViewFeatures} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.surface, ...shadow.lg },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: '#FDF2F8', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '500', color: colors.textHeading, flexShrink: 1 },
  actions: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
});
