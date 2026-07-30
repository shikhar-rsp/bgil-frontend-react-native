import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Info } from 'phosphor-react-native';
import { Badge, BottomSheet, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import type { RenewalMemberEntry } from './renewalData';

export type ConfirmTarget = 'proposer' | 'member' | 'nominee';

interface ConfirmChangesSheetProps {
  /** The step being left, or null when the sheet is closed. */
  target: ConfirmTarget | null;
  /** Members still on the policy that came with it (excludes new drafts). */
  activeOriginalMembers: RenewalMemberEntry[];
  newMembers: RenewalMemberEntry[];
  removedMembers: RenewalMemberEntry[];
  onCancel: () => void;
  onConfirm: () => void;
}

const MemberRow: React.FC<{ caption: string; label: string; badgeColor: 'blue' | 'emerald'; badgeLabel: string; solid?: boolean }> = ({
  caption,
  label,
  badgeColor,
  badgeLabel,
  solid,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowCaption}>{caption}</Text>
    <View style={styles.rowRight}>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      <Badge label={badgeLabel} variant={solid ? 'solid' : 'light'} size="sm" color={badgeColor} />
    </View>
  </View>
);

/**
 * "Confirm changes" step gate. Leaving the dedicated proposer / member /
 * nominee edit step asks the agent to confirm first; the member variant also
 * lists exactly what changed (added and removed members).
 */
export const ConfirmChangesSheet: React.FC<ConfirmChangesSheetProps> = ({
  target,
  activeOriginalMembers,
  newMembers,
  removedMembers,
  onCancel,
  onConfirm,
}) => {
  const isMember = target === 'member';

  return (
    <BottomSheet
      visible={target !== null}
      onClose={onCancel}
      icon={<Info size={20} color={colors.brand} />}
      featuredIconColor="blue"
      title={isMember ? 'Confirm changes in member details' : `Confirm changes in ${target ?? ''} details`}
      subtitle={
        isMember
          ? 'Please confirm the changes done in member details before proceeding.'
          : `Are you sure you would like to make these changes in ${target ?? ''} details?`
      }
      contentSlot={isMember}
      contentMinHeight={isMember ? 220 : 0}
      primaryAction={{ label: 'Confirm', onPress: onConfirm }}
      secondaryAction={{ label: 'Back', onPress: onCancel }}
    >
      {isMember ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.group}>
            <Text style={styles.groupTitle}>Updated member list</Text>
            <View style={styles.list}>
              {activeOriginalMembers.map((m, i) => (
                <MemberRow
                  key={m.id}
                  caption={`Member #${i + 1}`}
                  label={m.label}
                  badgeLabel={m.type}
                  badgeColor={m.type === 'Proposer' ? 'blue' : 'emerald'}
                  solid={m.type === 'Proposer'}
                />
              ))}
            </View>
          </View>

          {newMembers.length > 0 ? (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>New members</Text>
              <View style={[styles.list, styles.listNew]}>
                {newMembers.map((m) => (
                  <MemberRow key={m.id} caption="New member" label={m.label} badgeLabel={m.type} badgeColor="emerald" />
                ))}
              </View>
            </View>
          ) : null}

          {removedMembers.length > 0 ? (
            <View style={styles.group}>
              <Text style={styles.groupTitleDanger}>Removed members</Text>
              <View style={[styles.list, styles.listRemoved]}>
                {removedMembers.map((m, i) => (
                  <MemberRow
                    key={m.id}
                    caption={`Member #${activeOriginalMembers.length + i + 1}`}
                    label={m.label}
                    badgeLabel={m.type}
                    badgeColor="emerald"
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scroll: { alignSelf: 'stretch' },
  scrollContent: { gap: spacing.lg, paddingBottom: spacing.sm },
  group: { gap: spacing.sm },
  groupTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  groupTitleDanger: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.dangerText },
  list: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  listNew: { borderColor: '#65A30D' },
  listRemoved: { borderColor: '#FECACA' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  rowCaption: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  rowLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
});
