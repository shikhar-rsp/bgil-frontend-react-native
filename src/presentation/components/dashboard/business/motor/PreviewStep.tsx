import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle } from 'phosphor-react-native';
import { colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard, motorColors } from './motorUi';
import { VehicleDetailCard } from './VehicleIdentificationStep';
import {
  ADD_ONS,
  formatRupees,
  getPlan,
  QUOTE_VALIDITY_DAYS,
  type PlanId,
  type PremiumBreakup,
  type VehicleRecord,
} from './motorQuoteData';

interface PreviewStepProps {
  proposerName: string;
  proposerPhone: string;
  proposerEmail: string;

  vehicle: VehicleRecord | undefined;
  planId: PlanId;
  premium: PremiumBreakup;

  packageName: string;
  policyStartDate: Date | null;
  policyEndDate: Date | null;
  policyTenure: string;

  selectedAddOnIds: string[];
  /** "4 Wheeler" / "2 Wheeler" — follows the chosen product. */
  wheelerLabel: string;
}

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

/** Two fields per row — four columns don't survive a phone width. */
const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.grid}>{children}</View>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const formatDate = (date: Date | null) =>
  date
    ? `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}/${date.getFullYear()}`
    : 'NA';

export const PreviewStep: React.FC<PreviewStepProps> = ({
  proposerName,
  proposerPhone,
  proposerEmail,
  vehicle,
  planId,
  premium,
  packageName,
  policyStartDate,
  policyEndDate,
  policyTenure,
  selectedAddOnIds,
  wheelerLabel,
}) => {
  const plan = getPlan(planId);

  const selectedAddOns = ADD_ONS.filter((addOn) =>
    selectedAddOnIds.includes(addOn.id),
  );

  const issuedOn = new Date();

  const validUntil = new Date(issuedOn);
  validUntil.setDate(validUntil.getDate() + QUOTE_VALIDITY_DAYS);

  return (
    <MotorCard>
      <View style={styles.sheet}>
        <View style={styles.titleBar}>
          <LinearGradient
            colors={['#FFFFFF', motorColors.gradientBlue]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.title}>
            {wheelerLabel} Insurance - {proposerName || 'Rakesh Kumar'}
          </Text>
        </View>

        <View style={styles.sheetBody}>
          {/* Premium Details — green header. */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, styles.premiumHeader]}>
              <Text style={styles.premiumTitle}>Premium Details</Text>
            </View>

            <View style={styles.sectionBody}>
              <Grid>
                <Field
                  label="OD premium"
                  value={
                    premium.ownDamage
                      ? `Rs. ${formatRupees(premium.ownDamage.net)}`
                      : 'NA'
                  }
                />
                <Field
                  label="TP premium"
                  value={
                    premium.thirdParty
                      ? `Rs. ${formatRupees(premium.thirdParty.net)}`
                      : 'NA'
                  }
                />
                <Field
                  label="Add on"
                  value={`Rs. ${formatRupees(premium.ownDamage?.addOns ?? 0)}`}
                />
                <Field label="GST" value={`Rs. ${formatRupees(premium.gst)}`} />
                <Field
                  label="No claim bonus"
                  value={
                    premium.ownDamage && premium.ownDamage.ncbAmount > 0
                      ? `−Rs. ${formatRupees(premium.ownDamage.ncbAmount)}`
                      : 'Rs. 0'
                  }
                />
                <Field
                  label="Discount"
                  value={
                    premium.adjustment === 0
                      ? 'Rs. 0'
                      : `${premium.adjustment < 0 ? '−' : '+'}Rs. ${formatRupees(
                          Math.abs(premium.adjustment),
                        )}`
                  }
                />
              </Grid>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Total premium:</Text>
                <Text style={styles.totalValue}>
                  Rs. {formatRupees(premium.total)}
                </Text>
              </View>
            </View>
          </View>

          {vehicle ? (
            <Section title="Vehicle Details">
              <VehicleDetailCard vehicle={vehicle} />
            </Section>
          ) : null}

          <Section title="Quote Details">
            <Grid>
              <Field label="Quotation number:" value="1836735653765" />
              <Field label="Issued on:" value={formatDate(issuedOn)} />
              <Field label="Valid until:" value={formatDate(validUntil)} />
              <Field label="IMD:" value="Rajesh Chaurasia" />
              <Field label="Sub IMD:" value="NA" />
              <Field label="Zone:" value="A" />
              <Field label="State:" value="Gujrat" />
            </Grid>
            <Field
              label="Issuing office:"
              value="Ahemdabad branch, 4th floor, Elisbridge, Ahemdabad, Gujrat, 380006"
            />
          </Section>

          <Section title="Plan Details">
            <Grid>
              <Field
                label="Policy type:"
                value={plan.id === 'comprehensive' ? 'Comprehensive (Package)' : plan.name}
              />
              <Field label="Package:" value={packageName || 'NA'} />
              <Field
                label="IDV"
                value={premium.idv === null ? 'NA' : `₹${formatRupees(premium.idv)}`}
              />
              <Field label="NCB" value={`${premium.ownDamage?.ncbPercent ?? 0}%`} />
              <Field label="Policy start date:" value={formatDate(policyStartDate)} />
              <Field label="Policy end date" value={formatDate(policyEndDate)} />
              <Field label="Policy tenure:" value={policyTenure || '1 year'} />
              <Field label="Type of use:" value="Personal" />
            </Grid>
          </Section>

          <Section title="Proposer Details">
            <Grid>
              <Field label="Proposer name:" value={proposerName || 'NA'} />
              <Field label="Contact no." value={proposerPhone || 'NA'} />
              <Field label="Email ID:" value={proposerEmail || 'NA'} />
              <Field label="Customer ID:" value="1836735653765" />
            </Grid>
          </Section>

          <Section title="Add ons">
            {selectedAddOns.length === 0 ? (
              <Text style={styles.emptyAddOns}>No add-ons selected.</Text>
            ) : (
              <View style={styles.grid}>
                {selectedAddOns.map((addOn) => (
                  <View key={addOn.id} style={styles.addOnRow}>
                    <CheckCircle size={16} color={motorColors.selectedBorder} />
                    <Text style={styles.addOnLabel}>{addOn.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </Section>
        </View>
      </View>
    </MotorCard>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  titleBar: { padding: spacing.lg },
  title: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
  },
  sheetBody: { padding: spacing.lg, gap: spacing.lg },

  section: { gap: spacing.md },
  sectionHeader: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  premiumHeader: { backgroundColor: motorColors.total },
  sectionTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
  },
  premiumTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textOnBrand,
  },
  sectionBody: { gap: spacing.lg },

  // Two per row — `flexBasis: 47%` leaves room for the 16px gap.
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg, columnGap: spacing.lg },
  field: { flexBasis: '47%', flexGrow: 1, gap: spacing.xs },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  totalValue: {
    fontFamily: fontFamilyForWeight('600'),
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '600',
    color: colors.textHeading,
  },

  addOnRow: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addOnLabel: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  emptyAddOns: { fontFamily: typography.fontFamily, fontSize: 14, color: '#64748B' },
});
