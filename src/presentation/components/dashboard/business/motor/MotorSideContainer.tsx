import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info, Scooter } from 'phosphor-react-native';
import { colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard, motorColors, SummaryRow } from './motorUi';
import {
  formatQuoteValidity,
  formatRupees,
  GST_RATE,
  QUOTE_VALIDITY_DAYS,
  type PremiumBreakup,
} from './motorQuoteData';

const Row: React.FC<{
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: 'default' | 'positive' | 'negative';
}> = ({ label, value, emphasis, tone = 'default' }) => (
  <View style={styles.row}>
    <Text style={emphasis ? styles.rowLabelStrong : styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        tone === 'positive' && styles.positive,
        tone === 'negative' && styles.negative,
      ]}
    >
      {value}
    </Text>
  </View>
);

const SectionHeader: React.FC<{ title: string; note: string }> = ({ title, note }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionNote}>{note}</Text>
  </View>
);

interface MotorSideContainerProps {
  /** `null` until a vehicle has been found — the panel shows its empty state. */
  premium: PremiumBreakup | null;
  /** Tenure the premium is quoted for, e.g. "1 year". */
  tenureLabel?: string;
}

export const MotorSideContainer: React.FC<MotorSideContainerProps> = ({
  premium,
  tenureLabel = '1 year',
}) => {
  const quoteValidTill = formatQuoteValidity(
    new Date(Date.now() + QUOTE_VALIDITY_DAYS * 24 * 60 * 60 * 1000),
  );

  return (
    <MotorCard>
      <View style={styles.validity}>
        <Info size={20} color={motorColors.infoIcon} />
        <Text style={styles.validityText}>
          <Text style={styles.validityStrong}>{QUOTE_VALIDITY_DAYS} days validity.</Text>{' '}
          Quote valid till {quoteValidTill}.
        </Text>
      </View>

      <Text style={styles.heading}>Premium Breakup</Text>

      {!premium ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Scooter size={28} color={colors.textBody} />
          </View>
          <Text style={styles.emptyText}>
            Please enter vehicle registration no. to start.
          </Text>
        </View>
      ) : (
        <>
          <SummaryRow
            label="IDV"
            caption="Maximum claim on total loss"
            value={premium.idv === null ? 'NA' : `Rs. ${formatRupees(premium.idv)}`}
          />

          {premium.ownDamage ? (
            <View style={styles.section}>
              <SectionHeader
                title="Own Damage"
                note={`${tenureLabel} • priced by insurer`}
              />

              <Row
                label="Basic own damage premium"
                value={`Rs. ${formatRupees(premium.ownDamage.basic)}`}
              />

              <Row
                label={`Add-ons (${premium.ownDamage.addOnCount})`}
                value={`Rs. ${formatRupees(premium.ownDamage.addOns)}`}
              />

              {premium.ownDamage.ncbPercent > 0 ? (
                <Row
                  label={`Less: No Claim Bonus @ ${premium.ownDamage.ncbPercent}%`}
                  value={`−Rs. ${formatRupees(premium.ownDamage.ncbAmount)}`}
                  tone="positive"
                />
              ) : null}

              <Row
                label="Net own damage premium"
                value={`Rs. ${formatRupees(premium.ownDamage.net)}`}
                emphasis
              />
            </View>
          ) : null}

          {premium.thirdParty ? (
            <View style={styles.section}>
              <SectionHeader title="Third Party" note="IRDAI notified • fixed" />

              <Row
                label="Basic third-party liability"
                value={`Rs. ${formatRupees(premium.thirdParty.basic)}`}
              />

              <Row
                label="PA cover, owner-driver ₹15 lakh"
                value={`Rs. ${formatRupees(premium.thirdParty.paCover)}`}
              />

              <Row
                label="Net third-party premium"
                value={`Rs. ${formatRupees(premium.thirdParty.net)}`}
                emphasis
              />
            </View>
          ) : null}

          <View style={styles.section}>
            {premium.adjustment !== 0 ? (
              <Row
                label={premium.adjustment < 0 ? 'Discount' : 'Loader'}
                value={`${premium.adjustment < 0 ? '−' : '+'}Rs. ${formatRupees(
                  Math.abs(premium.adjustment),
                )}`}
                tone={premium.adjustment < 0 ? 'positive' : 'negative'}
              />
            ) : null}

            <Row
              label="Net premium"
              value={`Rs. ${formatRupees(premium.netPremium)}`}
              emphasis
            />

            <Row
              label={`GST @ ${Math.round(GST_RATE * 100)}%`}
              value={`Rs. ${formatRupees(premium.gst)}`}
            />
          </View>

          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Total Premium</Text>
            <Text style={styles.totalValue}>Rs. {formatRupees(premium.total)}</Text>
          </View>
        </>
      )}
    </MotorCard>
  );
};

const styles = StyleSheet.create({
  validity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: motorColors.infoFill,
  },
  validityText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  validityStrong: { fontFamily: fontFamilyForWeight('500'), fontWeight: '500' },

  heading: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
  },

  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.xxl },
  emptyIcon: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surfaceSubtle },
  emptyText: { fontFamily: typography.fontFamily, fontSize: 14, color: '#64748B', textAlign: 'center' },

  section: { gap: spacing.md, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 24, fontWeight: '500', color: colors.textHeading },
  sectionNote: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: '#64748B', textAlign: 'right' },

  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  rowLabelStrong: { flex: 1, fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textHeading },
  rowValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textHeading, textAlign: 'right' },
  positive: { color: motorColors.discount },
  negative: { color: motorColors.loader },

  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: motorColors.total,
  },
  totalLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textOnBrand },
  totalValue: { fontFamily: fontFamilyForWeight('600'), fontSize: 24, lineHeight: 32, fontWeight: '600', color: colors.textOnBrand },
});
