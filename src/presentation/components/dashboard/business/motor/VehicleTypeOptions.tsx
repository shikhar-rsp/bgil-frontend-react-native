import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FilePlus, FileText, type IconProps } from 'phosphor-react-native';
import { colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';

export type VehicleType = 'registered' | 'new';

/** Header copy, shared so the standalone sheet and the Quick Quotes step match. */
export const VEHICLE_TYPE_TITLE = 'Select Vehicle Type';
export const VEHICLE_TYPE_SUBTITLE = 'Choose a vehicle type to proceed with quote creation';

const OPTIONS: {
  type: VehicleType;
  title: string;
  sub: string;
  Icon: React.ComponentType<IconProps>;
  iconBg: string;
  border: string;
}[] = [
  { type: 'registered', title: 'Registered Vehicle', sub: 'Vehicle has registration number', Icon: FileText, iconBg: '#2563EB', border: '#BFDBFE' },
  { type: 'new', title: 'New Vehicle (Unregistered)', sub: 'Enter details manually.', Icon: FilePlus, iconBg: '#EA580C', border: '#FED7AA' },
];

/**
 * The two vehicle-type choices, with no sheet around them.
 *
 * This renders both as a standalone sheet (`VehicleTypeModal`, reached from
 * Browse Categories or from inside the motor flow) and as the second step of
 * the Quick Quotes sheet — so the markup lives here and neither owns it.
 */
export const VehicleTypeOptions: React.FC<{ onSelect: (type: VehicleType) => void }> = ({ onSelect }) => (
  <View style={styles.options}>
    {OPTIONS.map((o) => (
      <Pressable
        key={o.type}
        style={[styles.option, { borderColor: o.border }]}
        onPress={() => onSelect(o.type)}
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
