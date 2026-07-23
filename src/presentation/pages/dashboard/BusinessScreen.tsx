import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Plus, CaretLeft } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { BusinessInsights } from '../../components/dashboard/business/BusinessInsights';
import { SharedQuotes } from '../../components/dashboard/business/SharedQuotes';
import { BrowseCategories } from '../../components/dashboard/business/BrowseCategories';
import { HealthGuard } from '../../components/dashboard/business/health/HealthGuard';
import { ConvertProposal } from '../../components/dashboard/business/proposal/ConvertProposal';
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
const MOTOR_PRODUCTS = ['Private Car', 'Two Wheeler', 'Commercial Vehicle', 'Pay as you Consume'];
const productView = (label: string): BizView =>
  MOTOR_PRODUCTS.includes(label) ? { kind: 'motor', product: label } : { kind: 'healthguard', product: label };

interface BusinessScreenProps {
  /** Which view to open on mount. Defaults to the landing page. */
  initialView?: 'landing' | 'browse';
}

/** Business tab — landing (insights + lists + drafts) and the quote/proposal wizards. */
export const BusinessScreen: React.FC<BusinessScreenProps> = ({ initialView = 'landing' }) => {
  const [view, setView] = useState<BizView>(initialView === 'browse' ? { kind: 'browse' } : { kind: 'landing' });

  const goLanding = () => setView({ kind: 'landing' });

  return (
    <View style={styles.flex}>
      {/* Landing, browse and the quote/proposal wizards have no top header. */}
      {view.kind === 'policy' ? (
        <View style={styles.header}>
          <Pressable onPress={goLanding} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
            <CaretLeft size={18} color={colors.textBody} weight="bold" />
          </Pressable>
          <Text style={styles.title}>{TITLES[view.kind]}</Text>
        </View>
      ) : null}

      {view.kind === 'landing' ? (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <BusinessInsights />
            <SharedQuotes
              onEditQuote={(q) => setView({ kind: 'healthguard', product: q.product })}
              onConvertToProposal={(q) => setView({ kind: 'convert', customer: q.customer })}
              onViewPolicy={(p) => setView({ kind: 'policy', policy: p })}
            />
          </ScrollView>

          {/* Floating create-quote action. */}
          <View style={styles.fab}>
            <Button
              iconOnly
              variant="primary"
              size="lg"
              label="Create a quote"
              leadingIcon={<Plus size={24} color={colors.textOnBrand} weight="bold" />}
              onPress={() => setView({ kind: 'browse' })}
            />
          </View>
        </>
      ) : view.kind === 'browse' ? (
        <BrowseCategories onSelectProduct={(label) => setView(productView(label))} />
      ) : view.kind === 'healthguard' ? (
        <HealthGuard
          productName={view.product}
          onClose={goLanding}
          onConvertToProposal={(customer) => setView({ kind: 'convert', customer })}
        />
      ) : view.kind === 'motor' ? (
        <TwoWheelerInsurance
          onClose={goLanding}
          onConvertToProposal={(customer) => setView({ kind: 'convert', customer })}
        />
      ) : view.kind === 'convert' ? (
        <ConvertProposal customerName={view.customer} onClose={goLanding} />
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
  content: { padding: spacing.lg, gap: spacing.lg },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, zIndex: 10 },
});
