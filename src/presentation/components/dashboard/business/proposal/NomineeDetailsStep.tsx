import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus, Trash } from 'phosphor-react-native';
import { Textfield, Dropdown, DatePicker, Button, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { NOMINEE_RELATIONSHIPS, type Nominee } from './proposalData';

interface NomineeDetailsStepProps {
  nominees: Nominee[];
  updateNominee: (id: string, field: keyof Nominee, value: Nominee[keyof Nominee]) => void;
  addNominee: () => void;
  removeNominee: (id: string) => void;
}

export const NomineeDetailsStep: React.FC<NomineeDetailsStepProps> = ({ nominees, updateNominee, addNominee, removeNominee }) => (
  <View style={styles.wrap}>
    {nominees.map((n, i) => (
      <View key={n.id} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.heading}>Nominee #{i + 1}</Text>
          {nominees.length > 1 ? (
            <Pressable onPress={() => removeNominee(n.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove nominee">
              <Trash size={18} color={colors.dangerText} />
            </Pressable>
          ) : null}
        </View>
        <Textfield label="Nominee name *" value={n.name} onChangeText={(t) => updateNominee(n.id, 'name', t)} placeholder="Enter full name" />
        <Dropdown label="Relationship with insured *" placeholder="Select relationship" value={n.relationship || null} options={NOMINEE_RELATIONSHIPS} onChange={(v) => updateNominee(n.id, 'relationship', v)} />
        <DatePicker label="Date of Birth *" placeholder="Select DOB" value={n.dob} onChange={(d) => updateNominee(n.id, 'dob', d)} />
      </View>
    ))}
    <Button label="Add Nominee" variant="secondaryGray" leadingIcon={<Plus size={16} color={colors.textBody} />} onPress={addNominee} fullWidth />
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '500', color: colors.textHeading },
});
