import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Plus, CaretLeft } from 'phosphor-react-native';
import { Button, colors, spacing, typography, shadow } from '@atlas-ds/react-native';
import { BusinessInsights } from '../../components/dashboard/business/BusinessInsights';
import { SharedQuotes, type TabKey } from '../../components/dashboard/business/SharedQuotes';
import { BrowseCategories } from '../../components/dashboard/business/BrowseCategories';
import { HealthGuard } from '../../components/dashboard/business/health/HealthGuard';
import { ConvertProposal } from '../../components/dashboard/business/proposal/ConvertProposal';
import { RenewPolicy } from '../../components/dashboard/business/renewal/RenewPolicy';
import { IssuedPolicy } from '../../components/dashboard/business/IssuedPolicy';
import { TwoWheelerInsurance } from '../../components/dashboard/business/motor/TwoWheelerInsurance';
import { VehicleTypeModal } from '../../components/dashboard/business/motor/VehicleTypeModal';
/** Motor products route to the Two-Wheeler / Motor flow; others to Health Guard. */
import { MOTOR_PRODUCTS } from '../../components/dashboard/business/motor/motorData';
import { WalkthroughTarget } from '../../components/dashboard/walkthrough/WalkthroughContext';
import type { Policy, Renewal } from '../../components/dashboard/business/businessData';

type BizView =
  | { kind: 'landing' }
  | { kind: 'browse' }
  | { kind: 'healthguard'; product: string }
  | { kind: 'motor'; product: string; vehicleType: 'registered' | 'new' }
  | { kind: 'convert'; customer: string }
  | { kind: 'policy'; policy: Policy }
  /** `view` opens the read-only renewal summary; `flow` opens the wizard. */
  | { kind: 'renewal'; renewal: Renewal; mode: 'view' | 'flow' };

const TITLES: Record<BizView['kind'], string> = {
  landing: 'My Business',
  browse: 'Create Quote',
  healthguard: 'New Quote',
  motor: 'Motor Insurance',
  convert: 'Convert to Proposal',
  policy: 'Policy Details',
  renewal: 'Renew Policy',
};


/** A Quick Quotes tile tap. `product` is a Browse Categories product label;
 *  without one the tile has no flow yet and lands on the product list. */
export type QuoteRequest = {
  product?: string;
  /** Land on a specific Shared Quotes tab instead of opening a product. */
  tab?: TabKey;
  /** Already chosen for motor products (Quick Quotes asks in its own sheet),
   *  so the flow mounts straight away instead of opening the picker again. */
  vehicleType?: 'registered' | 'new';
};

interface BusinessScreenProps {
  /** Which view to open on mount. Defaults to the landing page. */
  initialView?: 'landing' | 'browse';
  /** Set by the host when a Quick Quotes tile is tapped. A fresh object each
   *  tap, so re-picking the same tile routes again. */
  quoteRequest?: QuoteRequest | null;
  /** Called once `quoteRequest` has been routed, so the host can clear it. */
  onQuoteRequestHandled?: () => void;
  /** Reports when a full-screen view (browse / a wizard) is open, so the host
   *  can hide the bottom nav and show a back button. Passes a back handler. */
  onFullScreenChange?: (fullScreen: boolean, onBack: () => void) => void;
  /** Backing out of a step this tab was deep-linked into (a Quick Quotes tile)
   *  returns to the dashboard rather than stranding the user on Business. */
  onExitToHome?: () => void;
}

/** Business tab — landing (insights + lists + drafts) and the quote/proposal wizards. */
export const BusinessScreen: React.FC<BusinessScreenProps> = ({
  initialView = 'landing',
  quoteRequest,
  onQuoteRequestHandled,
  onFullScreenChange,
  onExitToHome,
}) => {
  const [view, setView] = useState<BizView>(initialView === 'browse' ? { kind: 'browse' } : { kind: 'landing' });
  // Motor product awaiting a vehicle-type choice — the sheet opens over
  // whatever page launched it, and the flow mounts only once a type is picked.
  // `fromHome` records that a Quick Quotes tile brought us to this tab, so
  // backing out of the sheet can return there instead of to Business.
  const [pendingMotor, setPendingMotor] = useState<{ product: string; fromHome: boolean } | null>(null);
  // Which Shared Quotes tab the landing page should show, when something
  // outside the list asks for one (e.g. a Quick Quotes tile choosing Renewals).
  const [landingTab, setLandingTab] = useState<TabKey | undefined>(undefined);

  // Everything except the landing page is full-screen (no bottom nav). Keyed on
  // `view.kind` only — including the callback would re-run this on every render
  // of the parent and loop.
  useEffect(() => {
    onFullScreenChange?.(view.kind !== 'landing', () => setView({ kind: 'landing' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.kind]);

  const goLanding = () => setView({ kind: 'landing' });

  const selectProduct = (label: string, fromHome = false, vehicleType?: 'registered' | 'new') => {
    if (!MOTOR_PRODUCTS.includes(label)) {
      setView({ kind: 'healthguard', product: label });
    } else if (vehicleType) {
      setView({ kind: 'motor', product: label, vehicleType });
    } else {
      setPendingMotor({ product: label, fromHome });
    }
  };

  /** Back / backdrop on the vehicle-type sheet — undo the step that opened it. */
  const dismissMotor = () => {
    const cameFromHome = pendingMotor?.fromHome;
    setPendingMotor(null);
    if (cameFromHome) {
      onExitToHome?.();
    }
  };

  // Route a Quick Quotes tile tap. Motor products land on the landing page with
  // the vehicle-type sheet over it, so dismissing the sheet is never a dead end.
  useEffect(() => {
    if (!quoteRequest) {
      return;
    }
    if (quoteRequest.tab) {
      setLandingTab(quoteRequest.tab);
      setView({ kind: 'landing' });
    } else if (quoteRequest.product) {
      selectProduct(quoteRequest.product, true, quoteRequest.vehicleType);
    } else {
      setView({ kind: 'browse' });
    }
    onQuoteRequestHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteRequest]);

  return (
    <View style={styles.flex}>
      {/* Landing, browse and the quote/proposal wizards have no top header —
          the policy and renewal screens do, since they open from a list row. */}
      {view.kind === 'policy' || view.kind === 'renewal' ? (
        <View style={styles.header}>
          <Pressable onPress={goLanding} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
            <CaretLeft size={18} color={colors.textBody} weight="bold" />
          </Pressable>
          <Text style={styles.title}>
            {view.kind === 'renewal' && view.mode === 'view' ? 'Policy Details' : TITLES[view.kind]}
          </Text>
        </View>
      ) : null}

      {view.kind === 'landing' ? (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <WalkthroughTarget id="business-insights">
              <BusinessInsights />
            </WalkthroughTarget>
            <SharedQuotes
              initialTab={landingTab}
              onEditQuote={(q) => setView({ kind: 'healthguard', product: q.product })}
              onConvertToProposal={(q) => setView({ kind: 'convert', customer: q.customer })}
              onViewPolicy={(p) => setView({ kind: 'policy', policy: p })}
              onRenewPolicy={(r) => setView({ kind: 'renewal', renewal: r, mode: 'flow' })}
              onViewRenewal={(r) => setView({ kind: 'renewal', renewal: r, mode: 'view' })}
              onCreateQuote={() => setView({ kind: 'browse' })}
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
        <BrowseCategories onSelectProduct={selectProduct} />
      ) : view.kind === 'healthguard' ? (
        <HealthGuard
          productName={view.product}
          onClose={goLanding}
          onConvertToProposal={(customer) => setView({ kind: 'convert', customer })}
        />
      ) : view.kind === 'motor' ? (
        <TwoWheelerInsurance
          productName={view.product}
          initialVehicleType={view.vehicleType}
          onClose={goLanding}
          onConvertToProposal={(customer) => setView({ kind: 'convert', customer })}
        />
      ) : view.kind === 'convert' ? (
        <ConvertProposal customerName={view.customer} onClose={goLanding} />
      ) : view.kind === 'renewal' ? (
        <RenewPolicy
          record={view.renewal}
          mode={view.mode}
          onClose={goLanding}
          // "Renew Policy" in the read-only view hands over to the wizard; flip
          // the view's mode so the header retitles with it. RenewPolicy stays
          // mounted, so nothing the agent entered is lost.
          onRenewFlowStart={() => setView({ kind: 'renewal', renewal: view.renewal, mode: 'flow' })}
        />
      ) : (
        <IssuedPolicy policy={view.policy} onClose={goLanding} />
      )}

      {/* Vehicle-type chooser — opens over Browse Categories before the motor
          flow mounts, so the page behind stays the product list. */}
      <VehicleTypeModal
        isOpen={pendingMotor !== null}
        onClose={dismissMotor}
        onProceed={(type) => {
          if (pendingMotor) {
            setView({ kind: 'motor', product: pendingMotor.product, vehicleType: type });
          }
          setPendingMotor(null);
        }}
      />
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
