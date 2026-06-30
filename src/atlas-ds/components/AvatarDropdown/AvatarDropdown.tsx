import * as React from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Platform } from 'react-native';
import type { ViewStyle, StyleProp, ImageSourcePropType } from 'react-native';
import { CaretDown } from 'phosphor-react-native';
import { typography, inputFocusVisibleRing } from '../../theme';
import { Avatar, type AvatarSize } from '../Avatar';

// Active (open) focus ring — Figma "Shadow/xs focused 4px gray-100": a crisp
// 4px gray-100 (#F1F5F9) ring around the TRIGGER box only (never the menu list),
// plus a subtle drop shadow. It's rendered as a frame layer (an inset-(-4)
// rounded rect behind the opaque trigger) rather than a blurry shadow, so it
// reads as the same tight grey ring on web AND native. The blue ring
// (`inputFocusVisibleRing`) is the web-only "left-off" state after closing.
const FOCUS_RING = '#F1F5F9'; // gray-100

const COLOR = {
  border: '#E2E8F0',
  surface: '#FFFFFF',
  disabledBg: '#F8FAFC',
  name: '#1E293B',
  subtext: '#64748B',
  caret: '#64748B',
  itemText: '#1E293B',
  danger: '#EF4444',
  hover: '#F8FAFC',
} as const;

/* ============================ Item ============================ */

export interface AvatarDropdownItemProps {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export const AvatarDropdownItem: React.FC<AvatarDropdownItemProps> = ({
  icon,
  children,
  danger,
  disabled,
  onPress,
}) => (
  <Pressable
    accessibilityRole="menuitem"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.item,
      pressed && !disabled && styles.itemPressed,
      disabled && styles.itemDisabled,
    ]}
  >
    {icon ? <View style={styles.itemIcon}>{icon}</View> : null}
    <Text style={[styles.itemText, danger && styles.itemTextDanger]}>{children}</Text>
  </Pressable>
);

AvatarDropdownItem.displayName = 'AvatarDropdownItem';

/* ========================== Dropdown ========================== */

export interface AvatarDropdownProps {
  trigger?: React.ReactNode;
  disabled?: boolean;
  avatarUrl?: string;
  avatarSource?: ImageSourcePropType;
  avatarName?: string;
  avatarInitials?: string;
  avatarIcon?: React.ReactNode;
  avatarSize?: AvatarSize;
  avatarSubtext?: string;
  /** Menu items (typically `<AvatarDropdownItem>`s). */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * AvatarDropdown — a tappable avatar/label trigger that opens an anchored menu.
 * Interactive states mirror the Textfield: grey active ring while open, blue
 * "left-off" ring after closing (cleared by the next outside tap on web).
 */
export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  trigger,
  disabled,
  avatarUrl,
  avatarSource,
  avatarName,
  avatarInitials,
  avatarIcon,
  avatarSize = 'sm',
  avatarSubtext,
  children,
  style,
}) => {
  const [open, setOpen] = React.useState(false);
  const [leftOff, setLeftOff] = React.useState(false);
  const [anchor, setAnchor] = React.useState({ top: 0, left: 0, width: 0 });
  const ref = React.useRef<View>(null);

  const showActiveRing = open && !disabled;
  // The blue "left-off" ring is a web/desktop focus affordance cleared by the
  // next outside click. On touch platforms there's no outside-click to clear it,
  // so it would stick forever after closing — scope it to web only.
  const showLeftOffRing = Platform.OS === 'web' && leftOff && !open && !disabled;

  // After closing, the next outside tap clears the blue left-off ring (web).
  React.useEffect(() => {
    if (!leftOff || Platform.OS !== 'web') return;
    const doc = (globalThis as { document?: any }).document;
    if (!doc) return;
    const dismiss = () => setLeftOff(false);
    doc.addEventListener('mousedown', dismiss);
    return () => doc.removeEventListener('mousedown', dismiss);
  }, [leftOff]);

  const openMenu = () => {
    if (disabled) return;
    setLeftOff(false);
    ref.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 4, left: x, width });
      setOpen(true);
    });
  };

  const closeMenu = () => {
    setOpen(false);
    if (!disabled) setLeftOff(true);
  };

  return (
    <View ref={ref} collapsable={false} style={[styles.wrapper, style]}>
      {/* Grey focus ring — a 4px gray-100 frame behind the trigger box only.
          Scoped to the trigger; the menu list never receives it. */}
      {showActiveRing && <View pointerEvents="none" style={styles.activeRing} />}

      <View
        style={[
          styles.dropdown,
          showLeftOffRing && inputFocusVisibleRing,
          disabled && styles.dropdownDisabled,
        ]}
      >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        disabled={disabled}
        onPress={openMenu}
        style={styles.trigger}
      >
        {trigger ?? (
          <Avatar
            size={avatarSize}
            src={avatarUrl}
            source={avatarSource}
            name={avatarName}
            initials={avatarInitials}
            icon={avatarIcon}
            type={avatarIcon ? 'icon' : undefined}
          />
        )}
        {(avatarName || avatarSubtext) && !trigger ? (
          <View style={styles.info}>
            {avatarName ? (
              <Text style={[styles.name, disabled && styles.textDisabled]} numberOfLines={1}>
                {avatarName}
              </Text>
            ) : null}
            {avatarSubtext ? (
              <Text style={[styles.subtext, disabled && styles.textDisabled]} numberOfLines={1}>
                {avatarSubtext}
              </Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.iconSlot}>
          <CaretDown
            size={16}
            color={disabled ? '#CBD5E1' : COLOR.caret}
            weight="regular"
          />
        </View>
      </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <View
            style={[
              styles.menu,
              { position: 'absolute', top: anchor.top, left: anchor.left, minWidth: anchor.width },
            ]}
            accessibilityRole="menu"
          >
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child;
              const el = child as React.ReactElement<AvatarDropdownItemProps>;
              return React.cloneElement(el, {
                onPress: () => {
                  el.props.onPress?.();
                  closeMenu();
                },
              });
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

AvatarDropdown.displayName = 'AvatarDropdown';

const styles = StyleSheet.create({
  // Transparent shell that owns layout + measurement; the grey focus ring and
  // the trigger box are stacked inside it so the ring can sit *behind* the box.
  wrapper: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  // The grey focus ring: a gray-100 rounded frame inset by -4 behind the opaque
  // trigger box, so only the 4px protrusion shows = a crisp 4px ring (matches
  // Figma's "0 0 0 4px gray-100" + subtle drop shadow), on web and native alike.
  activeRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12, // 8 (box) + 4 (ring) so the corners stay concentric
    backgroundColor: FOCUS_RING,
    ...Platform.select({
      web: { boxShadow: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)' },
      default: {
        shadowColor: '#0A0D12',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  dropdown: {
    minWidth: 240,
    minHeight: 44,
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 8,
    backgroundColor: COLOR.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dropdownDisabled: { opacity: 0.6, backgroundColor: COLOR.disabledBg },
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, minWidth: 0 },
  name: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: COLOR.name },
  subtext: { fontFamily: typography.fontFamily, fontSize: 12, fontWeight: '400', color: COLOR.subtext },
  textDisabled: { color: '#94A3B8' },
  iconSlot: { marginLeft: 'auto', alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1 },
  menu: {
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  itemPressed: { backgroundColor: COLOR.hover },
  itemDisabled: { opacity: 0.5 },
  itemIcon: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontFamily: typography.fontFamily, fontSize: 14, color: COLOR.itemText },
  itemTextDanger: { color: COLOR.danger },
});
