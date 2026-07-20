import React from 'react';
import { View, Text, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, GearSix, MonitorPlay, Headset, Phone, UserCircle } from 'phosphor-react-native';
import {
  AvatarLabel,
  AvatarDropdownItem,
  Button,
  colors,
  spacing,
  typography,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  /** Opens the guided walkthrough. */
  onProductTour?: () => void;
  userName?: string;
  userId?: string;
  userInitials?: string;
}

type MenuRow = { key: string; label: string; icon: React.ReactNode };

/**
 * Full-screen profile menu opened from the header avatar. Shows the user,
 * quick actions, the assigned relationship manager, and logout.
 */
export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  visible,
  onClose,
  onLogout,
  onProductTour,
  userName = 'Rajesh Chaurasia',
  userId = 'BA78631498',
  userInitials = 'RC',
}) => {
  const rows: MenuRow[] = [
    { key: 'profile', label: 'View Profile', icon: <UserCircle size={20} color={colors.textBody} /> },
    { key: 'settings', label: 'Settings', icon: <GearSix size={20} color={colors.textBody} /> },
    { key: 'tour', label: 'Product Tour', icon: <MonitorPlay size={20} color={colors.textBody} /> },
    { key: 'support', label: 'Support', icon: <Headset size={20} color={colors.textBody} /> },
  ];

  const onRowPress = (key: string) => {
    if (key === 'tour') {
      onClose();
      onProductTour?.();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            iconOnly
            variant="tertiaryGray"
            size="md"
            label="Back"
            leadingIcon={<CaretLeft size={22} color={colors.textBody} />}
            onPress={onClose}
          />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Current user */}
          <AvatarLabel
            size="lg"
            initials={userInitials}
            text={userName}
            subtext={userId}
            showStatus
            statusColor={colors.success}
          />

          <View style={styles.divider} />

          {/* Quick actions */}
          <View style={styles.rowList}>
            {rows.map((row) => (
              <AvatarDropdownItem key={row.key} icon={row.icon} onPress={() => onRowPress(row.key)}>
                {row.label}
              </AvatarDropdownItem>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Relationship manager */}
          <Text style={styles.sectionLabel}>Your Relation Manager</Text>
          <AvatarLabel size="lg" initials="MJ" text="Manish Jain" subtext="RM ID: RM982732B63" />
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          <Button
            label="Call Relationship Manager"
            variant="secondaryGray"
            fullWidth
            leadingIcon={<Phone size={18} color={colors.textBody} />}
            onPress={() => undefined}
          />
          <Button label="Log out" variant="secondaryDestructive" fullWidth onPress={onLogout} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 18,
    color: colors.textHeading,
  },
  headerSpacer: { width: 40 },
  body: { padding: spacing.lg, gap: spacing.md },
  // Negative margin cancels the body's horizontal padding so the rule spans
  // the full screen width.
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: -spacing.lg },
  // Self-contained frame: Space-05 (16px) padding on all sides + 16px between
  // items. The negative horizontal margin cancels the body padding so the frame
  // is full-width while its content still aligns at 16px with the avatar rows.
  rowList: { marginHorizontal: -spacing.lg, padding: spacing.lg, gap: spacing.lg },
  sectionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
});
