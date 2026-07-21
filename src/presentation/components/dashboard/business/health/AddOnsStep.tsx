import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check, CheckCircle } from 'phosphor-react-native';
import { Badge, Button, Radio, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { SkipAddOnsModal } from './SkipAddOnsModal';
import { ADD_ON_ITEMS, type Member, type MemberDatum } from './healthData';

interface AddOnsStepProps {
  planType: string;
  members: Member[];
  memberData: Record<string, MemberDatum>;
  updateMember: (id: string, field: keyof MemberDatum, value: MemberDatum[keyof MemberDatum]) => void;
  keepAddOnsSame: boolean;
  toggleKeepAddOnsSame: () => void;
  onSkipAndProceed: () => void;
  floaterAddOns: string[];
  setFloaterAddOns: (v: string[]) => void;
}

const AddOnGrid: React.FC<{ selected: string[]; onToggle: (id: string) => void }> = ({ selected, onToggle }) => (
  <View style={styles.grid}>
    {ADD_ON_ITEMS.map((item) => {
      const isSel = selected.includes(item);
      return (
        <Pressable
          key={item}
          style={[styles.addon, isSel && styles.addonSel]}
          onPress={() => onToggle(item)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSel }}
        >
          <View style={[styles.checkbox, isSel && styles.checkboxSel]}>
            {isSel ? <Check size={12} color="#FFFFFF" weight="bold" /> : null}
          </View>
          <Text style={styles.addonLabel}>{item}</Text>
        </Pressable>
      );
    })}
  </View>
);

export const AddOnsStep: React.FC<AddOnsStepProps> = ({
  planType,
  members,
  memberData,
  updateMember,
  keepAddOnsSame,
  toggleKeepAddOnsSame,
  onSkipAndProceed,
  floaterAddOns,
  setFloaterAddOns,
}) => {
  const [showSkip, setShowSkip] = useState(false);

  const toggleMemberAddOn = (id: string, addOn: string) => {
    const current = memberData[id]?.selectedAddOns ?? [];
    updateMember(id, 'selectedAddOns', current.includes(addOn) ? current.filter((a) => a !== addOn) : [...current, addOn]);
  };
  const toggleFloater = (addOn: string) =>
    setFloaterAddOns(floaterAddOns.includes(addOn) ? floaterAddOns.filter((a) => a !== addOn) : [...floaterAddOns, addOn]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Select Add-ons</Text>
        <Button label="Skip Add-ons" variant="secondaryGray" size="sm" onPress={() => setShowSkip(true)} />
      </View>

      {planType === 'individual' ? (
        <Pressable style={styles.keepRow} onPress={toggleKeepAddOnsSame} accessibilityRole="checkbox" accessibilityState={{ checked: keepAddOnsSame }}>
          <View style={[styles.checkbox, keepAddOnsSame && styles.checkboxSel]}>
            {keepAddOnsSame ? <Check size={12} color="#FFFFFF" weight="bold" /> : null}
          </View>
          <Text style={styles.keepLabel}>Keep Add-ons same for all</Text>
        </Pressable>
      ) : null}

      {planType === 'individual' ? (
        <View style={styles.members}>
          {members.map((member, index) => {
            const md = memberData[member.id];
            const wants = md?.wantsAddOns ?? (index === 0 ? 'yes' : '');
            const filled = wants === 'yes' && (md?.selectedAddOns?.length ?? 0) > 0;
            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberHead}>
                  <Text style={styles.memberLabel}>{member.label}</Text>
                  {filled ? (
                    <Badge variant="light" size="sm" color="lime" label="Add-ons selected" />
                  ) : null}
                </View>
                <Text style={styles.q}>Would you like to select Add ons? *</Text>
                <View style={styles.wantsRow}>
                  {[
                    { value: 'yes', label: 'Yes, show options' },
                    { value: 'no', label: 'No, skip for now' },
                  ].map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.wants, wants === opt.value && styles.wantsSel]}
                      onPress={() => {
                        updateMember(member.id, 'wantsAddOns', opt.value);
                        if (opt.value === 'no') {
                          updateMember(member.id, 'selectedAddOns', []);
                        }
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: wants === opt.value }}
                    >
                      <Radio selected={wants === opt.value} onPress={() => updateMember(member.id, 'wantsAddOns', opt.value)} />
                      <Text style={styles.wantsLabel}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
                {wants === 'yes' ? (
                  <>
                    <Text style={styles.q}>Select from the following *</Text>
                    <AddOnGrid selected={md?.selectedAddOns ?? []} onToggle={(a) => toggleMemberAddOn(member.id, a)} />
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.floater}>
          <View style={styles.floaterHead}>
            <CheckCircle size={16} color={colors.brand} />
            <Text style={styles.q}>Select add-ons for the family floater *</Text>
          </View>
          <AddOnGrid selected={floaterAddOns} onToggle={toggleFloater} />
        </View>
      )}

      <SkipAddOnsModal isOpen={showSkip} onClose={() => setShowSkip(false)} onSkipAndProceed={onSkipAndProceed} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  keepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  keepLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  members: { gap: spacing.md },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.md, gap: spacing.md },
  memberHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberLabel: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  q: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  wantsRow: { flexDirection: 'row', gap: spacing.md },
  wants: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  wantsSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  wantsLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
  floater: { gap: spacing.md },
  floaterHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  addon: { width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  addonSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  addonLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
  checkbox: { width: 18, height: 18, borderRadius: radius.xs, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxSel: { backgroundColor: colors.brand, borderColor: colors.brand },
});
