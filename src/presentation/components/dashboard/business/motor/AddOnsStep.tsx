import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Checkbox, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard, motorColors } from './motorUi';
import {
  ADD_ONS,
  formatRupees,
  isAddOnAvailable,
  isTooOldForAddOns,
  type AddOn,
} from './motorQuoteData';

const AddOnRow: React.FC<{
  addOn: AddOn;
  isSelected: boolean;
  isAvailable: boolean;
  onToggle: () => void;
}> = ({ addOn, isSelected, isAvailable, onToggle }) => (
  <Pressable
    onPress={isAvailable ? onToggle : undefined}
    disabled={!isAvailable}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: isSelected, disabled: !isAvailable }}
    style={[
      styles.row,
      !isAvailable
        ? styles.rowDisabled
        : isSelected
          ? styles.rowSelected
          : styles.rowDefault,
    ]}
  >
    <View style={styles.rowBody}>
      {/* The row is the touch target — the box only reflects state. */}
      <Checkbox checked={isSelected && isAvailable} disabled={!isAvailable} size="sm" />

      <View style={styles.rowText}>
        <Text style={isAvailable ? styles.label : styles.labelDisabled}>
          {addOn.label}
        </Text>
        <Text style={isAvailable ? styles.description : styles.labelDisabled}>
          {addOn.description}
        </Text>
      </View>
    </View>

    <Text style={isAvailable ? styles.price : styles.labelDisabled}>
      {isAvailable ? `+ Rs. ${formatRupees(addOn.price)}` : '--'}
    </Text>
  </Pressable>
);

interface AddOnsStepProps {
  selectedAddOns: string[];
  setSelectedAddOns: React.Dispatch<React.SetStateAction<string[]>>;
  vehicleManufacturingYear: string;
}

export const AddOnsStep: React.FC<AddOnsStepProps> = ({
  selectedAddOns,
  setSelectedAddOns,
  vehicleManufacturingYear,
}) => {
  const [doNotWantAddOns, setDoNotWantAddOns] = useState(false);

  const isOlderThan15Years = isTooOldForAddOns(vehicleManufacturingYear);

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  // Selections made before the vehicle turned out to be ineligible would
  // otherwise keep billing in the premium breakup.
  useEffect(() => {
    setSelectedAddOns((prev) =>
      prev.filter((id) => {
        const addOn = ADD_ONS.find((item) => item.id === id);
        return addOn ? isAddOnAvailable(addOn, vehicleManufacturingYear) : false;
      }),
    );
  }, [vehicleManufacturingYear, setSelectedAddOns]);

  return (
    <MotorCard
      title="Select Add-ons"
      action={
        <Pressable
          onPress={() =>
            setDoNotWantAddOns((prev) => {
              const next = !prev;
              // Choosing "do not want add-ons" clears any selections.
              if (next) setSelectedAddOns([]);
              return next;
            })
          }
          accessibilityRole="checkbox"
          accessibilityState={{ checked: doNotWantAddOns }}
          style={styles.optOut}
        >
          {/* Same as the NCB tiles: `Checkbox` aligns itself to flex-start for
              its labelled case, which would override this row's centring. */}
          <Checkbox checked={doNotWantAddOns} size="sm" style={styles.optOutBox} />
          <Text style={styles.optOutLabel}>Do not want Add-ons</Text>
        </Pressable>
      }
    >
      {doNotWantAddOns ? null : (
        <View style={styles.list}>
          {ADD_ONS.map((addOn) => (
            <AddOnRow
              key={addOn.id}
              addOn={addOn}
              isAvailable={
                !isOlderThan15Years && isAddOnAvailable(addOn, vehicleManufacturingYear)
              }
              isSelected={selectedAddOns.includes(addOn.id)}
              onToggle={() => toggleAddOn(addOn.id)}
            />
          ))}
        </View>
      )}
    </MotorCard>
  );
};

const styles = StyleSheet.create({
  optOut: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optOutBox: { alignSelf: 'center' },
  optOutLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },

  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  rowDefault: { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
  rowSelected: { borderColor: motorColors.selectedBorder, backgroundColor: motorColors.infoFill },
  rowDisabled: { borderColor: colors.borderSubtle, backgroundColor: motorColors.disabledFill },

  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  rowText: { flex: 1 },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  description: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: '#64748B' },
  labelDisabled: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  price: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textHeading,
  },
});
