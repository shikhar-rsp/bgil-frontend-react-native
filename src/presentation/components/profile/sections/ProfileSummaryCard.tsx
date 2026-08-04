import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IdentificationCard, PencilSimpleLine } from 'phosphor-react-native';
import {
  Avatar,
  Badge,
  Button,
  colors,
  spacing,
  radius,
  shadow,
  typography,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import type { AgentProfile } from '../../../../domain/entities/profile_entities';
import { dashboardImages } from '../../dashboard/images';
import { PROFILE_BANNER_GRADIENT } from '../constants';
import { ProfileInsights } from './ProfileInsights';

interface ProfileSummaryCardProps {
  profile: AgentProfile;
  onOpenIdCard: () => void;
  onEditProfile: () => void;
}

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

/** Identity card: banner, avatar, name + role badge, the two actions and the stat grid. */
export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profile,
  onOpenIdCard,
  onEditProfile,
}) => (
  <View style={styles.card}>
    <LinearGradient
      colors={PROFILE_BANNER_GRADIENT}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.banner}
    />

    <View style={styles.body}>
      {/* Pulled up over the banner, matching the web's -30px offset. */}
      <View style={styles.avatarWrap}>
        <Avatar
          size="xl"
          source={dashboardImages[profile.avatarKey]}
          name={profile.displayName}
          showStatus={profile.isOnline}
        />
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.name}>{profile.displayName}</Text>
        <Badge label={profile.roleTag} variant="light" color="brand" size="sm" />
      </View>

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label="ID Card"
            variant="secondaryGray"
            size="md"
            fullWidth
            leadingIcon={<IdentificationCard size={18} color={colors.textBody} />}
            onPress={onOpenIdCard}
          />
        </View>
        <View style={styles.action}>
          <Button
            label="Edit Profile"
            variant="secondaryGray"
            size="md"
            fullWidth
            leadingIcon={<PencilSimpleLine size={18} color={colors.textBody} />}
            onPress={onEditProfile}
          />
        </View>
      </View>

      <View style={styles.meta}>
        <MetaRow label="IMD Code" value={profile.imdCode} />
        <MetaRow label="Employee ID" value={profile.employeeId} />
        <MetaRow label="Branch" value={profile.branch} />
      </View>
    </View>

    <ProfileInsights insights={profile.insights} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.lg,
  },
  banner: { height: 120 },
  body: { gap: spacing.lg, paddingHorizontal: 20, paddingBottom: spacing.lg, marginTop: -30 },
  // White ring around the avatar so it reads as lifted off the banner.
  avatarWrap: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius.full,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  name: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 24,
    lineHeight: 28,
    color: colors.textHeading,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
  meta: { gap: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  metaLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  metaValue: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
    flexShrink: 1,
    textAlign: 'right',
  },
});
