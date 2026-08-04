import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Envelope, Phone } from 'phosphor-react-native';
import { colors, spacing, radius, shadow, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import type { AgentProfile, VirtualIdCard } from '../../../../domain/entities/profile_entities';
import { dashboardImages } from '../../dashboard/images';
import { PROFILE_BANNER_GRADIENT, TILE_GRADIENT, VIRTUAL_ID_SERVICES } from '../constants';

interface VirtualIdPreviewProps {
  profile: AgentProfile;
  card: VirtualIdCard;
}

const ContactRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.contactRow}>
    {icon}
    <View style={styles.contactText}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  </View>
);

/**
 * The agent's shareable Virtual ID card. Fixed at the design's 240px width so
 * it reads as the artefact the customer receives rather than as another panel
 * of the sheet.
 */
export const VirtualIdPreview: React.FC<VirtualIdPreviewProps> = ({ profile, card }) => {
  const services = VIRTUAL_ID_SERVICES.filter((service) =>
    card.selectedServiceIds.includes(service.id)
  );

  return (
    <View style={styles.card}>
      <View style={styles.logoBar}>
        <Image source={dashboardImages.logo} style={styles.logo} resizeMode="contain" />
      </View>

      <LinearGradient
        colors={PROFILE_BANNER_GRADIENT}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.banner}
      />

      <View style={styles.body}>
        <Image
          source={dashboardImages[profile.avatarKey]}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.name}>{profile.displayName}</Text>

        {card.shortBio ? <Text style={styles.bio}>{card.shortBio}</Text> : null}

        <View style={styles.contacts}>
          <ContactRow
            icon={<Envelope size={14} color={colors.brand} />}
            label="Email ID"
            value={profile.contact.emailId}
          />
          <ContactRow
            icon={<Phone size={14} color={colors.brand} />}
            label="Mobile Number"
            value={profile.contact.mobileNumber}
          />
        </View>

        {services.length > 0 ? (
          <View style={styles.services}>
            <Text style={styles.servicesHeading}>Your Insights</Text>
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <View key={service.id} style={styles.serviceTile}>
                  <LinearGradient colors={TILE_GRADIENT} style={StyleSheet.absoluteFill} />
                  <Image
                    source={dashboardImages[service.iconKey]}
                    style={styles.serviceIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.serviceLabel}>{service.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 240,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadow.lg,
  },
  logoBar: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  logo: { width: 72, height: 16 },
  banner: { height: 70 },
  body: { alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.lg, marginTop: -26 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    marginTop: spacing.sm,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  bio: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    fontSize: 9,
    lineHeight: 13,
    color: colors.textBody,
  },
  contacts: { marginTop: spacing.md, gap: spacing.sm, alignSelf: 'stretch' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  contactText: { flexShrink: 1, minWidth: 0 },
  contactLabel: { fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 14, color: colors.textBody },
  contactValue: { fontFamily: typography.fontFamily, fontSize: 11, lineHeight: 16, color: colors.textHeading },
  services: { marginTop: spacing.md, alignSelf: 'stretch' },
  servicesHeading: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 11,
    lineHeight: 16,
    color: colors.textHeading,
  },
  servicesGrid: { marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  // overflow:hidden keeps the gradient inside the rounded border.
  serviceTile: {
    width: '48%',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  serviceIcon: { width: 20, height: 20 },
  serviceLabel: { fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 12, color: colors.textBody },
});
