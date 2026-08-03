import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Plus, Trash, PencilSimple } from 'phosphor-react-native';
import {
  Accordion,
  Badge,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Tag,
  Textfield,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { RequiredField } from '../RequiredField';
import { PEDDetailsModal, pedTags, removePedTag } from '../proposal/PEDDetailsModal';
import { CurrentPolicyCard } from './CurrentPolicyCard';
import type { Renewal } from '../businessData';
import {
  MEMBER_RELATIONSHIP_OPTIONS,
  RELATIONSHIP_LABELS,
  formatIndianCurrency,
  numericOnly,
  type RenewalMemberData,
  type RenewalMemberEntry,
} from './renewalData';

interface RenewalMemberStepProps {
  record?: Renewal;
  /** Members still on the policy, in list order. */
  members: RenewalMemberEntry[];
  /** Members the agent (or the floater cap) took off the policy. */
  removedMembers: RenewalMemberEntry[];
  memberData: Record<string, RenewalMemberData>;
  updateMemberData: (
    id: string,
    field: keyof RenewalMemberData,
    value: RenewalMemberData[keyof RenewalMemberData],
  ) => void;
  onRemoveMember: (id: string) => void;
  onAddBackMember: (id: string) => void;
  onAddNewMember: () => void;
  onSaveNewMember: (id: string) => void;
  onCancelNewMember: (id: string) => void;
  /** At the plan's member cap, "Add New" and "Add back" are both disabled. */
  isMemberCapReached: boolean;
  /** Floater plans drive every member's sum insured off the proposer's. */
  disableSumInsured: boolean;
  /** The dedicated member-details flow badges the relationship instead of Adult/Child. */
  useRelationshipBadge: boolean;
  banner?: React.ReactNode;
  onDownloadPolicy: () => void;
}

/** Splits the stored `feet:inches` height into its two parts. */
const splitHeight = (height: string): [string, string] => {
  const [feet = '', inches = ''] = (height || '').split(':');
  return [feet, inches];
};

/** True when a draft member has every field needed to be saved onto the policy. */
export const canSaveNewMember = (data?: RenewalMemberData): boolean => {
  if (!data) {
    return false;
  }
  const [feet, inches] = splitHeight(data.height);
  return Boolean(
    data.name.trim() &&
      data.relationship &&
      data.dob &&
      feet &&
      inches &&
      data.weight.trim() &&
      data.sumInsured.trim() &&
      data.hasPed,
  );
};

/**
 * The editable fields for one member. The identity row (name / relationship /
 * DOB) only shows while a newly added member is still a draft — for existing
 * members those values live in the accordion header instead.
 */
const MemberFields: React.FC<{
  id: string;
  data?: RenewalMemberData;
  showIdentity: boolean;
  disableSumInsured: boolean;
  update: RenewalMemberStepProps['updateMemberData'];
  onOpenPed: (id: string) => void;
}> = ({ id, data, showIdentity, disableSumInsured, update, onOpenPed }) => {
  const [feet, inches] = splitHeight(data?.height ?? '');
  const hasPed = data?.hasPed === 'yes';
  const tags = pedTags(data?.peds);

  const setHeight = (nextFeet: string, nextInches: string) => update(id, 'height', `${nextFeet}:${nextInches}`);

  return (
    <View style={styles.fields}>
      {showIdentity ? (
        <>
          <RequiredField label="Name">
            <Textfield
              value={data?.name ?? ''}
              onChangeText={(t) => update(id, 'name', t)}
              placeholder="Enter full name"
            />
          </RequiredField>
          <RequiredField label="Relationship with proposer">
            <Dropdown
              placeholder="Select relationship"
              value={data?.relationship || null}
              options={MEMBER_RELATIONSHIP_OPTIONS}
              onChange={(v) => update(id, 'relationship', v)}
            />
          </RequiredField>
          <RequiredField label="Date of Birth">
            <DatePicker placeholder="dd/mm/yyyy" value={data?.dob ?? null} onChange={(d) => update(id, 'dob', d)} />
          </RequiredField>
        </>
      ) : null}

      <View style={styles.row}>
        <View style={styles.col}>
          <RequiredField label="Height (ft)">
            <Textfield
              value={feet}
              onChangeText={(t) => setHeight(numericOnly(t).slice(0, 1), inches)}
              placeholder="5"
              keyboardType="number-pad"
            />
          </RequiredField>
        </View>
        <View style={styles.col}>
          <RequiredField label="Height (in)">
            <Textfield
              value={inches}
              onChangeText={(t) => setHeight(feet, numericOnly(t).slice(0, 2))}
              placeholder="10"
              keyboardType="number-pad"
            />
          </RequiredField>
        </View>
      </View>

      <RequiredField label="Weight (kg)">
        <Textfield
          value={data?.weight ?? ''}
          onChangeText={(t) => update(id, 'weight', numericOnly(t).slice(0, 3))}
          placeholder="68"
          keyboardType="number-pad"
        />
      </RequiredField>

      <RequiredField label="Sum Insured">
        <Textfield
          value={formatIndianCurrency(data?.sumInsured ?? '')}
          onChangeText={(t) => update(id, 'sumInsured', numericOnly(t))}
          placeholder="Rs. 15,00,000"
          keyboardType="number-pad"
          readOnly={disableSumInsured}
        />
      </RequiredField>
      {disableSumInsured ? (
        <Text style={styles.hint}>Floater plans share the proposer's sum insured across all members.</Text>
      ) : null}

      <Card style={styles.pedCard}>
        {/* RN has no radial gradient — approximate the web's `at 50% 0%` with a
            top→bottom white→tint LinearGradient, as the proposal step does. */}
        <LinearGradient colors={['#FFFFFF', '#EFF6FF']} style={StyleSheet.absoluteFill} />
        <View style={styles.pedInner}>
          <View style={styles.pedTopRow}>
            <View style={styles.pedTextCol}>
              <Text style={styles.pedTitle}>Pre-existing Diseases</Text>
              <Text style={styles.pedSub}>Does this member have any PEDs?</Text>
            </View>
            <View style={styles.pedYesNo}>
              <Button
                label="No"
                size="sm"
                variant={data?.hasPed === 'no' ? 'primary' : 'secondaryGray'}
                onPress={() => update(id, 'hasPed', 'no')}
              />
              <Button
                label="Yes"
                size="sm"
                variant={hasPed ? 'primary' : 'secondaryGray'}
                onPress={() => {
                  update(id, 'hasPed', 'yes');
                  onOpenPed(id);
                }}
              />
            </View>
          </View>

          {hasPed ? (
            <>
              <Button
                label="Edit PED Details"
                variant="link"
                size="sm"
                leadingIcon={<PencilSimple size={16} color={colors.brand} />}
                onPress={() => onOpenPed(id)}
              />
              {tags.length > 0 ? (
                <View style={styles.pedTags}>
                  {tags.map((tag) => (
                    <Tag
                      key={tag.label}
                      size="sm"
                      selected
                      label={tag.label}
                      onRemove={() => data?.peds && update(id, 'peds', removePedTag(data.peds, tag))}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </Card>
    </View>
  );
};

/**
 * Member details for a renewal. Unlike the proposal flow, members can be taken
 * off the policy (moving into a "Removed members" card, restorable via "Add
 * back") and new ones added inline below the proposer as a draft that must be
 * saved before the flow can continue.
 */
export const RenewalMemberStep: React.FC<RenewalMemberStepProps> = ({
  record,
  members,
  removedMembers,
  memberData,
  updateMemberData,
  onRemoveMember,
  onAddBackMember,
  onAddNewMember,
  onSaveNewMember,
  onCancelNewMember,
  isMemberCapReached,
  disableSumInsured,
  useRelationshipBadge,
  banner,
  onDownloadPolicy,
}) => {
  const [pedModalFor, setPedModalFor] = useState<string | null>(null);
  const pedMember = members.concat(removedMembers).find((m) => m.id === pedModalFor);

  return (
    <View style={styles.wrap}>
      <CurrentPolicyCard record={record} editable onDownload={onDownloadPolicy} />

      {banner}

      <View style={styles.card}>
        <Text style={styles.heading}>Member Details</Text>

        {members.map((member, index) => {
          const isDraft = member.status === 'new' && !member.saved;
          const isProposer = member.type === 'Proposer';
          const data = memberData[member.id];
          const badgeLabel =
            useRelationshipBadge && !isProposer
              ? RELATIONSHIP_LABELS[data?.relationship ?? ''] ?? data?.relationship ?? member.type
              : member.type;

          return (
            <Accordion
              // Flipping the key on save remounts the accordion so it collapses.
              key={`${member.id}-${member.saved ? 'saved' : 'draft'}`}
              label={member.label}
              defaultOpen={isDraft || (member.status !== 'new' && index === 0)}
              headerAction={
                isDraft ? (
                  <View style={styles.draftActions}>
                    <Button
                      label="Cancel"
                      variant="secondaryGray"
                      size="sm"
                      onPress={() => onCancelNewMember(member.id)}
                    />
                    <Button
                      label="Save"
                      size="sm"
                      disabled={!canSaveNewMember(data)}
                      onPress={() => onSaveNewMember(member.id)}
                    />
                  </View>
                ) : (
                  <View style={styles.memberHeader}>
                    <Badge
                      label={badgeLabel}
                      variant={isProposer ? 'solid' : 'light'}
                      size="sm"
                      color={isProposer ? 'blue' : 'neutral'}
                    />
                    {!isProposer ? (
                      <Pressable
                        onPress={() => onRemoveMember(member.id)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${member.label}`}
                      >
                        <Trash size={18} color={colors.dangerText} />
                      </Pressable>
                    ) : null}
                  </View>
                )
              }
              style={styles.memberCard}
            >
              <View style={styles.memberBody}>
                {!isDraft && member.dobLabel ? (
                  <Text style={styles.dobLine}>
                    DOB: <Text style={styles.dobValue}>{member.dobLabel}</Text>
                  </Text>
                ) : null}
                <MemberFields
                  id={member.id}
                  data={data}
                  showIdentity={isDraft}
                  disableSumInsured={disableSumInsured && !isProposer}
                  update={updateMemberData}
                  onOpenPed={setPedModalFor}
                />
              </View>
            </Accordion>
          );
        })}

        <Button
          label="Add New"
          variant="secondaryGray"
          leadingIcon={<Plus size={16} color={colors.textBody} />}
          disabled={isMemberCapReached}
          onPress={onAddNewMember}
          fullWidth
        />
      </View>

      {/* Always rendered — the list inside stays empty until a member is removed. */}
      <View style={styles.card}>
        <Text style={styles.heading}>Removed members</Text>
        {removedMembers.length > 0 ? (
          removedMembers.map((member) => (
            <Accordion
              key={member.id}
              label={member.label}
              style={styles.memberCard}
              headerAction={
                <View style={styles.memberHeader}>
                  <Badge label="Removed" variant="light" size="sm" color="red" />
                  <Button
                    label="Add back"
                    variant="link"
                    size="sm"
                    leadingIcon={<Plus size={16} color={colors.brand} />}
                    disabled={isMemberCapReached}
                    onPress={() => onAddBackMember(member.id)}
                  />
                </View>
              }
            >
              <View style={styles.memberBody}>
                {member.dobLabel ? (
                  <Text style={styles.dobLine}>
                    DOB: <Text style={styles.dobValue}>{member.dobLabel}</Text>
                  </Text>
                ) : null}
                <MemberFields
                  id={member.id}
                  data={memberData[member.id]}
                  showIdentity={false}
                  disableSumInsured={disableSumInsured}
                  update={updateMemberData}
                  onOpenPed={setPedModalFor}
                />
              </View>
            </Accordion>
          ))
        ) : (
          <Text style={styles.emptyRemoved}>No members have been removed from this policy.</Text>
        )}
      </View>

      <PEDDetailsModal
        isOpen={pedMember != null}
        memberName={pedMember?.label ?? 'this member'}
        initialData={pedModalFor ? memberData[pedModalFor]?.peds : undefined}
        onClose={() => setPedModalFor(null)}
        onConfirm={(peds) => {
          if (pedModalFor) {
            updateMemberData(pedModalFor, 'peds', peds);
          }
          setPedModalFor(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply it here.
  memberBody: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  memberHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  draftActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dobLine: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  dobValue: { color: colors.textHeading },
  fields: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  hint: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  emptyRemoved: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  // PED card: the gradient sits behind; override Card's border to the blue tint.
  pedCard: { borderColor: '#BFDBFE' },
  pedInner: { flex: 1, gap: spacing.sm },
  pedTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  pedTextCol: { flexShrink: 1 },
  pedTitle: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading },
  pedSub: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 18, color: colors.textBody },
  pedYesNo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pedTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
