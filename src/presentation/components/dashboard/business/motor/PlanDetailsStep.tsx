import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CaretDown } from 'phosphor-react-native';
import { Dropdown, Radio, DatePicker, BottomSheet, Checkbox, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredField } from '../RequiredField';
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
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const effectivePlanType = vehicleType === 'new' ? 'package-policy' : selectedPlanType;
  const planTypeLabel = PLAN_TYPE_OPTIONS.find((o) => o.value === effectivePlanType)?.label;

  useEffect(() => {
    if (vehicleType === 'new' && selectedPlanType !== 'package-policy') {
      setSelectedPlanType('package-policy');
    }
  }, [vehicleType, selectedPlanType, setSelectedPlanType]);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Choose Plan</Text>

      <RequiredField label="Select Policy Plan">
        <Dropdown
          value="four-wheeler"
          options={[{ label: 'Four Wheeler', value: 'four-wheeler' }]}
          onChange={() => undefined}
        />
      </RequiredField>

      <RequiredField label="Select Plan Type">
        <Pressable
          style={[styles.selectField, vehicleType === 'new' && styles.selectDisabled]}
          onPress={() => vehicleType !== 'new' && setPlanSheetOpen(true)}
          disabled={vehicleType === 'new'}
          accessibilityRole="button"
          accessibilityLabel="Select Plan Type"
        >
          <Text style={[styles.selectText, !planTypeLabel && styles.selectPlaceholder]} numberOfLines={1}>
            {planTypeLabel ?? 'Select plan Type'}
          </Text>
          <CaretDown size={20} color={colors.textBody} />
        </Pressable>
      </RequiredField>

      <BottomSheet
        visible={planSheetOpen}
        onClose={() => setPlanSheetOpen(false)}
        title="Select Plan Type"
        contentMinHeight={0}
      >
        <View style={styles.optionList}>
          {PLAN_TYPE_OPTIONS.map((opt) => {
            const pick = () => {
              setSelectedPlanType(opt.value);
              setPlanSheetOpen(false);
            };
            return (
              <Pressable key={opt.value} style={styles.optionRow} onPress={pick} accessibilityRole="button">
                <Checkbox size="sm" checked={selectedPlanType === opt.value} onChange={pick} />
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <View>
        <Text style={styles.label}>Type of Insured <Text style={styles.asterisk}>*</Text></Text>
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
          <RequiredField label="Policy start date">
            <DatePicker
              placeholder="Select start date"
              value={policyStartDate}
              onChange={(date) => {
                setPolicyStartDate(date);
                calculatePolicyEndDate(date, policyTenure);
              }}
            />
          </RequiredField>
          <RequiredField label="Policy end date">
            <DatePicker
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
          </RequiredField>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, marginBottom: spacing.xs },
  asterisk: { color: colors.dangerText },
  // Dropdown-style trigger that opens the "Select Plan Type" sheet.
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  selectDisabled: { backgroundColor: colors.surfaceMuted },
  selectText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  selectPlaceholder: { color: colors.textMuted },
  optionList: { gap: spacing.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  optionLabel: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
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
