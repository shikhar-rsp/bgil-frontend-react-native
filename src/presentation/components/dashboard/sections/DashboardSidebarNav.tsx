import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  House,
  Bank,
  User,
  ArrowsClockwise,
  HandCoins,
  PencilLine,
  Trophy,
  BookOpen,
  Briefcase,
  type IconProps,
} from 'phosphor-react-native';
import { colors, spacing, radius, typography } from '@atlas-ds/react-native';

type NavItem = {
  id: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'Home', label: 'Home', Icon: House },
  { id: 'Business', label: 'Business', Icon: Bank },
  { id: 'Customer', label: 'Customer', Icon: User, disabled: true },
  { id: 'renewals', label: 'Renewals', Icon: ArrowsClockwise, disabled: true },
  { id: 'claims', label: 'Claims', Icon: HandCoins, disabled: true },
  { id: 'endorsements', label: 'Endorsements', Icon: PencilLine, disabled: true },
  { id: 'campaign', label: 'Campaign', Icon: Trophy, disabled: true },
  { id: 'learn', label: 'Learn', Icon: BookOpen, disabled: true },
  { id: 'tools', label: 'Tools', Icon: Briefcase, disabled: true },
];

interface DashboardSidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: string;
  onSelectItem: (id: string) => void;
}

/** Slide-in navigation drawer (the web's left sidebar, as a mobile drawer). */
export const DashboardSidebarNav: React.FC<DashboardSidebarNavProps> = ({
  isOpen,
  onClose,
  selectedItem,
  onSelectItem,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={[styles.drawer, { paddingTop: insets.top + spacing.lg }]}>
          {NAV_ITEMS.map((item) => {
            const selected = selectedItem === item.id;
            const tint = item.disabled ? colors.textDisabled : selected ? colors.brand : colors.textBody;
            return (
              <Pressable
                key={item.id}
                disabled={item.disabled}
                onPress={() => {
                  onSelectItem(item.id);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: item.disabled }}
                style={[styles.item, selected && styles.itemSelected]}
              >
                <item.Icon size={24} color={tint} weight={selected ? 'fill' : 'regular'} />
                <Text style={[styles.label, { color: tint }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row' },
  drawer: {
    width: 240,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  itemSelected: { backgroundColor: colors.brandSubtle },
  label: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500' },
});
