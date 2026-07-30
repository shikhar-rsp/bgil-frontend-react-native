import React, { useRef, useState } from 'react';
import { View, Modal, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { DotsThreeVertical } from 'phosphor-react-native';
import { AvatarDropdownItem, colors, radius, spacing, shadow } from '@atlas-ds/react-native';

export interface RowAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onPress: () => void;
}

interface RowActionMenuProps {
  items: RowAction[];
  accessibilityLabel?: string;
}

/** Menu card width — wide enough for "Convert to Proposal" on one line. */
const MENU_WIDTH = 232;
const GAP = 4;
const EDGE = spacing.sm;

/**
 * The ⋮ row-actions button and its anchored menu.
 *
 * Opens a small card next to the button that was tapped, rather than the
 * full-width `MoreMenu` grid docked at the bottom of the screen — with long
 * lists that grid meant scrolling to the end to reach the actions for a row
 * near the top.
 *
 * Anchoring follows `AvatarDropdown`: measure the trigger in window
 * coordinates, then position a `Modal`-hosted card from those coordinates so it
 * escapes the scroll container. Rows reuse `AvatarDropdownItem` so the icon +
 * label treatment matches the profile menu.
 */
export const RowActionMenu: React.FC<RowActionMenuProps> = ({ items, accessibilityLabel = 'Row actions' }) => {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<View>(null);
  const { width: screenW, height: screenH } = useWindowDimensions();

  // Rough card height, used only to decide whether to flip above the trigger.
  const menuHeight = items.length * 44 + spacing.sm * 2;

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      // Right-align to the trigger, then clamp inside the screen.
      const left = Math.min(Math.max(EDGE, x + width - MENU_WIDTH), screenW - MENU_WIDTH - EDGE);
      const below = y + height + GAP;
      const flip = below + menuHeight > screenH - EDGE;
      setAnchor({ top: flip ? Math.max(EDGE, y - menuHeight - GAP) : below, left });
      setOpen(true);
    });
  };

  return (
    <View ref={triggerRef} collapsable={false}>
      <Pressable onPress={openMenu} hitSlop={8} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        <DotsThreeVertical size={20} color={colors.textBody} weight="bold" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Dismiss menu">
          <View style={[styles.menu, { top: anchor.top, left: anchor.left }]} accessibilityRole="menu">
            {items.map((item) => (
              <AvatarDropdownItem
                key={item.key}
                icon={item.icon}
                danger={item.danger}
                onPress={() => {
                  setOpen(false);
                  item.onPress();
                }}
              >
                {item.label}
              </AvatarDropdownItem>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    ...shadow.lg,
  },
});
