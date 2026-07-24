import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Textfield, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredField } from '../RequiredField';

interface ProposerDetailsProps {
  proposerName: string;
  setProposerName: (val: string) => void;
  proposerPhone: string;
  setProposerPhone: (val: string) => void;
  proposerEmail: string;
  setProposerEmail: (val: string) => void;
}

export const ProposerDetails: React.FC<ProposerDetailsProps> = ({
  proposerName,
  setProposerName,
  proposerPhone,
  setProposerPhone,
  proposerEmail,
  setProposerEmail,
}) => (
  <View style={styles.card}>
    <Text style={styles.heading}>Proposer Details</Text>
    <View style={styles.fields}>
      <RequiredField label="Name">
        <Textfield value={proposerName} onChangeText={setProposerName} placeholder="Enter full name" />
      </RequiredField>
      <RequiredField label="Phone number">
        <Textfield
          value={proposerPhone}
          onChangeText={(t) => setProposerPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
          placeholder="+91"
          keyboardType="number-pad"
        />
      </RequiredField>
      <RequiredField label="Enter Email ID">
        <Textfield
          value={proposerEmail}
          onChangeText={setProposerEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
        />
      </RequiredField>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  fields: { gap: spacing.md },
});
