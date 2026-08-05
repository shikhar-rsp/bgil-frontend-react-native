import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowsClockwise, Wallet } from 'phosphor-react-native';
import {
  Badge,
  Toast,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
} from '@atlas-ds/react-native';
import { dashboardImages } from '../../images';
import { ToolkitCard, ToolkitEmptyState, ToolkitMeta, ToolkitSheet } from './ToolkitSheet';
import {
  FLOAT_AMOUNT_COLOR,
  FLOAT_BADGE,
  FLOAT_BALANCE,
  FLOAT_TRANSACTIONS,
  formatFloatDate,
} from './toolkitData';

interface AgentFloatSheetProps {
  visible: boolean;
  onClose: () => void;
}

const rupees = (n: number): string => `₹${n.toLocaleString('en-IN')}`;

/**
 * Agent Float Replenishment — the float balance and the transactions that have
 * drawn against it.
 *
 * Ported from the web's `sidedrawer-replenishment`. The web's `role="veteran"`
 * variant (a second card carrying the notional balance and its used / remaining
 * / due-date split) isn't ported — the RN toolkit has no veteran entry point
 * yet. `FLOAT_BALANCE` already carries those figures for whenever it does.
 */
export const AgentFloatSheet: React.FC<AgentFloatSheetProps> = ({ visible, onClose }) => {
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Agent Float"
      icon={<Wallet size={20} color={colors.brand} />}
      headerExtra={
        // The gradient paints on `absoluteFill` behind a plain View rather than
        // wrapping the content itself: given padding and children, LinearGradient
        // doesn't grow to fit them on iOS and clips the balance mid-digit. Same
        // arrangement the renewal premium card uses.
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#FFFFFF', '#EFF6FF']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.balanceRow}>
            <View style={styles.balanceText}>
              <View style={styles.balanceLabelRow}>
                <Text style={styles.balanceLabel}>Available Float Balance</Text>
                {/* Decorative on the web too — it animates on hover but has no
                    handler. Kept pressable so the affordance isn't a lie. */}
                <Pressable
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh float balance"
                  onPress={() =>
                    setToast({
                      title: 'Balance refreshed',
                      message: 'Showing the latest float balance.',
                    })
                  }
                >
                  <ArrowsClockwise size={16} color={colors.brand} />
                </Pressable>
              </View>
              <Text style={styles.balanceValue}>{rupees(FLOAT_BALANCE.available)}</Text>
            </View>
            <Image source={dashboardImages.wallet} style={styles.wallet} resizeMode="contain" />
          </View>
        </View>
      }
      sectionTitle="Recent Float Transactions"
      sectionHint="Float movements from the last 90 days. Credits show against a successful replenishment."
      banner={
        toast ? (
          <Toast
            variant="success"
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null
      }
      primaryAction={{
        label: 'Replenish Float Balance',
        onPress: () => setToast({ title: 'Replenish float', message: 'This flow is coming soon.' }),
      }}
    >
      {FLOAT_TRANSACTIONS.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        FLOAT_TRANSACTIONS.map((t) => (
          <ToolkitCard key={t.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {t.customer}
              </Text>
              <Badge label={t.status} variant="light" size="sm" color={FLOAT_BADGE[t.status]} />
            </View>

            {/* Credits carry a leading "+" on top of the colour, so the direction
                of the movement survives for anyone who can't separate the two
                greens. */}
            <ToolkitMeta
              label="Amount:"
              value={`${t.status === 'Successful' ? '+ ' : ''}${rupees(t.amount)}`}
              valueColor={FLOAT_AMOUNT_COLOR[t.status]}
            />
            <ToolkitMeta label="Date:" value={formatFloatDate(t.date)} />
          </ToolkitCard>
        ))
      )}
    </ToolkitSheet>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    // `overflow: hidden` keeps the gradient inside the rounded corners now that
    // it is a separate absolutely-positioned layer.
    overflow: 'hidden',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceText: { flexShrink: 1, gap: spacing.xxs },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  balanceLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  // 32px on the web. Naming the face keeps it heavy on Android.
  balanceValue: {
    fontFamily: fontFamilyForWeight('600'),
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    color: colors.textHeading,
  },
  wallet: { width: 64, height: 64 },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: {
    flexShrink: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 15,
    fontWeight: '500',
    color: colors.textHeading,
  },
});
