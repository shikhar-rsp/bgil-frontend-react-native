import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowRight, CreditCard, Eye, PaperPlaneTilt } from 'phosphor-react-native';
import {
  Badge,
  Button,
  Textfield,
  Toast,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitMeta, ToolkitSheet } from './ToolkitSheet';
import {
  PAYMENTS,
  PAYMENT_BADGE,
  PAYMENT_STATUSES,
  inDateRange,
  type PaymentRecord,
} from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'status', label: 'Status', options: PAYMENT_STATUSES.map((s) => ({ value: s, label: s })) },
];

interface PaymentTrackerSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Online Payment Tracker — payment links and where each one got to, with a
 * pushed step for resending a failed link.
 *
 * Ported from the web's `sidedrawer-paymentTracker`. Two departures:
 *
 * • The web's "search by" dropdown only chose which field headlined the card —
 *   the search itself always spanned all of them. On a phone the selector costs
 *   a row of chrome for a cosmetic change, so the card leads with the customer
 *   and the search still spans every field.
 * • Resending opens the sheet's own detail step rather than swapping the
 *   drawer's body, so the back arrow and the slide animation come for free.
 */
export const PaymentTrackerSheet: React.FC<PaymentTrackerSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);
  // Resending flips a row to Pending, so the list is stateful here.
  const [payments, setPayments] = useState<PaymentRecord[]>(PAYMENTS);
  const [resending, setResending] = useState<PaymentRecord | null>(null);
  const [email, setEmail] = useState('');

  const statuses = filters.status ?? [];

  const visiblePayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter(
      (p) =>
        (!term ||
          p.customer.toLowerCase().includes(term) ||
          p.policyNumber.toLowerCase().includes(term) ||
          p.transactionId.toLowerCase().includes(term) ||
          p.traceId.toLowerCase().includes(term) ||
          p.quoteNumber.toLowerCase().includes(term) ||
          p.floatNumber.toLowerCase().includes(term)) &&
        (statuses.length === 0 || statuses.includes(p.status)) &&
        inDateRange(p.date, start, end),
    );
  }, [payments, search, statuses, start, end]);

  /** Both share buttons do the same thing on the web: mark it Pending again. */
  const share = (channel: string) => {
    if (!resending) {
      return;
    }
    setPayments((prev) =>
      prev.map((p) => (p.id === resending.id ? { ...p, status: 'Pending' } : p)),
    );
    setResending((prev) => (prev ? { ...prev, status: 'Pending' } : null));
    setToast({
      title: 'Payment Link Shared',
      message: `Payment link has been successfully shared on ${channel}.`,
    });
  };

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Payment Tracker"
      icon={<CreditCard size={20} color={colors.brand} />}
      search={search}
      onSearchChange={setSearch}
      filterGroups={FILTER_GROUPS}
      filterValues={filters}
      onFilterChange={setFilters}
      rangeStart={start}
      rangeEnd={end}
      onDateRangeChange={(s, e) => {
        setStart(s);
        setEnd(e);
      }}
      sectionTitle="Your Recent Transactions"
      sectionHint="You can see your recent transactions for the past 2 days. Select a specific time period to fetch results."
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
        label: 'Generate Statement',
        onPress: () =>
          setToast({ title: 'Generate statement', message: 'This flow is coming soon.' }),
      }}
      secondaryAction={{
        label: 'Download Transactions',
        onPress: () =>
          setToast({ title: 'Download transactions', message: 'This flow is coming soon.' }),
      }}
      detailTitle="Resend Payment Link"
      onDetailBack={() => setResending(null)}
      detail={
        resending ? (
          <View style={styles.detail}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailHeading}>Recent Payment Link</Text>
              <Badge
                variant="light"
                size="sm"
                color={PAYMENT_BADGE[resending.status]}
                label={resending.status}
              />
            </View>

            <Textfield label="Scrutiny Number" value={resending.quoteNumber} readOnly />
            <Textfield label="Name" value={resending.customer} readOnly />
            <Textfield
              label="Amount"
              value={`₹ ${resending.amount.toLocaleString('en-IN')}`}
              readOnly
            />
            <Textfield
              label="Enter email ID"
              placeholder="Enter Email ID"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        ) : null
      }
      detailPrimaryAction={{ label: 'Share on Email', onPress: () => share('email') }}
      detailSecondaryAction={{ label: 'Share on Whatsapp', onPress: () => share('WhatsApp') }}
    >
      {visiblePayments.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        visiblePayments.map((p) => (
          <ToolkitCard key={p.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {p.customer}
              </Text>
              <Badge label={p.status} variant="light" size="sm" color={PAYMENT_BADGE[p.status]} />
            </View>

            <ToolkitMeta label="Policy No.:" value={p.policyNumber} />
            <ToolkitMeta label="Scrutiny No.:" value={p.quoteNumber} />
            <ToolkitMeta label="Amount:" value={`₹ ${p.amount.toLocaleString('en-IN')}`} />

            {/* The float number only exists once the money landed. */}
            {p.status === 'Received' ? (
              <View style={styles.floatRow}>
                <Button
                  label={`Float no. ${p.floatNumber}`}
                  variant="link"
                  size="sm"
                  leadingIcon={<ArrowRight size={14} color={colors.brand} />}
                  onPress={() =>
                    setToast({ title: 'Float entry', message: `Float no. ${p.floatNumber}` })
                  }
                />
              </View>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`View payment ${p.transactionId}`}
                onPress={() =>
                  setToast({ title: 'Opening payment', message: `Transaction: ${p.transactionId}` })
                }
              >
                <Eye size={16} color={colors.textBody} />
              </Pressable>
              {/* Only a failed link is worth resending. */}
              {p.status === 'Failed' ? (
                <Pressable
                  style={styles.actionBtn}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={`Resend payment link for ${p.transactionId}`}
                  onPress={() => {
                    setEmail('');
                    setResending(p);
                  }}
                >
                  <PaperPlaneTilt size={16} color={colors.textBody} />
                </Pressable>
              ) : null}
            </View>
          </ToolkitCard>
        ))
      )}
    </ToolkitSheet>
  );
};

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: {
    flexShrink: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 15,
    fontWeight: '500',
    color: colors.textHeading,
  },
  floatRow: { flexDirection: 'row', marginTop: spacing.xxs },
  actions: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  actionBtn: { padding: spacing.xs, borderRadius: radius.md },

  // --- detail step ----------------------------------------------------------
  detail: { gap: spacing.md },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailHeading: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textBody,
  },
});
