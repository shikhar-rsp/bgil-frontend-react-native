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

/**
 * Renewal products carry the plan suffix ("Private Car - Comprehensive",
 * "2 Wheeler - OD only"), so `MOTOR_PRODUCTS` can't be matched outright — these
 * words are what separate a motor policy from a health one in the mock data.
 */
const MOTOR_HINTS = ['wheeler', 'car', 'commercial', 'vehicle', 'bus'];

const isMotorProduct = (product: string): boolean => {
  const value = product.toLowerCase();
  return MOTOR_HINTS.some((hint) => value.includes(hint));
};

/** Closest vehicle art for the product; falls back to the car. */
const motorArt = (product: string) => {
  const value = product.toLowerCase();
  if (value.includes('wheeler')) return dashboardImages.bulletPng;
  if (value.includes('commercial')) return dashboardImages.commercialPng;
  if (value.includes('bus')) return dashboardImages.schoolBus;
  return dashboardImages.carPng;
};

const Field: React.FC<{ label: string; children: React.ReactNode; style?: object }> = ({
  label,
  children,
  style,
}) => (
  <View style={[styles.field, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

/**
 * "Current Policy" summary shown above every step of the renewal flow.
 *
 * Two product skins, following the motor flow's identified-vehicle card: the
 * artwork is pinned to the top-right of the gradient panel and the first two
 * fields stack to its left with enough padding to clear it, rather than the
 * illustration trailing underneath the values. Motor renewals additionally get
 * the amber palette and the background swoosh that card uses; health keeps its
 * pink palette and swaps the vehicle for the heart.
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
  const isMotor = isMotorProduct(product);

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

      <View style={[styles.summary, isMotor ? styles.summaryMotor : styles.summaryHealth]}>
        <LinearGradient
          colors={isMotor ? ['#FFFFFF', '#FFF7ED'] : ['#FFFFFF', '#FDF2F8']}
          style={StyleSheet.absoluteFill}
        />

        {/* Background swoosh — motor only; there is no health equivalent asset. */}
        {isMotor ? (
          <Image source={dashboardImages.vehicleBack} style={styles.backdrop} resizeMode="contain" />
        ) : null}

        <Image
          source={isMotor ? motorArt(product) : dashboardImages.health}
          style={isMotor ? styles.artMotor : styles.artHealth}
          resizeMode="contain"
        />

        <View style={styles.summaryInner}>
          {/* Stacked and padded so they clear the artwork above-right. The
              motor art is the wider of the two, so each gets its own reserve
              rather than the long "Health Guard - Individual" value wrapping
              against space nothing occupies. */}
          <View style={[styles.topBlock, isMotor ? styles.topBlockMotor : styles.topBlockHealth]}>
            <Field label="Customer:">
              <Text style={styles.fieldValue}>{record?.customer ?? 'Priya Sharma'}</Text>
            </Field>
            <Field label="Policy:">
              <Text style={styles.fieldValue}>{product}</Text>
            </Field>
          </View>

          <View style={styles.detailRow}>
            <Field label="Renewal Policy ID:" style={styles.col}>
              <Text style={styles.fieldValue}>{renewalPolicyId}</Text>
            </Field>
            <Field label={isMotor ? 'Vehicle:' : 'Members:'} style={styles.col}>
              <Text style={styles.fieldValue}>
                {isMotor ? record?.productCode ?? 'Private Car' : '2 Adult 2 Child'}
              </Text>
            </Field>
          </View>

          <View style={styles.detailRow}>
            <Field label="Premium:" style={styles.col}>
              <Text style={styles.fieldValue}>{premium}</Text>
            </Field>
            <Field label="Expiring within" style={styles.col}>
              <Badge
                label={expiringWithin}
                variant="solid"
                size="sm"
                color={expiringWithinColor(expiringWithin)}
                style={styles.badge}
              />
            </Field>
          </View>
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
  // The gradient and artwork fill this box absolutely, so it must clip them.
  summary: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  summaryHealth: { borderColor: '#FBCFE8' },
  summaryMotor: { borderColor: '#FED7AA' },
  // Oversized and bled off the corner, as on the motor flow's vehicle card.
  backdrop: { position: 'absolute', top: -48, right: -spacing.md, width: 260, height: 150 },
  artMotor: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 112, height: 90 },
  artHealth: { position: 'absolute', top: spacing.sm, right: spacing.md, width: 72, height: 72 },
  summaryInner: { padding: spacing.lg, gap: spacing.md },
  topBlock: { gap: spacing.md },
  topBlockMotor: { paddingRight: 120 },
  topBlockHealth: { paddingRight: 88 },
  detailRow: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  field: { gap: 2 },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  // Badge stretches to its row by default; keep it hugging its label.
  badge: { alignSelf: 'flex-start' },
});
