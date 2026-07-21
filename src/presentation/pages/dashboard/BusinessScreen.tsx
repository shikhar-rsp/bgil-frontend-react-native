import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Plus, CaretLeft } from 'phosphor-react-native';
import { Button, Tabs, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { BusinessInsights } from '../../components/dashboard/business/BusinessInsights';
import { SharedQuotes } from '../../components/dashboard/business/SharedQuotes';
import { DraftsPage } from '../../components/dashboard/business/DraftsPage';
import { BrowseCategories } from '../../components/dashboard/business/BrowseCategories';
import { HealthGuardWizard } from '../../components/dashboard/business/HealthGuardWizard';
import { ConvertProposalWizard } from '../../components/dashboard/business/ConvertProposalWizard';
import { IssuedPolicy } from '../../components/dashboard/business/IssuedPolicy';
import { TwoWheelerInsurance } from '../../components/dashboard/business/motor/TwoWheelerInsurance';
import type { Policy } from '../../components/dashboard/business/businessData';

type BizView =
  | { kind: 'landing' }
  | { kind: 'browse' }
  | { kind: 'healthguard'; product: string }
  | { kind: 'motor'; product: string }
  | { kind: 'convert'; customer: string }
  | { kind: 'policy'; policy: Policy };

const TITLES: Record<BizView['kind'], string> = {
  landing: 'My Business',
  browse: 'Create Quote',
  healthguard: 'New Quote',
  motor: 'Motor Insurance',
  convert: 'Convert to Proposal',
  policy: 'Policy Details',
};

/** Motor products route to the Two-Wheeler / Motor flow; others to Health Guard. */
const MOTOR_PRODUCTS = ['Private Car', 'Two Wheeler', 'Commercial Vehicle', 'Pay as you consume'];
const productView = (label: string): BizView =>
  MOTOR_PRODUCTS.includes(label) ? { kind: 'motor', product: label } : { kind: 'healthguard', product: label };

/** Business tab — landing (insights + lists + drafts) and the quote/proposal wizards. */
export const BusinessScreen: React.FC = () => {
  const [view, setView] = useState<BizView>({ kind: 'landing' });
  const [tab, setTab] = useState<'dashboard' | 'drafts'>('dashboard');

  const goLanding = () => setView({ kind: 'landing' });

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        {view.kind !== 'landing' ? (
          <Pressable onPress={goLanding} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
            <CaretLeft size={18} color={colors.textBody} weight="bold" />
          </Pressable>
        ) : null}
        <Text style={styles.title}>{TITLES[view.kind]}</Text>
        {view.kind === 'landing' ? (
          <Button
            label="Quote"
            size="sm"
            leadingIcon={<Plus size={16} color={colors.textOnBrand} />}
            onPress={() => setView({ kind: 'browse' })}
            style={styles.quoteBtn}
          />
        ) : null}
      </View>

      {view.kind === 'landing' ? (
        <>
          <View style={styles.tabsWrap}>
            <Tabs
              value={tab}
              onChange={(v) => setTab(v as 'dashboard' | 'drafts')}
              size="sm"
              tabs={[
                { value: 'dashboard', label: 'Dashboard' },
                { value: 'drafts', label: 'Drafts' },
              ]}
            />
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {tab === 'dashboard' ? (
              <>
                <BusinessInsights />
                <SharedQuotes
                  onEditQuote={(q) => setView({ kind: 'healthguard', product: q.product })}
                  onConvertToProposal={(q) => setView({ kind: 'convert', customer: q.customer })}
                  onViewPolicy={(p) => setView({ kind: 'policy', policy: p })}
                />
              </>
            ) : (
              <DraftsPage onEditDraft={(d) => setView({ kind: 'healthguard', product: d.product })} />
            )}
          </ScrollView>
        </>
      ) : view.kind === 'browse' ? (
        <BrowseCategories onSelectProduct={(label) => setView(productView(label))} />
      ) : view.kind === 'healthguard' ? (
        <HealthGuardWizard
          product={view.product}
          onClose={goLanding}
          onConvertToProposal={(customer) => setView({ kind: 'convert', customer })}
        />
      ) : view.kind === 'motor' ? (
        <TwoWheelerInsurance
          onClose={goLanding}
          onConvertToProposal={(customer) => setView({ kind: 'convert', customer })}
        />
      ) : view.kind === 'convert' ? (
        <ConvertProposalWizard customerName={view.customer} onClose={goLanding} />
      ) : (
        <IssuedPolicy policy={view.policy} onClose={goLanding} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadow.lg,
  },
  back: { padding: spacing.xs },
  title: { flex: 1, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: '600', color: colors.textHeading },
  quoteBtn: { minWidth: 96 },
  tabsWrap: { padding: spacing.lg, paddingBottom: 0 },
  content: { padding: spacing.lg, gap: spacing.lg },
});
