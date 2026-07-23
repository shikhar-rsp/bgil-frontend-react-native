import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Plus, Trash, PencilSimple } from 'phosphor-react-native';
import { Accordion, Textfield, Dropdown, DatePicker, Button, Card, Tag, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredField } from '../RequiredField';
import { PEDDetailsModal, pedTagLabels } from './PEDDetailsModal';
import { MEMBER_RELATIONSHIPS, formatIndianCurrency, numericOnly, type ProposalMember } from './proposalData';

interface MemberDetailsStepProps {
  members: ProposalMember[];
  updateMember: (id: string, field: keyof ProposalMember, value: ProposalMember[keyof ProposalMember]) => void;
  addMember: () => void;
  removeMember: (id: string) => void;
}

export const MemberDetailsStep: React.FC<MemberDetailsStepProps> = ({ members, updateMember, addMember, removeMember }) => {
  // The member whose PED modal is open, if any.
  const [pedModalFor, setPedModalFor] = useState<string | null>(null);
  const activePedMember = members.find((m) => m.id === pedModalFor);

  return (
  <View style={styles.wrap}>
    <View style={styles.head}>
    <Text style={styles.title}>Member Details</Text>
    {members.map((m, i) => (
      <Accordion
        key={m.id}
        label={m.name.trim() || `Member #${i + 1}`}
        defaultOpen={i === 0}
        headerAction={
          members.length > 1 ? (
            <Pressable onPress={() => removeMember(m.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove member">
              <Trash size={18} color={colors.dangerText} />
            </Pressable>
          ) : undefined
        }
        style={styles.card}
      >
        <View style={styles.body}>
          <RequiredField label="Name">
            <Textfield value={m.name} onChangeText={(t) => updateMember(m.id, 'name', t)} placeholder="Enter full name" />
          </RequiredField>
          <RequiredField label="Relationship with proposer">
            <Dropdown placeholder="Select relationship" value={m.relationship || null} options={MEMBER_RELATIONSHIPS} onChange={(v) => updateMember(m.id, 'relationship', v)} />
          </RequiredField>
          <RequiredField label="Date of Birth">
            <DatePicker placeholder="Select DOB" value={m.dob} onChange={(d) => updateMember(m.id, 'dob', d)} />
          </RequiredField>
          <View style={styles.row}>
            <View style={styles.col}>
              <Textfield label="Height (cm)" value={m.height} onChangeText={(t) => updateMember(m.id, 'height', numericOnly(t))} placeholder="Height" keyboardType="number-pad" />
            </View>
            <View style={styles.col}>
              <Textfield label="Weight (kg)" value={m.weight} onChangeText={(t) => updateMember(m.id, 'weight', numericOnly(t))} placeholder="Weight" keyboardType="number-pad" />
            </View>
          </View>
          <RequiredField label="Sum Insured">
            <Textfield value={formatIndianCurrency(m.sumInsured)} onChangeText={(t) => updateMember(m.id, 'sumInsured', numericOnly(t))} placeholder="Rs. 15,00,000" keyboardType="number-pad" />
          </RequiredField>
          {(() => {
            const hasPedSelection = m.hasPed === 'yes';
            const tags = pedTagLabels(m.peds);
            const textBlock = (
              <View style={styles.pedTextCol}>
                <Text style={styles.pedTitle}>Pre-existing Diseases</Text>
                <Text style={styles.pedSub}>Does this member have any PEDs?</Text>
              </View>
            );
            const yesNo = (
              <View style={styles.pedYesNo}>
                <Button
                  label="No"
                  size="sm"
                  variant={m.hasPed === 'no' ? 'primary' : 'secondaryGray'}
                  onPress={() => {
                    updateMember(m.id, 'hasPed', 'no');
                    updateMember(m.id, 'peds', undefined);
                  }}
                />
                <Button
                  label="Yes"
                  size="sm"
                  variant={hasPedSelection ? 'primary' : 'secondaryGray'}
                  onPress={() => {
                    updateMember(m.id, 'hasPed', 'yes');
                    setPedModalFor(m.id);
                  }}
                />
              </View>
            );
            return (
              <Card style={styles.pedCard}>
                {/* RN has no radial gradient — approximate `at 50% 0%` with a
                    top→bottom white→tint LinearGradient. */}
                <LinearGradient colors={['#FFFFFF', '#EFF6FF']} style={StyleSheet.absoluteFill} />
                <View style={styles.pedInner}>
                  {hasPedSelection ? (
                    <>
                      {textBlock}
                      <View style={styles.pedActions}>
                        <Button
                          label="Edit PED Details"
                          variant="link"
                          size="sm"
                          leadingIcon={<PencilSimple size={16} color={colors.brand} />}
                          onPress={() => setPedModalFor(m.id)}
                        />
                        {yesNo}
                      </View>
                      {tags.length > 0 ? (
                        <View style={styles.pedTags}>
                          {tags.map((label) => (
                            <Tag key={label} size="sm" selected label={label} />
                          ))}
                        </View>
                      ) : null}
                    </>
                  ) : (
                    // "No"/unselected: compact — title left, No/Yes at top right.
                    <View style={styles.pedTopRow}>
                      {textBlock}
                      {yesNo}
                    </View>
                  )}
                </View>
              </Card>
            );
          })()}
        </View>
      </Accordion>
    ))}

    <Button label="Add Member" variant="secondaryGray" leadingIcon={<Plus size={16} color={colors.textBody} />} onPress={addMember} fullWidth />
    </View>

    <PEDDetailsModal
      isOpen={activePedMember != null}
      memberName={activePedMember?.name || 'this member'}
      initialData={activePedMember?.peds}
      onClose={() => setPedModalFor(null)}
      onConfirm={(data) => {
        if (activePedMember) {
          updateMember(activePedMember.id, 'peds', data);
        }
        setPedModalFor(null);
      }}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  head: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  title: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply it here.
  body: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  // PED card: gradient bg lives behind; override Card's border to the blue tint.
  pedCard: { borderColor: '#BFDBFE' },
  pedInner: { flex: 1, gap: spacing.sm },
  // Compact "No"/unselected layout: title left, No/Yes at the top right.
  pedTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  pedTextCol: { flexShrink: 1 },
  pedTitle: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading },
  pedSub: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 18, color: colors.textBody },
  // Edit on the left, No/Yes group pushed to the right.
  pedActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  pedYesNo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pedTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
