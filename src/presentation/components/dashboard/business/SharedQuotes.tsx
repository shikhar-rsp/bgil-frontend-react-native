import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  SearchBar,
  Tabs,
  Filter,
  FilterButton,
  DatePicker,
  BottomSheet,
  ToastGlobal,
  colors,
  spacing,
  radius,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { QuotesList } from './lists/QuotesList';
import { ProposalsList } from './lists/ProposalsList';
import { PoliciesList } from './lists/PoliciesList';
import { RenewalsList } from './lists/RenewalsList';
import { ConfirmDeleteModal } from './lists/ConfirmDeleteModal';
import { resolveSearchStatus } from './lists/ListEmptyState';
import { ShareQuoteModal } from './motor/ShareQuoteModal';
import {
  QUOTES,
  PROPOSALS,
  POLICIES,
  RENEWALS,
  parseExpiringDays,
  type Quote,
  type Proposal,
  type Policy,
  type Renewal,
} from './businessData';

type TabKey = 'quotes' | 'proposals' | 'policies' | 'renewals';

type ToastState = { variant: 'success' | 'error' | 'neutral' | 'info'; title: string; message?: string } | null;

/** Per-tab filter categories — the web pairs stage+LOB for records and
 *  LOB+expiringWithin for renewals. */
const FILTER_GROUPS: Record<TabKey, FilterGroup[]> = {
  quotes: [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Awaiting', label: 'Awaiting' },
      ],
    },
    {
      key: 'planType',
      label: 'Plan type',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'float', label: 'Floater' },
      ],
    },
  ],
  proposals: [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Payment Received', label: 'Payment Received' },
        { value: 'Payment Pending', label: 'Payment Pending' },
        { value: 'Payment Rejected', label: 'Payment Rejected' },
        { value: 'Underwriting', label: 'Underwriting' },
      ],
    },
    {
      key: 'businessType',
      label: 'Business type',
      options: [
        { value: 'new', label: 'New' },
        { value: 'portability', label: 'Portability' },
      ],
    },
  ],
  policies: [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Underwriting', label: 'Underwriting' },
        { value: 'Issued', label: 'Issued' },
      ],
    },
    {
      key: 'type',
      label: 'Plan type',
      options: [
        { value: 'Individual', label: 'Individual' },
        { value: 'Floater', label: 'Floater' },
      ],
    },
  ],
  renewals: [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Payment Due', label: 'Payment Due' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Not Started', label: 'Not Started' },
      ],
    },
    {
      key: 'expiringWithin',
      label: 'Expiring within',
      options: [
        { value: '7', label: '7 days' },
        { value: '14', label: '14 days' },
        { value: '30', label: '30 days' },
      ],
    },
  ],
};

/** Record dates are `DD/MM/YY` — parse for range comparison. */
const parseRecordDate = (s: string): Date | null => {
  const [d, m, y] = s.split('/').map(Number);
  if (!d || !m || !y) {
    return null;
  }
  return new Date(2000 + y, m - 1, d);
};

export interface SharedQuotesProps {
  onEditQuote: (q: Quote) => void;
  onConvertToProposal: (q: Quote) => void;
  onViewPolicy: (p: Policy) => void;
  /** Opens the Create-a-quote browser from the empty state. */
  onCreateQuote?: () => void;
  /** Optional: opens an existing proposal for editing. */
  onEditProposal?: (p: Proposal) => void;
}

export const SharedQuotes: React.FC<SharedQuotesProps> = ({
  onEditQuote,
  onConvertToProposal,
  onViewPolicy,
  onCreateQuote,
  onEditProposal,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('quotes');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersByTab, setFiltersByTab] = useState<Record<TabKey, Record<string, string[]>>>({
    quotes: {},
    proposals: {},
    policies: {},
    renewals: {},
  });
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Quotes are stateful so Duplicate can prepend a row; the other tabs read
  // straight from the fixtures.
  const [quotes, setQuotes] = useState<Quote[]>(QUOTES);

  const [toast, setToast] = useState<ToastState>(null);
  const [pendingDelete, setPendingDelete] = useState<{ noun: string; label: string; customer: string } | null>(null);
  const [shareTarget, setShareTarget] = useState<
    { kind: 'policy' | 'renewal'; id: string; customerName: string; policyType: string } | null
  >(null);

  const filterValues = filtersByTab[activeTab];
  const appliedCount = Object.values(filterValues).reduce((n, v) => n + v.length, 0);
  const setFilterValues = (values: Record<string, string[]>) =>
    setFiltersByTab((prev) => ({ ...prev, [activeTab]: values }));

  const term = search.trim().toLowerCase();

  const inDateRange = (date: string) => {
    const d = parseRecordDate(date);
    if (!d) {
      return true;
    }
    if (fromDate && d < fromDate) {
      return false;
    }
    if (toDate && d > toDate) {
      return false;
    }
    return true;
  };

  const filteredQuotes = useMemo(() => {
    const { status = [], planType = [] } = filtersByTab.quotes;
    return quotes.filter((q) => {
      if (
        term &&
        !q.customer.toLowerCase().includes(term) &&
        !q.quoteId.toLowerCase().includes(term) &&
        !q.product.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (status.length > 0 && !status.includes(q.status)) {
        return false;
      }
      if (planType.length > 0 && !planType.includes(q.planType)) {
        return false;
      }
      return inDateRange(q.date);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes, term, filtersByTab.quotes, fromDate, toDate]);

  const filteredProposals = useMemo(() => {
    const { status = [], businessType = [] } = filtersByTab.proposals;
    return PROPOSALS.filter((p) => {
      if (
        term &&
        !p.customer.toLowerCase().includes(term) &&
        !p.proposalId.toLowerCase().includes(term) &&
        !p.product.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (status.length > 0 && !status.includes(p.status)) {
        return false;
      }
      if (businessType.length > 0 && !businessType.includes(p.businessType)) {
        return false;
      }
      return inDateRange(p.date);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, filtersByTab.proposals, fromDate, toDate]);

  const filteredPolicies = useMemo(() => {
    const { status = [], type = [] } = filtersByTab.policies;
    return POLICIES.filter((p) => {
      if (
        term &&
        !p.customer.toLowerCase().includes(term) &&
        !p.policyId.toLowerCase().includes(term) &&
        !p.product.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (status.length > 0 && !status.includes(p.status)) {
        return false;
      }
      if (type.length > 0 && !type.includes(p.type)) {
        return false;
      }
      return inDateRange(p.date);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, filtersByTab.policies, fromDate, toDate]);

  const filteredRenewals = useMemo(() => {
    const { status = [], expiringWithin = [] } = filtersByTab.renewals;
    return RENEWALS.filter((r) => {
      if (
        term &&
        !r.customer.toLowerCase().includes(term) &&
        !r.renewalPolicyId.toLowerCase().includes(term) &&
        !r.product.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (status.length > 0 && !status.includes(r.status)) {
        return false;
      }
      if (expiringWithin.length > 0) {
        const days = parseExpiringDays(r.expiringWithin);
        if (!expiringWithin.some((threshold) => days <= Number(threshold))) {
          return false;
        }
      }
      return true;
    });
  }, [term, filtersByTab.renewals]);

  // Toasts sit inside this card rather than at the screen root, so leaving one
  // up after the user scrolls away would strand it — auto-dismiss instead.
  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // --- row actions ----------------------------------------------------------

  const duplicateQuote = (q: Quote) => {
    const copy: Quote = {
      ...q,
      id: Math.max(0, ...quotes.map((x) => x.id)) + 1,
      quoteId: `QT${Date.now()}`,
      copiedFrom: q.quoteId,
    };
    setQuotes((prev) => [copy, ...prev]);
    setToast({ variant: 'success', title: 'Quote duplicated', message: `A copy of ${q.quoteId} was added to the top.` });
  };

  const confirmDelete = () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (target) {
      // Matches the web: the row is not actually removed, only reported.
      setToast({ variant: 'error', title: `${target.noun} deleted`, message: `${target.label} for ${target.customer}.` });
    }
  };

  return (
    <View style={styles.card}>
      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabKey)}
        size="sm"
        variant="secondary"
        tabs={[
          { value: 'quotes', label: 'Quotes', badge: quotes.length },
          { value: 'proposals', label: 'Proposals', badge: PROPOSALS.length },
          { value: 'policies', label: 'Policies', badge: POLICIES.length },
          { value: 'renewals', label: 'Renewals', badge: RENEWALS.length },
        ]}
      />

      <View style={styles.searchWrap}>
        <View style={styles.toolbar}>
          <View style={styles.searchFlex}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search" />
          </View>
          <FilterButton onPress={() => setFilterOpen(true)} count={appliedCount || undefined} />
        </View>

        {/* Renewals are filtered by expiry band rather than a created-on range. */}
        {activeTab !== 'renewals' ? (
          <DatePicker
            mode="range"
            startPlaceholder="From"
            endPlaceholder="To"
            startDate={fromDate}
            endDate={toDate}
            onRangeChange={(s, e) => {
              setFromDate(s);
              setToDate(e);
            }}
            sheetTitle="Select date range"
          />
        ) : null}
      </View>

      {activeTab === 'quotes' ? (
        <QuotesList
          data={filteredQuotes}
          searchStatus={resolveSearchStatus(search, filteredQuotes.length)}
          isSourceEmpty={quotes.length === 0}
          onCreateQuote={onCreateQuote}
          onDuplicate={duplicateQuote}
          onDelete={(q) => setPendingDelete({ noun: 'Quote', label: q.quoteId, customer: q.customer })}
          onEdit={onEditQuote}
          onConvert={onConvertToProposal}
        />
      ) : activeTab === 'proposals' ? (
        <ProposalsList
          data={filteredProposals}
          searchStatus={resolveSearchStatus(search, filteredProposals.length)}
          isSourceEmpty={PROPOSALS.length === 0}
          onCreateQuote={onCreateQuote}
          onDelete={(p) => setPendingDelete({ noun: 'Proposal', label: p.proposalId, customer: p.customer })}
          onEdit={(p) =>
            onEditProposal
              ? onEditProposal(p)
              : setToast({ variant: 'info', title: 'Edit proposal', message: `${p.proposalId} is not editable yet.` })
          }
        />
      ) : activeTab === 'policies' ? (
        <PoliciesList
          data={filteredPolicies}
          searchStatus={resolveSearchStatus(search, filteredPolicies.length)}
          isSourceEmpty={POLICIES.length === 0}
          onCreateQuote={onCreateQuote}
          onView={onViewPolicy}
          onDownload={(p) => setToast({ variant: 'neutral', title: 'Download started', message: `${p.policyId}.pdf` })}
          onShare={(p) =>
            setShareTarget({ kind: 'policy', id: p.policyId, customerName: p.customer, policyType: p.product })
          }
          onEndorsement={(p) =>
            setToast({ variant: 'info', title: 'Endorsement', message: `Not available yet for ${p.policyId}.` })
          }
        />
      ) : (
        <RenewalsList
          data={filteredRenewals}
          searchStatus={resolveSearchStatus(search, filteredRenewals.length)}
          isSourceEmpty={RENEWALS.length === 0}
          onRenew={(r) =>
            setToast({ variant: 'info', title: 'Renew policy', message: `The renewal flow for ${r.renewalPolicyId} is not built yet.` })
          }
          onShareNotice={(r) =>
            setShareTarget({
              kind: 'renewal',
              id: r.renewalPolicyId,
              customerName: r.customer,
              policyType: r.product,
            })
          }
          onViewPolicy={(r) =>
            setToast({ variant: 'info', title: 'View policy', message: `No policy record linked to ${r.renewalPolicyId} yet.` })
          }
          onCallCustomer={(r) => setToast({ variant: 'neutral', title: `Calling ${r.customer}…` })}
        />
      )}

      <BottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter"
        subtitle="Narrow down the list"
        contentMinHeight={0}
        primaryAction={{ label: 'Apply', onPress: () => setFilterOpen(false) }}
        secondaryAction={{ label: 'Clear all', onPress: () => setFilterValues({}) }}
      >
        <Filter groups={FILTER_GROUPS[activeTab]} values={filterValues} onChange={setFilterValues} />
      </BottomSheet>

      <ConfirmDeleteModal
        visible={pendingDelete !== null}
        noun={(pendingDelete?.noun ?? 'record').toLowerCase()}
        recordLabel={pendingDelete?.label}
        customerName={pendingDelete?.customer}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <ShareQuoteModal
        isOpen={shareTarget !== null}
        onClose={() => setShareTarget(null)}
        title={shareTarget?.kind === 'renewal' ? 'Share Renewal Notice' : 'Share Policy'}
        subtitle={
          shareTarget?.kind === 'renewal'
            ? 'Send the renewal notice to your customer.'
            : 'Share the policy document with your customer.'
        }
        idLabel={shareTarget?.kind === 'renewal' ? 'Renewal Policy ID:' : 'Policy ID:'}
        shareLabel={shareTarget?.kind === 'renewal' ? 'Share the notice via:' : 'Share the policy via:'}
        quoteData={
          shareTarget
            ? { id: shareTarget.id, customerName: shareTarget.customerName, policyType: shareTarget.policyType }
            : undefined
        }
      />

      {toast ? (
        <View style={styles.toast} pointerEvents="box-none">
          <ToastGlobal
            variant={toast.variant}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  searchWrap: { marginTop: spacing.xs, gap: spacing.md },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchFlex: { flex: 1 },
  toast: { position: 'absolute', top: spacing.sm, left: spacing.sm, right: spacing.sm, zIndex: 30 },
});
