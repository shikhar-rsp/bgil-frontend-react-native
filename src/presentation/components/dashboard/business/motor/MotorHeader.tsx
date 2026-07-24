import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Car, DownloadSimple } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';

interface MotorHeaderProps {
  /** Selected product label, e.g. "Two Wheeler" / "Private Car". */
  productName?: string;
  onDownloadBrochure?: () => void;
  onViewFeatures?: () => void;
}

/** "Two Wheeler" → "2 Wheeler"; everything else falls back to "4 Wheeler". */
export const motorWheelerLabel = (productName?: string): string =>
  productName?.toLowerCase().includes('two wheeler') ? '2 Wheeler' : '4 Wheeler';

/** Header title, e.g. "2 Wheeler - Motor Policy". */
export const motorPolicyTitle = (productName?: string): string =>
  `${motorWheelerLabel(productName)} - Motor Policy`;

export const MotorHeader: React.FC<MotorHeaderProps> = ({ productName, onDownloadBrochure, onViewFeatures }) => (
  <View style={styles.card}>
    <View style={styles.left}>
      {/* <View style={styles.iconBox}>
        <Car size={24} color="#EA580C" />
      </View> */}
      <Text style={styles.title}>{motorPolicyTitle(productName)}</Text>
    </View>
    <View style={styles.actions}>
      <Button label="View features" variant="secondaryGray" size="md" onPress={onViewFeatures} />
      <Button
        label="Brochure"
        variant="link"
        size="md"
        leadingIcon={<DownloadSimple size={18} color={colors.brand} />}
        onPress={onDownloadBrochure}
      />

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
  title: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading, flexShrink: 1 },
  actions: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});
