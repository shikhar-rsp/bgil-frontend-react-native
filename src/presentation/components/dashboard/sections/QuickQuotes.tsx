import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import {
  FadersHorizontal,
  FilePlus,
  ArrowsClockwise,
  HandCoins,
  CaretRight,
  type IconProps,
} from 'phosphor-react-native';
import {
  BottomSheet,
  Button,
  Modal,
  accent,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
  type AccentColor,
} from '@atlas-ds/react-native';
import { dashboardImages } from '../images';
import { CustomizeModal, type CustomizeOption } from './CustomizeModal';
import { MOTOR_PRODUCTS } from '../business/motor/motorData';
import {
  VehicleTypeOptions,
  VEHICLE_TYPE_TITLE,
  VEHICLE_TYPE_SUBTITLE,
  type VehicleType,
} from '../business/motor/VehicleTypeOptions';

type QuickQuoteTile = { label: string; icon: keyof typeof dashboardImages; product?: string };

/**
 * `product` is the Browse Categories product a tile's Create Quote action
 * opens. Tiles whose product has no flow yet carry `undefined` and fall back
 * to the Create Quote product list.
 */
const QUICK_QUOTE_DATA: Record<string, QuickQuoteTile> = {
  health: { label: 'Health Insurance', icon: 'health', product: 'Health Guard' },
  fire: { label: 'Fire Insurance', icon: 'fire' },
  motor: { label: 'Motor Insurance', icon: 'motor', product: 'Private Car' },
  property: { label: 'Property Insurance', icon: 'property' },
  twmotorinsurance: { label: '2W Motor Insurance', icon: 'motor', product: 'Two Wheeler' },
  fourwheelerinsurance: { label: '4W Insurance', icon: 'motor', product: 'Private Car' },
};

const QUICK_QUOTE_OPTIONS: CustomizeOption[] = Object.entries(QUICK_QUOTE_DATA).map(
  ([value, info]) => ({ value, label: info.label }),
);

interface QuickQuotesProps {
  /**
   * Opens the Business tab on a quote. `product` is a Browse Categories
   * product label, or undefined to land on the product list instead.
   * `vehicleType` is supplied for motor products, which ask for it in-sheet so
   * the Business tab doesn't have to open a second sheet on arrival.
   */
  onNavigateToQuote?: (product?: string, vehicleType?: VehicleType) => void;
  /** Opens the Business tab on the Renewals list. */
  onNavigateToRenewals?: () => void;
}

type ActionKey = 'quote' | 'renewals' | 'claims';

/** The actions a tile offers. Tapping the tile opens these in a bottom sheet. */
const TILE_ACTIONS: {
  key: ActionKey;
  label: string;
  Icon: React.ComponentType<IconProps>;
  color: AccentColor;
}[] = [
  { key: 'quote', label: 'Create Quote', Icon: FilePlus, color: 'brand' },
  { key: 'renewals', label: 'Renewals', Icon: ArrowsClockwise, color: 'emerald' },
  { key: 'claims', label: 'Claims', Icon: HandCoins, color: 'orange' },
];

const ACTION_ICON = 20;

export const QuickQuotes: React.FC<QuickQuotesProps> = ({
  onNavigateToQuote,
  onNavigateToRenewals,
}) => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeQuotes, setActiveQuotes] = useState<string[]>(['health', 'fire', 'motor', 'property']);
  // Claims still opens a side drawer on web that has no RN equivalent yet — say
  // so rather than letting the action do nothing.
  const [unavailable, setUnavailable] = useState<string | null>(null);
  // Which tile's actions the sheet is showing. `actionsTile` is deliberately
  // never cleared: the sheet's header would blank out mid slide-out if it were.
  const [actionsTile, setActionsTile] = useState<QuickQuoteTile | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  // Step within the sheet: 0 = the tile's actions, 1 = vehicle type. Choosing a
  // vehicle type is a sub-step of Create Quote, so it glides in over the
  // actions rather than arriving as a second sheet.
  const [sheetStep, setSheetStep] = useState(0);

  const visibleQuotes = activeQuotes.filter((val) => val && QUICK_QUOTE_DATA[val]);

  const openActions = (tile: QuickQuoteTile) => {
    setActionsTile(tile);
    setSheetStep(0);
    setActionsOpen(true);
  };

  const closeActions = () => {
    setActionsOpen(false);
    // Reset once the sheet is gone, so re-opening never flashes step 2.
    setTimeout(() => setSheetStep(0), 250);
  };

  const runAction = (key: ActionKey) => {
    const product = actionsTile?.product;
    if (key === 'quote') {
      // Motor needs a vehicle type before the flow can mount — ask here.
      if (product && MOTOR_PRODUCTS.includes(product)) {
        setSheetStep(1);
        return;
      }
      closeActions();
      onNavigateToQuote?.(product);
    } else if (key === 'renewals') {
      closeActions();
      onNavigateToRenewals?.();
    } else {
      closeActions();
      setUnavailable('Claims');
    }
  };

  const chooseVehicleType = (type: VehicleType) => {
    const product = actionsTile?.product;
    closeActions();
    onNavigateToQuote?.(product, type);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Quick Quotes</Text>
          <Text style={styles.subtitle}>Set up your quick quotes here or create a new quote.</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Customise"
          variant="secondaryGray"
          size="sm"
          leadingIcon={<FadersHorizontal size={16} color={colors.textBody} />}
          onPress={() => setIsCustomizeOpen(true)}
          style={styles.actionBtn}
        />
        <Button label="View All Quotes" variant="secondary" size="sm" style={styles.actionBtn} />
      </View>

      <View style={styles.grid}>
        {visibleQuotes.map((value) => {
          const item = QUICK_QUOTE_DATA[value];
          return (
            <Pressable
              key={value}
              style={styles.tile}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} actions`}
              // The tile no longer jumps straight into the quote flow — it
              // opens the same actions the web tile's ⋮ menu held, in a sheet.
              onPress={() => openActions(item)}
            >
              <Image source={dashboardImages[item.icon]} style={styles.tileIcon} resizeMode="contain" />
              <Text style={styles.tileLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

      </View>

      <BottomSheet
        visible={actionsOpen}
        onClose={closeActions}
        // Back pops to the actions from the vehicle-type step, and leaves the
        // sheet from the actions themselves.
        onBack={() => (sheetStep > 0 ? setSheetStep(0) : closeActions())}
        backAccessibilityLabel={sheetStep > 0 ? 'Back to actions' : 'Close'}
        pageIndex={sheetStep}
        pages={[
          {
            key: 'actions',
            title: actionsTile?.label ?? 'Quick Quote',
            subtitle: 'Choose an action to continue.',
            contentMinHeight: 0,
            content: (
              <View style={styles.sheetActions}>
                {TILE_ACTIONS.map((action) => (
                  <Pressable
                    key={action.key}
                    style={styles.sheetAction}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={() => runAction(action.key)}
                  >
                    <View style={[styles.sheetActionIcon, { backgroundColor: accent[action.color].lightBg }]}>
                      <action.Icon size={ACTION_ICON} color={accent[action.color].solidBg} />
                    </View>
                    <Text style={styles.sheetActionLabel}>{action.label}</Text>
                    <CaretRight size={16} color={colors.textMuted} weight="bold" />
                  </Pressable>
                ))}
              </View>
            ),
          },
          {
            key: 'vehicle-type',
            title: VEHICLE_TYPE_TITLE,
            subtitle: VEHICLE_TYPE_SUBTITLE,
            contentMinHeight: 0,
            content: <VehicleTypeOptions onSelect={chooseVehicleType} />,
          },
        ]}
      />

      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        initialSelections={activeQuotes}
        onUpdate={setActiveQuotes}
        title="Customise Quick Quotes"
        description="Select the quotes you want to see on your dashboard"
        options={QUICK_QUOTE_OPTIONS}
        maxSelections={4}
      />

      <Modal
        visible={unavailable !== null}
        onClose={() => setUnavailable(null)}
        title={`${unavailable} coming soon`}
        subtitle={`The ${unavailable?.toLowerCase()} journey hasn’t been built for mobile yet.`}
        primaryAction={{ label: 'Got it', onPress: () => setUnavailable(null) }}
      />
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerText: { flex: 1, gap: spacing.xs },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  actions: { flexDirection: 'row', gap: spacing.sm },
  // flexBasis 'auto' (not flex:1's 0) sizes each button to its label first and
  // shares the leftover width, so "View All Quotes" isn't squeezed into half the
  // row and truncated. The row still fills the card.
  actionBtn: { flexGrow: 1, flexBasis: 'auto' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  tileIcon: { width: 60, height: 60 },
  tileLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  // Action rows in the tile's bottom sheet — same bordered row treatment as
  // the motor flow's Select Vehicle Type sheet.
  sheetActions: { gap: spacing.md },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  sheetActionIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  sheetActionLabel: {
    flex: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 15,
    fontWeight: '500',
    color: colors.textHeading,
  },
});
