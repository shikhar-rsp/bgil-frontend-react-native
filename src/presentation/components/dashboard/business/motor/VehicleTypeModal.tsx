import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FilePlus, FileText, type IconProps } from 'phosphor-react-native';
import { BottomSheet, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';

type VehicleType = 'registered' | 'new';

interface VehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (type: VehicleType) => void;
}

const OPTIONS: { type: VehicleType; title: string; sub: string; Icon: React.ComponentType<IconProps>; iconBg: string; border: string }[] = [
  { type: 'registered', title: 'Registered Vehicle', sub: 'Vehicle has registration number', Icon: FileText, iconBg: '#2563EB', border: '#BFDBFE' },
  { type: 'new', title: 'New Vehicle (Unregistered)', sub: 'Enter details manually.', Icon: FilePlus, iconBg: '#EA580C', border: '#FED7AA' },
];

export const VehicleTypeModal: React.FC<VehicleTypeModalProps> = ({ isOpen, onClose, onProceed }) => (
  <BottomSheet
    visible={isOpen}
    onClose={onClose}
    title="Select Vehicle Type"
    subtitle="Choose a vehicle type to proceed with quote creation"
    contentMinHeight={0}
  >
    <View style={styles.options}>
      {OPTIONS.map((o) => (
        <Pressable
          key={o.type}
          style={[styles.option, { borderColor: o.border }]}
          onPress={() => onProceed(o.type)}
          accessibilityRole="button"
          accessibilityLabel={o.title}
        >
          <View style={[styles.optIcon, { backgroundColor: o.iconBg }]}>
            <o.Icon size={24} color="#FFFFFF" />
          </View>
          <View style={styles.optText}>
            <Text style={styles.optTitle}>{o.title}</Text>
            <Text style={styles.optSub}>{o.sub}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  </BottomSheet>
);

const styles = StyleSheet.create({
  options: { gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  optIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  optText: { flex: 1, gap: spacing.xs },
  optTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 15, fontWeight: '500', color: colors.textHeading },
  optSub: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
});
