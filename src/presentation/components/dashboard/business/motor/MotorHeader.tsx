import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Car, DownloadSimple } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';

interface MotorHeaderProps {
  onDownloadBrochure?: () => void;
  onViewFeatures?: () => void;
}

export const MotorHeader: React.FC<MotorHeaderProps> = ({ onDownloadBrochure, onViewFeatures }) => (
  <View style={styles.card}>
    <View style={styles.left}>
      <View style={styles.iconBox}>
        <Car size={24} color="#EA580C" />
      </View>
      <Text style={styles.title}>4 wheeler - Motor Policy</Text>
    </View>
    <View style={styles.actions}>
      <Button
        label="Brochure"
        variant="link"
        size="sm"
        leadingIcon={<DownloadSimple size={18} color={colors.brand} />}
        onPress={onDownloadBrochure}
      />
      <Button label="View features" variant="secondaryGray" size="sm" onPress={onViewFeatures} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadow.lg,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  iconBox: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '500', color: colors.textHeading, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
