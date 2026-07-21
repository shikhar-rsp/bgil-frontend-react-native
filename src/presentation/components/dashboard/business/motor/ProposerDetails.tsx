import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Textfield, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';

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
      <Textfield label="Name *" value={proposerName} onChangeText={setProposerName} placeholder="Enter full name" />
      <Textfield
        label="Phone number *"
        value={proposerPhone}
        onChangeText={(t) => setProposerPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
        placeholder="+91"
        keyboardType="number-pad"
      />
      <Textfield
        label="Enter Email ID *"
        value={proposerEmail}
        onChangeText={setProposerEmail}
        placeholder="example@email.com"
        keyboardType="email-address"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  fields: { gap: spacing.md },
});
