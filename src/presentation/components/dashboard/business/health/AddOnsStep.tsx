import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { Accordion, Button, Card, Checkbox, Radio, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
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
        <Card key={item} selected={isSel} style={styles.gridItem}>
          <Checkbox size="sm" checked={isSel} onChange={() => onToggle(item)} label={item} />
        </Card>
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
        <Text style={styles.heading}>Select Add-ons?</Text>
        <Button label="Skip Add-ons" variant="secondaryGray" size="sm" onPress={() => setShowSkip(true)} />
      </View>

      {planType === 'individual' ? (
        <Checkbox
          size="sm"
          checked={keepAddOnsSame}
          onChange={toggleKeepAddOnsSame}
          label="Keep Add-ons same for all"
        />
      ) : null}

      {planType === 'individual' ? (
        <View style={styles.members}>
          {members.map((member, index) => {
            const md = memberData[member.id];
            const wants = md?.wantsAddOns ?? (index === 0 ? 'yes' : '');
            const filled = wants === 'yes' && (md?.selectedAddOns?.length ?? 0) > 0;
            return (
              <Accordion
                key={member.id}
                label={member.label}
                defaultOpen={index === 0}
                badgeText={filled ? 'Add-ons selected' : undefined}
                badgeColor="lime"
                badgeVariant="light"
                style={styles.memberCard}
              >
                <View style={styles.memberBody}>
                  <Text style={styles.q}>Would you like to select Add ons? <Text style={styles.asterisk}>*</Text></Text>
                  <View style={styles.wantsRow}>
                    {[
                      { value: 'yes', label: 'Yes, show options' },
                      { value: 'no', label: 'No, skip for now' },
                    ].map((opt) => (
                      <Card
                        key={opt.value}
                        selected={wants === opt.value}
                        onPress={() => {
                          updateMember(member.id, 'wantsAddOns', opt.value);
                          if (opt.value === 'no') {
                            updateMember(member.id, 'selectedAddOns', []);
                          }
                        }}
                        style={styles.wantsCard}
                      >
                        <View style={styles.wantsInner}>
                          <Radio selected={wants === opt.value} onPress={() => updateMember(member.id, 'wantsAddOns', opt.value)} />
                          <Text style={styles.wantsLabel}>{opt.label}</Text>
                        </View>
                      </Card>
                    ))}
                  </View>
                  {wants === 'yes' ? (
                    <>
                      <Text style={styles.q}>Select from the following <Text style={styles.asterisk}>*</Text></Text>
                      <AddOnGrid selected={md?.selectedAddOns ?? []} onToggle={(a) => toggleMemberAddOn(member.id, a)} />
                    </>
                  ) : null}
                </View>
              </Accordion>
            );
          })}
        </View>
      ) : (
        <View style={styles.floater}>
          <View style={styles.floaterHead}>
            <Text style={styles.q}>The selected Add-ons will be the same for all members of the policy.</Text>
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
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  members: { gap: spacing.md },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply it here.
  memberBody: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  q: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  asterisk: { color: colors.dangerText },
  wantsRow: { flexDirection: 'row', gap: spacing.md },
  wantsCard: { flex: 1 },
  wantsInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  wantsLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
  floater: { gap: spacing.md },
  floaterHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, columnGap: spacing.sm },
  // Card supplies border / radius / padding / selected styling; just size it.
  gridItem: { width: '47%', flexGrow: 1 },
});
