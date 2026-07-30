import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { FadersHorizontal, FilePlus, ArrowsClockwise, HandCoins, NotePencil } from 'phosphor-react-native';
import {
  Button,
  Modal,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { dashboardImages } from '../images';
import { ActionMenu } from '../common/ActionMenu';
import { CustomizeModal, type CustomizeOption } from './CustomizeModal';

/**
 * `product` is the Browse Categories product a tile opens, so a tap lands
 * straight in that quote flow. Tiles whose product has no flow yet carry
 * `undefined` and fall back to the Create Quote product list.
 */
const QUICK_QUOTE_DATA: Record<
  string,
  { label: string; icon: keyof typeof dashboardImages; product?: string }
> = {
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
   */
  onNavigateToQuote?: (product?: string) => void;
  /** Opens the Business tab on the Renewals list. */
  onNavigateToRenewals?: () => void;
  /** Opens the Business tab on the Endorsements page. */
  onNavigateToEndorsements?: () => void;
}

const MENU_ICON = 18;

export const QuickQuotes: React.FC<QuickQuotesProps> = ({
  onNavigateToQuote,
  onNavigateToRenewals,
  onNavigateToEndorsements,
}) => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeQuotes, setActiveQuotes] = useState<string[]>(['health', 'fire', 'motor', 'property']);
  // Claims still opens a side drawer on web that has no RN equivalent yet — say
  // so rather than letting the menu item do nothing.
  const [unavailable, setUnavailable] = useState<string | null>(null);

  const visibleQuotes = activeQuotes.filter((val) => val && QUICK_QUOTE_DATA[val]);

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
              onPress={() => onNavigateToQuote?.(item.product)}
            >
              {/* Per-tile actions, matching the web tile's ⋮ menu. Always
                  visible here — there is no hover state to reveal it on. */}
              <View style={styles.tileMenu}>
                <ActionMenu
                  variant="boxed"
                  accessibilityLabel={`Actions for ${item.label}`}
                  items={[
                    {
                      key: 'quote',
                      label: 'Create Quote',
                      icon: <FilePlus size={MENU_ICON} color={colors.textBody} />,
                      onPress: () => onNavigateToQuote?.(item.product),
                    },
                    {
                      key: 'renewals',
                      label: 'Renewals',
                      icon: <ArrowsClockwise size={MENU_ICON} color={colors.textBody} />,
                      onPress: () => onNavigateToRenewals?.(),
                    },
                    {
                      key: 'claims',
                      label: 'Claims',
                      icon: <HandCoins size={MENU_ICON} color={colors.textBody} />,
                      onPress: () => setUnavailable('Claims'),
                    },
                    {
                      key: 'endorsement',
                      label: 'Endorsement',
                      icon: <NotePencil size={MENU_ICON} color={colors.textBody} />,
                      onPress: () => onNavigateToEndorsements?.(),
                    },
                  ]}
                />
              </View>

              <Image source={dashboardImages[item.icon]} style={styles.tileIcon} resizeMode="contain" />
              <Text style={styles.tileLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

      </View>

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
  // `relative` so the ⋮ can be pinned to the tile's top-right corner.
  tileMenu: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1 },
  tile: {
    position: 'relative',
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
});
