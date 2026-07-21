import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';
import { Textfield, DatePicker, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { formatIndianCurrency, numericOnly } from './healthData';

interface ProposerDetailsStepProps {
  proposerIsMember: boolean;
  setProposerIsMember: (val: boolean) => void;
  proposerName: string;
  setProposerName: (val: string) => void;
  proposerDOB: Date | null;
  setProposerDOB: (date: Date | null) => void;
  annualIncome: string;
  setAnnualIncome: (val: string) => void;
  pincode: string;
  setPincode: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  state: string;
  setState: (val: string) => void;
}

export const ProposerDetailsStep: React.FC<ProposerDetailsStepProps> = ({
  proposerIsMember,
  setProposerIsMember,
  proposerName,
  setProposerName,
  proposerDOB,
  setProposerDOB,
  annualIncome,
  setAnnualIncome,
  pincode,
  setPincode,
  city,
  setCity,
  state,
  setState,
}) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.heading}>Proposer details</Text>
      <Pressable style={styles.checkRow} onPress={() => setProposerIsMember(!proposerIsMember)} accessibilityRole="checkbox" accessibilityState={{ checked: proposerIsMember }}>
        <View style={[styles.checkbox, proposerIsMember && styles.checkboxSel]}>
          {proposerIsMember ? <Check size={12} color="#FFFFFF" weight="bold" /> : null}
        </View>
        <Text style={styles.checkLabel}>Proposer is a member within the plan</Text>
      </Pressable>
    </View>

    <View style={styles.fields}>
      <Textfield label="Proposer name *" value={proposerName} onChangeText={setProposerName} placeholder="Enter full name" />
      <DatePicker label="Date of Birth *" placeholder="Select DOB" value={proposerDOB} onChange={setProposerDOB} />
      <Textfield
        label="Annual Family Income *"
        value={annualIncome ? formatIndianCurrency(annualIncome) : ''}
        onChangeText={(t) => setAnnualIncome(numericOnly(t))}
        placeholder="Rs."
        keyboardType="number-pad"
      />
      <Textfield
        label="Pincode *"
        value={pincode}
        onChangeText={(t) => {
          const v = numericOnly(t).slice(0, 6);
          setPincode(v);
          if (v.length === 6) {
            setCity('New Delhi');
            setState('Delhi');
          }
        }}
        placeholder="Enter pincode"
        keyboardType="number-pad"
      />
      <Textfield label="City" value={city} onChangeText={setCity} placeholder="" />
      <Textfield label="State" value={state} onChangeText={setState} placeholder="" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  header: { gap: spacing.md },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: { width: 18, height: 18, borderRadius: radius.xs, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxSel: { backgroundColor: colors.brand, borderColor: colors.brand },
  checkLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading, flexShrink: 1 },
  fields: { gap: spacing.md },
});
