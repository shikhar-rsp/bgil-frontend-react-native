import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check, Warning, X } from 'phosphor-react-native';
import { Badge, Button, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MAIN_PACKAGES, TOPUP_PACKAGES } from './motorData';

interface AddOnsStepProps {
  setShowSkipAddonsModal: (val: boolean) => void;
  selectedAddOns: string[];
  setSelectedAddOns: React.Dispatch<React.SetStateAction<string[]>>;
  vehicleManufacturingYear: string;
}

const AddOnRow: React.FC<{ label: string; price: string; selected: boolean; onPress: () => void }> = ({
  label,
  price,
  selected,
  onPress,
}) => (
  <Pressable
    style={[styles.addonRow, selected && styles.addonRowSel]}
    onPress={onPress}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
  >
    <View style={styles.addonLeft}>
      <View style={[styles.checkbox, selected && styles.checkboxSel]}>
        {selected ? <Check size={12} color="#FFFFFF" weight="bold" /> : null}
      </View>
      <Text style={styles.addonLabel}>{label}</Text>
    </View>
    <Text style={styles.addonPrice}>{price}</Text>
  </Pressable>
);

export const AddOnsStep: React.FC<AddOnsStepProps> = ({
  setShowSkipAddonsModal,
  selectedAddOns,
  setSelectedAddOns,
  vehicleManufacturingYear,
}) => {
  const [showAgeToast, setShowAgeToast] = useState(true);

  const toggle = (id: string) =>
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const year = Number(vehicleManufacturingYear);
  const hasValidYear = vehicleManufacturingYear.trim() !== '' && !Number.isNaN(year) && year > 1900;
  const isOlderThan15 = hasValidYear && new Date().getFullYear() - year > 15;

  const countBy = (prefix: string) => selectedAddOns.filter((id) => id.startsWith(prefix)).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Select Add-ons?</Text>
        {!isOlderThan15 ? (
          <Button label="Skip Add-ons" variant="secondary" size="sm" onPress={() => setShowSkipAddonsModal(true)} />
        ) : null}
      </View>

      {isOlderThan15 && showAgeToast ? (
        <View style={styles.warnToast}>
          <Warning size={20} color={colors.warning} />
          <Text style={styles.warnText}>
            <Text style={styles.warnBold}>Cannot select add-ons. </Text>
            Vehicle is older than 15 years. Please refer to underwriting at the proposal stage.
          </Text>
          <Pressable onPress={() => setShowAgeToast(false)} hitSlop={8}>
            <X size={16} color={colors.textBody} />
          </Pressable>
        </View>
      ) : null}

      {!isOlderThan15 ? (
        <View style={styles.packages}>
          <View style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>Main Packages</Text>
              <Badge variant="solid" size="sm" color="neutral" label={String(countBy('main-'))} />
            </View>
            <View style={styles.packageList}>
              {MAIN_PACKAGES.map((pkg, i) => (
                <AddOnRow
                  key={pkg}
                  label={pkg}
                  price="+ Rs. 1200"
                  selected={selectedAddOns.includes(`main-${i}`)}
                  onPress={() => toggle(`main-${i}`)}
                />
              ))}
            </View>
          </View>

          <View style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>Top-up Packages</Text>
              <Badge variant="solid" size="sm" color="neutral" label={String(countBy('topup-'))} />
            </View>
            <View style={styles.packageList}>
              {TOPUP_PACKAGES.map((pkg, i) => (
                <AddOnRow
                  key={pkg}
                  label={pkg}
                  price="+ Rs. 1200"
                  selected={selectedAddOns.includes(`topup-${i}`)}
                  onPress={() => toggle(`topup-${i}`)}
                />
              ))}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  warnToast: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#FFFBEB', borderRadius: radius.lg, padding: spacing.md },
  warnText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  warnBold: { fontWeight: '500', color: colors.textHeading },
  packages: { gap: spacing.md },
  packageCard: { borderWidth: 1, borderColor: '#C7D2FE', borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  packageHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#EFF6FF', borderRadius: radius.sm, padding: spacing.md },
  packageTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, fontWeight: '500', color: colors.textHeading },
  packageList: { gap: spacing.sm },
  addonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg },
  addonRowSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  addonLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  checkbox: { width: 18, height: 18, borderRadius: radius.xs, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxSel: { backgroundColor: colors.brand, borderColor: colors.brand },
  addonLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading, flex: 1 },
  addonPrice: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
});
