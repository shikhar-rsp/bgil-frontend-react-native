import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DownloadSimple } from 'phosphor-react-native';
import { Badge, Button, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { dashboardImages } from '../../images';
import { expiringWithinColor, type Renewal } from '../businessData';
import { formatRupees } from './renewalData';

interface CurrentPolicyCardProps {
  record?: Renewal;
  /** Flow mode shows "Edit full policy"; view mode shows "View full policy". */
  editable?: boolean;
  onDownload?: () => void;
  onOpenFullPolicy?: () => void;
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

/**
 * "Current Policy" summary shown above every step of the renewal flow.
 *
 * The web card lays its six fields out as a 3-column grid with the product
 * illustration pinned bottom-right; on a phone that becomes a 2-column wrap and
 * the illustration sits inline at the end so it can never overlap a value.
 */
export const CurrentPolicyCard: React.FC<CurrentPolicyCardProps> = ({
  record,
  editable,
  onDownload,
  onOpenFullPolicy,
}) => {
  const product = record?.product ?? 'Health Guard - Individual';
  const renewalPolicyId = record?.renewalPolicyId ?? '2741287';
  const premium = formatRupees(record?.renewalPremium ?? 15000);
  const expiringWithin = record?.expiringWithin ?? '7 days';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Current Policy</Text>
        <View style={styles.headerActions}>
          <Button
            label="Download policy"
            variant="link"
            size="sm"
            leadingIcon={<DownloadSimple size={16} color={colors.brand} />}
            onPress={onDownload}
          />
          <Button
            label={editable ? 'Edit full policy' : 'View full policy'}
            variant="secondary"
            size="sm"
            onPress={onOpenFullPolicy}
          />
        </View>
      </View>

      <View style={styles.summary}>
        <LinearGradient colors={['#FFFFFF', '#FDF2F8']} style={StyleSheet.absoluteFill} />
        <View style={styles.summaryInner}>
          <View style={styles.grid}>
            <Field label="Customer:">
              <Text style={styles.fieldValue}>{record?.customer ?? 'Priya Sharma'}</Text>
            </Field>
            <Field label="Policy:">
              <Text style={styles.fieldValue}>{product}</Text>
            </Field>
            <Field label="Renewal Policy ID:">
              <Text style={styles.fieldValue}>{renewalPolicyId}</Text>
            </Field>
            <Field label="Members:">
              <Text style={styles.fieldValue}>2 Adult 2 Child</Text>
            </Field>
            <Field label="Premium:">
              <Text style={styles.fieldValue}>{premium}</Text>
            </Field>
            <Field label="Expiring within">
              <Badge
                label={expiringWithin}
                variant="solid"
                size="sm"
                color={expiringWithinColor(expiringWithin)}
                style={styles.badge}
              />
            </Field>
          </View>
          <Image source={dashboardImages.health} style={styles.illustration} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow.lg,
  },
  header: { gap: spacing.md },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  headerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  // The gradient fills this box absolutely, so it must clip its children.
  summary: {
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  summaryInner: { padding: spacing.lg, gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  field: { width: '50%', gap: 2, paddingRight: spacing.sm },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  // Badge stretches to its row by default; keep it hugging its label.
  badge: { alignSelf: 'flex-start' },
  illustration: { width: 64, height: 64, alignSelf: 'flex-end' },
});
