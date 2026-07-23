import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Textfield,
  TextArea,
  Dropdown,
  DatePicker,
  Card,
  Radio,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { RequiredField, RequiredLabel } from '../RequiredField';
import {
  GENDER_OPTIONS,
  NATIONALITY_OPTIONS,
  MARITAL_OPTIONS,
  OCCUPATION_OPTIONS,
  formatIndianCurrency,
  numericOnly,
} from './proposalData';

export type ProposerData = {
  proposerName: string;
  proposerDOB: Date | null;
  annualIncome: string;
  contactNo: string;
  emailId: string;
  address: string;
  pincode: string;
  city: string;
  area: string;
  state: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  occupation: string;
};

interface ProposerDetailsStepProps {
  data: ProposerData;
  update: <K extends keyof ProposerData>(field: K, value: ProposerData[K]) => void;
}

export const ProposerDetailsStep: React.FC<ProposerDetailsStepProps> = ({ data, update }) => (
  <View style={styles.wrap}>
    <View style={styles.card}>
      <Text style={styles.heading}>Proposer Details</Text>
      <RequiredField label="Proposer Name">
        <Textfield value={data.proposerName} onChangeText={(t) => update('proposerName', t)} placeholder="Enter name" />
      </RequiredField>
      <RequiredField label="Date of Birth">
        <DatePicker placeholder="dd-mm-yyyy" value={data.proposerDOB} onChange={(d) => update('proposerDOB', d)} />
      </RequiredField>
      <RequiredField label="Annual Family Income">
        <Textfield value={data.annualIncome ? formatIndianCurrency(data.annualIncome) : ''} onChangeText={(t) => update('annualIncome', numericOnly(t))} placeholder="Rs." keyboardType="number-pad" />
      </RequiredField>
      <RequiredField label="Mobile Number">
        <Textfield value={data.contactNo} onChangeText={(t) => update('contactNo', numericOnly(t).slice(0, 10))} placeholder="Mobile number" keyboardType="number-pad" />
      </RequiredField>
      <RequiredField label="Email ID">
        <Textfield value={data.emailId} onChangeText={(t) => update('emailId', t)} placeholder="example@gmail.com" keyboardType="email-address" />
      </RequiredField>
      <RequiredField label="Permanent Address">
        <TextArea value={data.address} onChangeText={(t) => update('address', t)} placeholder="Enter address" />
      </RequiredField>
      <RequiredField label="Pincode">
        <Textfield value={data.pincode} onChangeText={(t) => { const v = numericOnly(t).slice(0, 6); update('pincode', v); if (v.length === 6) { update('city', 'New Delhi'); update('state', 'Delhi'); } }} placeholder="Pincode" keyboardType="number-pad" />
      </RequiredField>
      <Textfield label="City" value={data.city} onChangeText={(t) => update('city', t)} placeholder="City" />
      <RequiredField label="Area">
        <Textfield value={data.area} onChangeText={(t) => update('area', t)} placeholder="Area" />
      </RequiredField>
      <Textfield label="State" value={data.state} onChangeText={(t) => update('state', t)} placeholder="State" />
    </View>

    <View style={styles.card}>
      <Text style={styles.heading}>Personal Details</Text>
      <RequiredLabel text="Gender" />
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map((g) => (
          <Card
            key={g.value}
            selected={data.gender === g.value}
            onPress={() => update('gender', g.value)}
            style={styles.genderCard}
          >
            <View style={styles.genderInner}>
              <Radio selected={data.gender === g.value} onPress={() => update('gender', g.value)} />
              <Text style={styles.genderLabel}>{g.label}</Text>
            </View>
          </Card>
        ))}
      </View>
      <RequiredField label="Nationality">
        <Dropdown placeholder="Select" value={data.nationality || null} options={NATIONALITY_OPTIONS} onChange={(v) => update('nationality', v)} />
      </RequiredField>
      <RequiredField label="Marital Status">
        <Dropdown placeholder="Select" value={data.maritalStatus || null} options={MARITAL_OPTIONS} onChange={(v) => update('maritalStatus', v)} />
      </RequiredField>
      <RequiredField label="Occupation">
        <Dropdown placeholder="Select" value={data.occupation || null} options={OCCUPATION_OPTIONS} onChange={(v) => update('occupation', v)} />
      </RequiredField>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  // Override Card's default 12px padding for a tighter option chip.
  genderCard: { flex: 1, padding: spacing.sm },
  genderInner: { flex: 1, flexDirection: 'row', alignItems: 'center',gap: spacing.xs },
  genderLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
});
