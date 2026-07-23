import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accordion, Checkbox, Slider, Textfield, Dropdown, DatePicker, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredField, RequiredLabel } from '../RequiredField';
import { NOMINEE_RELATIONSHIPS, newNominee, type Nominee, type ProposalMember } from './proposalData';

interface NomineeDetailsStepProps {
  /** Nominees mirror the members added in the Member Details step. */
  members: ProposalMember[];
  /** Nominee data keyed by member id. */
  nominees: Record<string, Nominee>;
  updateNominee: (memberId: string, field: keyof Nominee, value: Nominee[keyof Nominee]) => void;
}

const ALLOCATION_MIN = 15;

export const NomineeDetailsStep: React.FC<NomineeDetailsStepProps> = ({ members, nominees, updateNominee }) => {
  const [keepSame, setKeepSame] = useState(false);

  // With "keep same" on, a change applies to every member's nominee at once.
  const setField = (memberId: string, field: keyof Nominee, value: Nominee[keyof Nominee]) => {
    if (keepSame) {
      members.forEach((m) => updateNominee(m.id, field, value));
    } else {
      updateNominee(memberId, field, value);
    }
  };

  return (
    <View style={styles.head}>
      <Text style={styles.title}>Add Nominee</Text>
      <Checkbox
        size="sm"
        checked={keepSame}
        onChange={setKeepSame}
        label="Keep nominee details same for all members"
      />

      {members.map((m, i) => {
        const n = nominees[m.id] ?? newNominee(m.id);
        const complete = !!(n.name.trim() && n.relationship && n.dob);
        const alloc = Number(n.allocation) || ALLOCATION_MIN;
        return (
          <Accordion
            key={m.id}
            label={m.name.trim() || `Member #${i + 1}`}
            defaultOpen={i === 0}
            badgeText={complete ? 'Nominee added' : 'Nominee not added'}
            badgeColor={complete ? 'emerald' : 'red'}
            badgeVariant="light"
            style={styles.card}
          >
            <View style={styles.body}>
              <RequiredField label="Nominee name">
                <Textfield value={n.name} onChangeText={(t) => setField(m.id, 'name', t)} placeholder="Enter full name" />
              </RequiredField>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Relationship with insured</Text>
                <Dropdown placeholder="Select relationship" value={n.relationship || null} options={NOMINEE_RELATIONSHIPS} onChange={(v) => setField(m.id, 'relationship', v)} />
              </View>
              <RequiredField label="Date of Birth">
                <DatePicker placeholder="Select DOB" value={n.dob} onChange={(d) => setField(m.id, 'dob', d)} />
              </RequiredField>

              <View style={styles.allocBlock}>
                <View style={styles.allocHeader}>
                  <RequiredLabel text="Allocation Percentage" />
                  <Text style={styles.allocValue}>{alloc}%</Text>
                </View>
                <Slider
                  min={ALLOCATION_MIN}
                  max={100}
                  value={alloc}
                  onChange={(v) => setField(m.id, 'allocation', String(typeof v === 'number' ? v : v[0]))}
                  showDataRange={false}
                />
                <View style={styles.allocRange}>
                  <Text style={styles.allocRangeText}>{ALLOCATION_MIN}%</Text>
                  <Text style={styles.allocRangeText}>100%</Text>
                </View>
              </View>
            </View>
          </Accordion>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  head: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  title: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  card: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply it here.
  body: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  field: { gap: spacing.sm, alignSelf: 'stretch' },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  allocBlock: { gap: spacing.xs },
  allocHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  allocValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  allocRange: { flexDirection: 'row', justifyContent: 'space-between' },
  allocRangeText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
});
