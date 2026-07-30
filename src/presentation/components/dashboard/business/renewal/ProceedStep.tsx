import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Icon } from 'phosphor-react-native';
import { Radio, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { CurrentPolicyCard } from './CurrentPolicyCard';
import type { Renewal } from '../businessData';
import {
  PROCEED_OPTIONS,
  RENEWAL_EDIT_OPTIONS,
  MIGRATION_EDIT_OPTIONS,
  PAYMENT_LINK_OPTIONS,
  type EditOption,
  type PaymentLinkMethod,
  type ProceedOption,
} from './renewalData';

interface ProceedStepProps {
  record?: Renewal;
  proceedOption: ProceedOption | null;
  onSelectProceed: (value: ProceedOption) => void;
  editOption: EditOption | null;
  onSelectEdit: (value: EditOption) => void;
  paymentLinkMethod: PaymentLinkMethod | '';
  onSelectPaymentLink: (value: PaymentLinkMethod) => void;
  onDownloadPolicy: () => void;
}

/** A tappable option row: icon tile, label (with optional description), radio. */
const OptionRow: React.FC<{
  IconGlyph: Icon;
  iconBg: string;
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}> = ({ IconGlyph, iconBg, label, description, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={label}
    style={[styles.option, selected && styles.optionSelected]}
  >
    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
      <IconGlyph size={20} color="#FFFFFF" weight="fill" />
    </View>
    <View style={styles.optionText}>
      <Text style={styles.optionLabel}>{label}</Text>
      {description ? <Text style={styles.optionDescription}>{description}</Text> : null}
    </View>
    <Radio selected={selected} onPress={onPress} />
  </Pressable>
);

/**
 * Step 1 of the renewal flow — the current policy, how the agent wants to
 * proceed, and then either the payment-link delivery choice (Quick Renewal) or
 * the edit-option list for the chosen path.
 */
export const ProceedStep: React.FC<ProceedStepProps> = ({
  record,
  proceedOption,
  onSelectProceed,
  editOption,
  onSelectEdit,
  paymentLinkMethod,
  onSelectPaymentLink,
  onDownloadPolicy,
}) => {
  const editOptions = proceedOption === 'migration' ? MIGRATION_EDIT_OPTIONS : RENEWAL_EDIT_OPTIONS;

  return (
    <View style={styles.wrap}>
      <CurrentPolicyCard record={record} editable onDownload={onDownloadPolicy} />

      <View style={styles.card}>
        <Text style={styles.heading}>How would you like to proceed?</Text>
        {PROCEED_OPTIONS.map((opt) => (
          <OptionRow
            key={opt.value}
            IconGlyph={opt.Icon}
            iconBg={opt.iconBg}
            label={opt.title}
            description={opt.description}
            selected={proceedOption === opt.value}
            onPress={() => onSelectProceed(opt.value)}
          />
        ))}
      </View>

      {proceedOption === 'quick' ? (
        <View style={styles.card}>
          <Text style={styles.subHeading}>How would you like to send the payment link?</Text>
          {PAYMENT_LINK_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              IconGlyph={opt.Icon}
              iconBg={opt.iconBg}
              label={opt.label}
              selected={paymentLinkMethod === opt.value}
              onPress={() => onSelectPaymentLink(opt.value)}
            />
          ))}
        </View>
      ) : proceedOption ? (
        <View style={styles.card}>
          <Text style={styles.subHeading}>What would you like to edit?</Text>
          {editOptions.map((opt) => (
            <OptionRow
              key={opt.value}
              IconGlyph={opt.Icon}
              iconBg={opt.iconBg}
              label={opt.label}
              selected={editOption === opt.value}
              onPress={() => onSelectEdit(opt.value)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 22, fontWeight: '500', color: colors.textHeading },
  subHeading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  iconBox: { width: 32, height: 32, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 24, fontWeight: '500', color: colors.textHeading },
  optionDescription: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textBody },
});
