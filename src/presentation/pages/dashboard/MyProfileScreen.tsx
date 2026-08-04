import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Clipboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeft } from 'phosphor-react-native';
import {
  Button,
  ToastGlobal,
  colors,
  spacing,
  radius,
  shadow,
  fontFamilyForWeight,
  type ToastGlobalVariant,
} from '@atlas-ds/react-native';
import { ProfileErrorBoundary } from '../../components/profile/ProfileErrorBoundary';
import { ProfileSummaryCard } from '../../components/profile/sections/ProfileSummaryCard';
import {
  ProfileDetailsSection,
  ProfileField,
} from '../../components/profile/sections/ProfileDetailsSection';
import { EditProfileSheet } from '../../components/profile/sections/EditProfileSheet';
import { VirtualIdSheet } from '../../components/profile/sections/VirtualIdSheet';
import { CreateVirtualIdSheet } from '../../components/profile/sections/CreateVirtualIdSheet';
import { ShareVirtualIdSheet } from '../../components/profile/sections/ShareVirtualIdSheet';
import { useProfileUseCases } from '../../hooks/useProfileUseCases';
import type {
  AgentProfile,
  Customer,
  EditableProfileData,
  ShareChannel,
  VirtualIdCard,
  VirtualIdCardDraft,
} from '../../../domain/entities/profile_entities';
import type { AuthScreenProps } from '../../../navigation';

type ToastState = { variant: ToastGlobalVariant; title: string; message?: string };

const TOAST_MS = 3000;

/**
 * "My Profile" screen (Module 10 — Profile & Settings).
 *
 * Hosts the profile summary, the read-only detail sections and the Edit Profile
 * / Virtual ID / Share Virtual ID flows. The web build runs each of those as a
 * modal; on native they are bottom sheets.
 */
export const MyProfileScreen: React.FC<AuthScreenProps<'MyProfile'>> = ({ navigation, route }) => {
  // Opened from the RM dashboard → this is the RM's profile (Manish Jain / RM),
  // not the agent's (Rajesh Chaurasia / IMD).
  const isRm = route.params?.perspective === 'rm';
  // The toast is absolutely positioned, so it sits outside the SafeAreaView's
  // padding and has to clear the status bar / notch itself.
  const insets = useSafeAreaInsets();
  const {
    getProfile,
    updateProfile,
    getVirtualIdCard,
    createVirtualIdCard,
    updateVirtualIdCard,
    getCustomers,
    shareVirtualId,
  } = useProfileUseCases();

  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [virtualIdCard, setVirtualIdCard] = useState<VirtualIdCard | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVirtualIdOpen, setIsVirtualIdOpen] = useState(false);
  const [isCreateVirtualIdOpen, setIsCreateVirtualIdOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Web pops a global `toast()`; there is no such host here, so the screen owns
  // the banner and its auto-dismiss.
  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const [profileResult, cardResult, customersResult] = await Promise.all([
        getProfile(),
        getVirtualIdCard(),
        getCustomers(),
      ]);

      if (!isActive) return;

      if (profileResult.success && profileResult.data) setProfile(profileResult.data);
      if (cardResult.success && cardResult.data) setVirtualIdCard(cardResult.data);
      if (customersResult.success) setCustomers(customersResult.data);
    };

    load();

    return () => {
      isActive = false;
    };
  }, [getProfile, getVirtualIdCard, getCustomers]);

  const handleUpdateProfile = useCallback(
    async (data: EditableProfileData) => {
      const result = await updateProfile(data);
      if (result.success && result.data) {
        setProfile(result.data);
        setIsEditOpen(false);
        showToast({
          variant: 'success',
          title: 'Profile Updated Successfully',
          message: 'Your profile changes have been saved successfully.',
        });
      }
    },
    [updateProfile, showToast]
  );

  /** ID Card button: create-first-time when no card exists, otherwise view it. */
  const handleOpenIdCard = useCallback(() => {
    if (virtualIdCard) {
      setIsVirtualIdOpen(true);
      return;
    }
    setIsCreateVirtualIdOpen(true);
  }, [virtualIdCard]);

  const handleCreateVirtualId = useCallback(
    async (draft: VirtualIdCardDraft) => {
      const result = await createVirtualIdCard(draft);
      if (result.success && result.data) {
        setVirtualIdCard(result.data);
        setIsCreateVirtualIdOpen(false);
        showToast({
          variant: 'success',
          title: 'Virtual ID Created Successfully',
          message: 'Your Virtual ID card is ready to share with customers.',
        });
      }
    },
    [createVirtualIdCard, showToast]
  );

  const handleUpdateVirtualId = useCallback(
    async (draft: VirtualIdCardDraft) => {
      const result = await updateVirtualIdCard(draft);
      if (result.success && result.data) {
        setVirtualIdCard(result.data);
        showToast({
          variant: 'success',
          title: 'Virtual ID Updated Successfully',
          message: 'Your Virtual ID card changes have been saved.',
        });
      }
    },
    [updateVirtualIdCard, showToast]
  );

  const handleCopyLink = useCallback(() => {
    if (!virtualIdCard) return;
    // RN core's Clipboard shim. Swap for `@react-native-clipboard/clipboard`
    // when that dependency lands — the core one is deprecated but still ships.
    Clipboard.setString(virtualIdCard.shareUrl);
    showToast({ variant: 'success', title: 'Link copied to clipboard' });
  }, [virtualIdCard, showToast]);

  const handleShare = useCallback(
    async (customerIds: string[], channels: ShareChannel[]) => {
      const result = await shareVirtualId({ customerIds, channels });
      if (!result.success) return;

      const names = customers
        .filter((customer) => customerIds.includes(customer.id))
        .map((customer) => customer.name);

      const recipients =
        names.length > 1
          ? `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
          : names[0] ?? '';

      setIsShareOpen(false);
      showToast({
        variant: 'success',
        title: 'Virtual ID Shared Successfully',
        message: `Your Virtual ID has been shared with ${recipients}.`,
      });
    },
    [customers, shareVirtualId, showToast]
  );

  // The RM's own profile reuses the agent record with the RM identity on top,
  // matching the web build.
  const summaryProfile =
    profile && isRm ? { ...profile, displayName: 'Manish Jain', roleTag: 'RM' } : profile;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Button
          iconOnly
          variant="tertiaryGray"
          size="md"
          label="Back"
          leadingIcon={<CaretLeft size={22} color={colors.textBody} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ProfileErrorBoundary onGoBack={() => navigation.goBack()}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {profile && summaryProfile ? (
            <>
              <ProfileSummaryCard
                profile={summaryProfile}
                onOpenIdCard={handleOpenIdCard}
                onEditProfile={() => setIsEditOpen(true)}
              />

              <View style={styles.detailsCard}>
                <ProfileDetailsSection title="Personal Information">
                  <ProfileField label="Full Name" value={profile.personal.fullName} />
                  <ProfileField label="Employee ID" value={profile.personal.employeeId} />
                  <ProfileField label="Date of Joining" value={profile.personal.dateOfJoining} />
                  <ProfileField label="Gender" value={profile.personal.gender} />
                  <ProfileField label="Date of Birth" value={profile.personal.dateOfBirth} />
                  <ProfileField label="Marital Status" value={profile.personal.maritalStatus} />
                </ProfileDetailsSection>

                <ProfileDetailsSection title="Contact Information">
                  <ProfileField label="Email ID" value={profile.contact.emailId} fullWidth />
                  <ProfileField label="Mobile Number" value={profile.contact.mobileNumber} />
                  <ProfileField label="Whatsapp Number" value={profile.contact.whatsappNumber} />
                </ProfileDetailsSection>

                <ProfileDetailsSection title="Address">
                  <ProfileField label="Pincode" value={profile.address.pincode} />
                  <ProfileField label="State" value={profile.address.state} />
                  <ProfileField label="City" value={profile.address.city} />
                  <ProfileField label="Address" value={profile.address.address} fullWidth />
                </ProfileDetailsSection>
              </View>
            </>
          ) : null}
        </ScrollView>
      </ProfileErrorBoundary>

      {profile ? (
        <EditProfileSheet
          isOpen={isEditOpen}
          profile={profile}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleUpdateProfile}
        />
      ) : null}

      {profile && virtualIdCard ? (
        <VirtualIdSheet
          isOpen={isVirtualIdOpen}
          profile={profile}
          card={virtualIdCard}
          onClose={() => setIsVirtualIdOpen(false)}
          onSave={handleUpdateVirtualId}
          onCopyLink={handleCopyLink}
          onShare={() => {
            setIsVirtualIdOpen(false);
            setIsShareOpen(true);
          }}
        />
      ) : null}

      <CreateVirtualIdSheet
        isOpen={isCreateVirtualIdOpen}
        onClose={() => setIsCreateVirtualIdOpen(false)}
        onCreate={handleCreateVirtualId}
      />

      <ShareVirtualIdSheet
        isOpen={isShareOpen}
        customers={customers}
        onClose={() => setIsShareOpen(false)}
        onShare={handleShare}
      />

      {toast ? (
        <View style={[styles.toast, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
          <ToastGlobal
            variant={toast.variant}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceSubtle },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, color: colors.textHeading },
  headerSpacer: { width: 40 },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  detailsCard: {
    gap: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    ...shadow.lg,
  },
  // `top` is applied inline from the safe-area inset.
  toast: { position: 'absolute', left: spacing.sm, right: spacing.sm, zIndex: 30 },
});
