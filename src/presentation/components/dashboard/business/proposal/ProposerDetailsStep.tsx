import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Textfield,
  TextArea,
  Dropdown,
  DatePicker,
  Radio,
  colors,
  spacing,
  radius,
  typography,
  shadow,
} from '@atlas-ds/react-native';
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
      <Textfield label="Proposer Name *" value={data.proposerName} onChangeText={(t) => update('proposerName', t)} placeholder="Enter name" />
      <DatePicker label="Date of Birth *" placeholder="dd-mm-yyyy" value={data.proposerDOB} onChange={(d) => update('proposerDOB', d)} />
      <Textfield label="Annual Family Income *" value={data.annualIncome ? formatIndianCurrency(data.annualIncome) : ''} onChangeText={(t) => update('annualIncome', numericOnly(t))} placeholder="Rs." keyboardType="number-pad" />
      <Textfield label="Mobile Number *" value={data.contactNo} onChangeText={(t) => update('contactNo', numericOnly(t).slice(0, 10))} placeholder="Mobile number" keyboardType="number-pad" />
      <Textfield label="Email ID *" value={data.emailId} onChangeText={(t) => update('emailId', t)} placeholder="example@gmail.com" keyboardType="email-address" />
      <TextArea label="Permanent Address *" value={data.address} onChangeText={(t) => update('address', t)} placeholder="Enter address" />
      <Textfield label="Pincode *" value={data.pincode} onChangeText={(t) => { const v = numericOnly(t).slice(0, 6); update('pincode', v); if (v.length === 6) { update('city', 'New Delhi'); update('state', 'Delhi'); } }} placeholder="Pincode" keyboardType="number-pad" />
      <Textfield label="City" value={data.city} onChangeText={(t) => update('city', t)} placeholder="City" />
      <Textfield label="Area *" value={data.area} onChangeText={(t) => update('area', t)} placeholder="Area" />
      <Textfield label="State" value={data.state} onChangeText={(t) => update('state', t)} placeholder="State" />
    </View>

    <View style={styles.card}>
      <Text style={styles.heading}>Personal Details</Text>
      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map((g) => (
          <Pressable key={g.value} style={[styles.gender, data.gender === g.value && styles.genderSel]} onPress={() => update('gender', g.value)} accessibilityRole="radio" accessibilityState={{ selected: data.gender === g.value }}>
            <Radio selected={data.gender === g.value} onPress={() => update('gender', g.value)} />
            <Text style={styles.genderLabel}>{g.label}</Text>
          </Pressable>
        ))}
      </View>
      <Dropdown label="Nationality" placeholder="Select" value={data.nationality || null} options={NATIONALITY_OPTIONS} onChange={(v) => update('nationality', v)} />
      <Dropdown label="Marital Status" placeholder="Select" value={data.maritalStatus || null} options={MARITAL_OPTIONS} onChange={(v) => update('maritalStatus', v)} />
      <Dropdown label="Occupation" placeholder="Select" value={data.occupation || null} options={OCCUPATION_OPTIONS} onChange={(v) => update('occupation', v)} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  gender: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.sm },
  genderSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  genderLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
});
