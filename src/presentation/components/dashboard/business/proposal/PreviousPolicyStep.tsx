import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Textfield, Dropdown, DatePicker, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { INSURER_OPTIONS, formatIndianCurrency, numericOnly } from './proposalData';

export type PreviousPolicyData = {
  policyNumber: string;
  insurer: string;
  sumInsured: string;
  startDate: Date | null;
  endDate: Date | null;
  cumulativeBonus: string;
};

interface PreviousPolicyStepProps {
  data: PreviousPolicyData;
  update: <K extends keyof PreviousPolicyData>(field: K, value: PreviousPolicyData[K]) => void;
}

export const PreviousPolicyStep: React.FC<PreviousPolicyStepProps> = ({ data, update }) => (
  <View style={styles.card}>
    <Text style={styles.heading}>Add Previous Policy details</Text>
    <Textfield label="Previous policy number *" value={data.policyNumber} onChangeText={(t) => update('policyNumber', t)} placeholder="Enter policy number" />
    <Dropdown label="Previous Insurer name *" placeholder="Select insurer name" value={data.insurer || null} options={INSURER_OPTIONS} onChange={(v) => update('insurer', v)} />
    <Textfield label="Sum insured *" value={formatIndianCurrency(data.sumInsured)} onChangeText={(t) => update('sumInsured', numericOnly(t))} placeholder="Enter amount" keyboardType="number-pad" />
    <View style={styles.row}>
      <View style={styles.col}>
        <DatePicker label="Start Date *" placeholder="Select start date" value={data.startDate} onChange={(d) => update('startDate', d)} />
      </View>
      <View style={styles.col}>
        <DatePicker label="End Date *" placeholder="Select end date" value={data.endDate} onChange={(d) => update('endDate', d)} />
      </View>
    </View>
    <Textfield label="Cumulative Bonus" value={data.cumulativeBonus} onChangeText={(t) => update('cumulativeBonus', numericOnly(t))} placeholder="Enter bonus" keyboardType="number-pad" />
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
});
