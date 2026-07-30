import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Accordion,
  Badge,
  Button,
  Checkbox,
  Radio,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { SkipAddOnsModal } from '../health/SkipAddOnsModal';
import { CurrentPolicyCard } from './CurrentPolicyCard';
import { SubPlanCard } from './SubPlanCard';
import { EligibleAddOnPoliciesCard } from './EligibleAddOnPoliciesCard';
import type { Renewal } from '../businessData';
import { ADDON_ITEMS, type RenewalMemberEntry, type RenewalPlanType, type SubPlanValue } from './renewalData';

interface RenewalAddOnsStepProps {
  record?: Renewal;
  planType: RenewalPlanType;
  /** Members currently on the policy (removed ones are excluded upstream). */
  activeMembers: RenewalMemberEntry[];
  /** Per-member add-on ids (individual plans). */
  memberAddOns: Record<string, string[]>;
  onToggleMemberAddOn: (memberId: string, addonId: string) => void;
  /** Per-member "would you like add-ons?" answer (individual plans). */
  memberChoice: Record<string, 'yes' | 'no' | ''>;
  onMemberChoice: (memberId: string, value: 'yes' | 'no') => void;
  /** Floater plans share one add-on selection across all members. */
  floaterAddOns: string[];
  onToggleFloaterAddOn: (addonId: string) => void;
  keepSameForAll: boolean;
  onToggleKeepSameForAll: () => void;
  /** Mandatory add-ons carried over from the previous policy can't be removed. */
  isAddonLocked: (addonId: string) => boolean;
  /** Contextual banner supplied by the flow (member list updated, etc.). */
  banner?: React.ReactNode;
  /** "Add-ons & Subplan" also picks a sub plan here. */
  showSubPlan?: boolean;
  subPlan: SubPlanValue | null;
  onSelectSubPlan: (value: SubPlanValue) => void;
  /** Renewal flows cross-sell eligible policies below the add-ons. */
  showEligible?: boolean;
  selectedEligible: string[];
  onToggleEligible: (id: string) => void;
  onSkipAndProceed: () => void;
  onDownloadPolicy: () => void;
}

const CHOICES: { value: 'yes' | 'no'; label: string }[] = [
  { value: 'yes', label: 'Yes, show options' },
  { value: 'no', label: 'No, skip for now' },
];

/** One add-on row — a checkbox, its title and its price. Locked rows read as
 *  ticked but can't be toggled. */
const AddOnRow: React.FC<{
  title: string;
  price: string;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}> = ({ title, price, selected, locked, onPress }) => (
  <Pressable
    onPress={locked ? undefined : onPress}
    disabled={locked}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: locked || selected, disabled: locked }}
    accessibilityLabel={title}
    style={[styles.addon, locked ? styles.addonLocked : selected && styles.addonSelected]}
  >
    <View style={styles.addonLeft}>
      <Checkbox
        size="sm"
        checked={locked || selected}
        disabled={locked}
        onChange={locked ? undefined : onPress}
      />
      <Text style={[styles.addonTitle, locked && styles.addonTitleLocked]}>{title}</Text>
    </View>
    <Text style={[styles.addonPrice, locked && styles.addonPriceLocked]}>{price}</Text>
  </Pressable>
);

/**
 * Select Add-ons. Floater plans get one shared list; individual plans get a
 * per-member accordion with its own yes/no gate, matching the web step.
 */
export const RenewalAddOnsStep: React.FC<RenewalAddOnsStepProps> = ({
  record,
  planType,
  activeMembers,
  memberAddOns,
  onToggleMemberAddOn,
  memberChoice,
  onMemberChoice,
  floaterAddOns,
  onToggleFloaterAddOn,
  keepSameForAll,
  onToggleKeepSameForAll,
  isAddonLocked,
  banner,
  showSubPlan,
  subPlan,
  onSelectSubPlan,
  showEligible,
  selectedEligible,
  onToggleEligible,
  onSkipAndProceed,
  onDownloadPolicy,
}) => {
  const [showSkip, setShowSkip] = useState(false);
  const isFloater = planType === 'floater';

  return (
    <View style={styles.wrap}>
      <CurrentPolicyCard record={record} editable onDownload={onDownloadPolicy} />

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.heading}>Select Add-ons</Text>
            {isFloater ? (
              <Text style={styles.sub}>The selected add-ons will be the same for all members of the policy.</Text>
            ) : null}
          </View>
          <Button label="Skip Add-ons" variant="secondary" size="sm" onPress={() => setShowSkip(true)} />
        </View>

        {!isFloater ? (
          <Checkbox checked={keepSameForAll} onChange={onToggleKeepSameForAll} label="Keep Add-ons same for all" />
        ) : null}

        {banner}

        {isFloater ? (
          <View style={styles.addonList}>
            {ADDON_ITEMS.map((addon) => (
              <AddOnRow
                key={addon.id}
                title={addon.title}
                price={addon.price}
                selected={floaterAddOns.includes(addon.id)}
                locked={isAddonLocked(addon.id)}
                onPress={() => onToggleFloaterAddOn(addon.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.memberList}>
            {activeMembers.map((member, index) => {
              const addOns = memberAddOns[member.id] ?? [];
              const wants = memberChoice[member.id] ?? '';
              const isProposer = member.type === 'Proposer';
              return (
                <Accordion
                  key={member.id}
                  label={member.label}
                  defaultOpen={index === 0}
                  headerAction={
                    <View style={styles.memberBadges}>
                      <Badge label={`${addOns.length} Add-ons`} variant="light" size="sm" color="blue" />
                      <Badge
                        label={member.type}
                        variant={isProposer ? 'solid' : 'light'}
                        size="sm"
                        color={isProposer ? 'blue' : 'neutral'}
                      />
                    </View>
                  }
                  style={styles.memberCard}
                >
                  <View style={styles.memberBody}>
                    <Text style={styles.choiceLabel}>
                      Would you like to select Add-ons?<Text style={styles.asterisk}>*</Text>
                    </Text>
                    <View style={styles.choiceRow}>
                      {CHOICES.map((opt) => {
                        const selected = wants === opt.value;
                        return (
                          <Pressable
                            key={opt.value}
                            onPress={() => onMemberChoice(member.id, opt.value)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            accessibilityLabel={opt.label}
                            style={[styles.choice, selected && styles.choiceSelected]}
                          >
                            <Radio selected={selected} onPress={() => onMemberChoice(member.id, opt.value)} />
                            <Text style={styles.choiceText}>{opt.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {wants === 'yes' ? (
                      <View style={styles.addonList}>
                        <Text style={styles.choiceLabel}>
                          Select from the following<Text style={styles.asterisk}>*</Text>
                        </Text>
                        {ADDON_ITEMS.map((addon) => (
                          <AddOnRow
                            key={addon.id}
                            title={addon.title}
                            price={addon.price}
                            selected={addOns.includes(addon.id)}
                            locked={isAddonLocked(addon.id)}
                            onPress={() => onToggleMemberAddOn(member.id, addon.id)}
                          />
                        ))}
                      </View>
                    ) : null}
                  </View>
                </Accordion>
              );
            })}
          </View>
        )}
      </View>

      {showSubPlan ? <SubPlanCard subPlan={subPlan} onSelect={onSelectSubPlan} /> : null}

      {showEligible ? (
        <EligibleAddOnPoliciesCard selectedEligible={selectedEligible} onToggle={onToggleEligible} />
      ) : null}

      <SkipAddOnsModal
        isOpen={showSkip}
        onClose={() => setShowSkip(false)}
        onSkipAndProceed={onSkipAndProceed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1, gap: spacing.xs },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  sub: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textBody },
  addonList: { gap: spacing.sm },
  memberList: { gap: spacing.md },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply it here.
  memberBody: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  memberBadges: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  choiceLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  asterisk: { color: colors.dangerText },
  choiceRow: { flexDirection: 'row', gap: spacing.sm },
  choice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  choiceSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  choiceText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
  addon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  addonSelected: { borderColor: colors.brand, backgroundColor: '#EFF6FF' },
  addonLocked: { borderColor: colors.surfaceMuted, backgroundColor: colors.surfaceMuted },
  addonLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  addonTitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading, flexShrink: 1 },
  addonTitleLocked: { color: colors.textBody },
  addonPrice: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  addonPriceLocked: { color: colors.textDisabled },
});
