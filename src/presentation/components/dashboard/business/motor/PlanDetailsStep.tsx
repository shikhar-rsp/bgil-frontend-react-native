import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Dropdown, Radio, DatePicker, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { PLAN_TYPE_OPTIONS } from './motorData';

type VehicleType = 'registered' | 'new' | null;

interface PlanDetailsStepProps {
  vehicleType: VehicleType;
  selectedPlanType: string;
  setSelectedPlanType: (val: string) => void;
  selectedCustomerType: string;
  setSelectedCustomerType: (val: 'partner' | 'institution') => void;
  policyStartDate: Date | null;
  setPolicyStartDate: (date: Date | null) => void;
  policyEndDate: Date | null;
  setPolicyEndDate: (date: Date | null) => void;
  policyTenure: string;
  setPolicyTenure: (val: string) => void;
  calculatePolicyEndDate: (startDate: Date | null, tenure: string) => void;
}

export const PlanDetailsStep: React.FC<PlanDetailsStepProps> = ({
  vehicleType,
  selectedPlanType,
  setSelectedPlanType,
  selectedCustomerType,
  setSelectedCustomerType,
  policyStartDate,
  setPolicyStartDate,
  policyEndDate,
  setPolicyEndDate,
  policyTenure,
  setPolicyTenure,
  calculatePolicyEndDate,
}) => {
  useEffect(() => {
    if (vehicleType === 'new' && selectedPlanType !== 'package-policy') {
      setSelectedPlanType('package-policy');
    }
  }, [vehicleType, selectedPlanType, setSelectedPlanType]);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Choose Plan</Text>

      <Dropdown
        label="Select Policy Plan *"
        value="four-wheeler"
        options={[{ label: 'Four Wheeler', value: 'four-wheeler' }]}
        onChange={() => undefined}
      />

      <Dropdown
        label="Select Plan Type *"
        placeholder="Select plan Type"
        value={vehicleType === 'new' ? 'package-policy' : selectedPlanType || null}
        options={PLAN_TYPE_OPTIONS}
        disabled={vehicleType === 'new'}
        onChange={(val) => vehicleType !== 'new' && setSelectedPlanType(val)}
      />

      <View>
        <Text style={styles.label}>Type of Insured *</Text>
        <View style={styles.insuredRow}>
          {(['partner', 'institution'] as const).map((v) => (
            <Pressable
              key={v}
              style={[styles.insured, selectedCustomerType === v && styles.insuredSel]}
              onPress={() => setSelectedCustomerType(v)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedCustomerType === v }}
            >
              <Radio selected={selectedCustomerType === v} onPress={() => setSelectedCustomerType(v)} />
              <Text style={styles.insuredLabel}>{v === 'partner' ? 'Partner' : 'Institution'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {vehicleType !== 'new' ? (
        <View style={styles.dates}>
          <DatePicker
            label="Policy start date *"
            placeholder="Select start date"
            value={policyStartDate}
            onChange={(date) => {
              setPolicyStartDate(date);
              calculatePolicyEndDate(date, policyTenure);
            }}
          />
          <DatePicker
            label="Policy end date *"
            placeholder="Select end date"
            value={policyEndDate}
            onChange={(date) => {
              setPolicyEndDate(date);
              if (!policyStartDate || !date) {
                setPolicyTenure('');
                return;
              }
              const diffYears = Math.round(
                (date.getTime() - policyStartDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
              );
              if (selectedPlanType === 'package-policy') {
                const reverse: Record<number, string> = { 4: '1+3', 5: '2+3', 6: '1+5' };
                setPolicyTenure(reverse[diffYears] || '');
              } else {
                setPolicyTenure(String(diffYears));
              }
            }}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, marginBottom: spacing.xs },
  insuredRow: { flexDirection: 'row', gap: spacing.sm },
  insured: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  insuredSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  insuredLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  dates: { gap: spacing.md },
});
