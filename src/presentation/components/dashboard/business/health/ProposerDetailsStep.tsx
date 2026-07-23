import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Checkbox, Textfield, DatePicker, colors, spacing, radius, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredField } from './RequiredField';
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
      <Checkbox
        size='sm'
        checked={proposerIsMember}
        onChange={setProposerIsMember}
        label="Proposer is a member within the plan"
      />
    </View>

    <View style={styles.fields}>
      <RequiredField label="Proposer name">
        <Textfield value={proposerName} onChangeText={setProposerName} placeholder="Enter full name" />
      </RequiredField>
      <RequiredField label="Date of Birth">
        <DatePicker placeholder="Select DOB" value={proposerDOB} onChange={setProposerDOB} />
      </RequiredField>
      <RequiredField label="Annual Family Income">
        <Textfield
          value={annualIncome ? formatIndianCurrency(annualIncome) : ''}
          onChangeText={(t) => setAnnualIncome(numericOnly(t))}
          placeholder="Rs."
          keyboardType="number-pad"
        />
      </RequiredField>
      <RequiredField label="Pincode">
        <Textfield
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
      </RequiredField>
      <Textfield label="City" value={city} onChangeText={setCity} placeholder="" />
      <Textfield label="State" value={state} onChangeText={setState} placeholder="" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  header: { gap: spacing.md },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  fields: { gap: spacing.md },
});
