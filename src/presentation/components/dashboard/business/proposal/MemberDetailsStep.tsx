import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus, Trash } from 'phosphor-react-native';
import { Textfield, Dropdown, DatePicker, Button, Radio, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { MEMBER_RELATIONSHIPS, formatIndianCurrency, numericOnly, type ProposalMember } from './proposalData';

interface MemberDetailsStepProps {
  members: ProposalMember[];
  updateMember: (id: string, field: keyof ProposalMember, value: ProposalMember[keyof ProposalMember]) => void;
  addMember: () => void;
  removeMember: (id: string) => void;
}

export const MemberDetailsStep: React.FC<MemberDetailsStepProps> = ({ members, updateMember, addMember, removeMember }) => (
  <View style={styles.wrap}>
    {members.map((m, i) => (
      <View key={m.id} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.heading}>Member #{i + 1}</Text>
          {members.length > 1 ? (
            <Pressable onPress={() => removeMember(m.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove member">
              <Trash size={18} color={colors.dangerText} />
            </Pressable>
          ) : null}
        </View>
        <Textfield label="Name *" value={m.name} onChangeText={(t) => updateMember(m.id, 'name', t)} placeholder="Enter full name" />
        <Dropdown label="Relationship with proposer *" placeholder="Select relationship" value={m.relationship || null} options={MEMBER_RELATIONSHIPS} onChange={(v) => updateMember(m.id, 'relationship', v)} />
        <DatePicker label="Date of Birth *" placeholder="Select DOB" value={m.dob} onChange={(d) => updateMember(m.id, 'dob', d)} />
        <View style={styles.row}>
          <View style={styles.col}>
            <Textfield label="Height (cm)" value={m.height} onChangeText={(t) => updateMember(m.id, 'height', numericOnly(t))} placeholder="Height" keyboardType="number-pad" />
          </View>
          <View style={styles.col}>
            <Textfield label="Weight (kg)" value={m.weight} onChangeText={(t) => updateMember(m.id, 'weight', numericOnly(t))} placeholder="Weight" keyboardType="number-pad" />
          </View>
        </View>
        <Textfield label="Sum Insured *" value={formatIndianCurrency(m.sumInsured)} onChangeText={(t) => updateMember(m.id, 'sumInsured', numericOnly(t))} placeholder="Rs. 15,00,000" keyboardType="number-pad" />
        <Text style={styles.label}>Any Pre-existing Disease (PED)?</Text>
        <View style={styles.pedRow}>
          {[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }].map((opt) => (
            <Pressable key={opt.value} style={[styles.ped, m.hasPed === opt.value && styles.pedSel]} onPress={() => updateMember(m.id, 'hasPed', opt.value)} accessibilityRole="radio" accessibilityState={{ selected: m.hasPed === opt.value }}>
              <Radio selected={m.hasPed === opt.value} onPress={() => updateMember(m.id, 'hasPed', opt.value)} />
              <Text style={styles.pedLabel}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    ))}

    <Button label="Add Member" variant="secondaryGray" leadingIcon={<Plus size={16} color={colors.textBody} />} onPress={addMember} fullWidth />
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '500', color: colors.textHeading },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  pedRow: { flexDirection: 'row', gap: spacing.md },
  ped: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  pedSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  pedLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
});
