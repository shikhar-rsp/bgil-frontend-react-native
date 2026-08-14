import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle, XCircle, ShieldCheck, CrownSimple, Shield, type IconProps } from 'phosphor-react-native';
import { Radio, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard, motorColors } from './motorUi';
import {
  ADD_ONS,
  formatRupees,
  priceReadyMadeQuote,
  READY_MADE_EXCLUSION_ORDER,
  READY_MADE_QUOTES,
  type PlanId,
  type ReadyMadeQuote,
  type VehicleRecord,
} from './motorQuoteData';

interface QuoteTheme {
  Icon: React.ComponentType<IconProps>;
  iconColor: string;
  iconBg: string;
  price: string;
  /** Foot of the white → tint ramp, painted only once the card is selected. */
  tint: string;
  /**
   * Borders stay inside the package's own colour family and just deepen on
   * selection, rather than every card jumping to brand blue when picked.
   */
  border: string;
  selectedBorder: string;
  splitBg: string;
}

/**
 * Every card sits on plain white until it is picked; selection paints a
 * white → tint ramp in the package's own colour. Same treatment the
 * "Suggest these to your customers" cards use, so the two read as one system.
 */
const THEMES: Record<ReadyMadeQuote['theme'], QuoteTheme> = {
  eco: {
    Icon: ShieldCheck,
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    price: '#4338CA',
    tint: '#EEF2FF',
    border: '#BFDBFE',
    selectedBorder: '#60A5FA',
    splitBg: '#EEF2FF',
  },
  premium: {
    Icon: CrownSimple,
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    price: '#D97706',
    tint: '#FFF7ED',
    border: '#FED7AA',
    selectedBorder: '#FB923C',
    splitBg: '#FEF3E7',
  },
  super: {
    Icon: Shield,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    price: '#047857',
    tint: '#ECFDF5',
    border: '#A7F3D0',
    selectedBorder: '#34D399',
    splitBg: '#ECFDF5',
  },
};

const addOnLabel = (id: string): string =>
  ADD_ONS.find((addOn) => addOn.id === id)?.label ?? id;

const Figure: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.figure}>
    <Text style={styles.figureLabel}>{label}</Text>
    <Text style={styles.figureValue}>{value}</Text>
  </View>
);

interface SuggestedPlansProps {
  selectedPlan: string;
  setSelectedPlan: (val: string) => void;
  vehicle: VehicleRecord;
  planId: PlanId;
  ncbPercent: number;
}

export const SuggestedPlans: React.FC<SuggestedPlansProps> = ({
  selectedPlan,
  setSelectedPlan,
  vehicle,
  planId,
  ncbPercent,
}) => (
  <MotorCard title="Ready-made quotes">
    {READY_MADE_QUOTES.map((quote) => {
      const isSelected = selectedPlan === quote.id;
      const theme = THEMES[quote.theme];
      const premium = priceReadyMadeQuote(quote, vehicle, planId, ncbPercent);

      const excluded = READY_MADE_EXCLUSION_ORDER.filter(
        (id) => !quote.addOnIds.includes(id),
      );

      return (
        <Pressable
          key={quote.id}
          onPress={() => setSelectedPlan(quote.id)}
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected }}
          style={({ pressed }) => [
            styles.card,
            { borderColor: isSelected ? theme.selectedBorder : theme.border },
            pressed && styles.pressed,
          ]}
        >
          {/* Unselected cards stay flat white; the ramp is the selection cue. */}
          {isSelected ? (
            <LinearGradient
              colors={['#FFFFFF', theme.tint]}
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          <View style={styles.head}>
            <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
              <theme.Icon size={20} color={theme.iconColor} />
            </View>

            <Radio selected={isSelected} size="md" />
          </View>

          <View>
            <Text style={styles.name}>{quote.name}</Text>
            <Text style={[styles.price, { color: theme.price }]}>
              Rs. {formatRupees(premium.total)}
            </Text>
            <Text style={styles.priceNote}>for 1 year, incl. 18% GST</Text>
          </View>

          <View style={[styles.split, { backgroundColor: theme.splitBg }]}>
            <Figure
              label="Own Damage"
              value={premium.ownDamage ? `Rs. ${formatRupees(premium.ownDamage.net)}` : 'NA'}
            />
            <Figure
              label="Third Party"
              value={premium.thirdParty ? `Rs. ${formatRupees(premium.thirdParty.net)}` : 'NA'}
            />
          </View>

          <View style={styles.keyFigures}>
            <View style={styles.keyRow}>
              <Text style={styles.keyLabel}>IDV / total-loss payout</Text>
              <Text style={styles.keyValue}>
                {premium.idv === null ? 'NA' : `₹${formatRupees(premium.idv)}`}
              </Text>
            </View>

            <View style={styles.keyRow}>
              <Text style={styles.keyLabel}>NCB applied</Text>
              <Text style={styles.keyValue}>{ncbPercent}%</Text>
            </View>

            <View style={styles.keyRow}>
              <Text style={styles.keyLabel}>Customer pays per claim</Text>
              <Text style={styles.keyValue}>
                {quote.excess > 0 ? `Rs. ${formatRupees(quote.excess)}` : 'Nothing'}
              </Text>
            </View>
          </View>

          <View style={styles.covered}>
            <Text style={styles.coveredTitle}>What's covered</Text>

            {quote.addOnIds.map((id) => (
              <View key={id} style={styles.coverRow}>
                <CheckCircle size={16} color={motorColors.tick} />
                <Text style={styles.coverIncluded}>{addOnLabel(id)}</Text>
              </View>
            ))}

            {excluded.map((id) => (
              <View key={id} style={styles.coverRow}>
                <XCircle size={16} color={motorColors.alert} />
                <Text style={styles.coverExcluded}>{addOnLabel(id)}</Text>
              </View>
            ))}
          </View>
        </Pressable>
      );
    })}
  </MotorCard>
);

const styles = StyleSheet.create({
  // overflow:hidden keeps the selected ramp inside the rounded border.
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9 },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  iconBox: { width: 32, height: 32, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },

  name: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textHeading },
  price: { fontFamily: fontFamilyForWeight('600'), fontSize: 28, lineHeight: 36, fontWeight: '600' },
  priceNote: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: '#64748B' },

  split: { flexDirection: 'row', gap: spacing.sm, borderRadius: radius.lg, padding: spacing.md },
  figure: { flex: 1, gap: 2 },
  figureLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: '#64748B' },
  figureValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textHeading },

  keyFigures: { gap: spacing.sm, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  keyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  keyLabel: { flex: 1, fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: '#64748B' },
  keyValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 12, lineHeight: 16, fontWeight: '500', color: colors.textHeading },

  covered: { gap: spacing.sm },
  coveredTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textBody },
  coverRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coverIncluded: { flex: 1, fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  coverExcluded: { flex: 1, fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
});
