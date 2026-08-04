import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeft, Key } from 'phosphor-react-native';
import {
  Button,
  ToastGlobal,
  colors,
  spacing,
  radius,
  typography,
  fontFamilyForWeight,
  type ToastGlobalVariant,
} from '@atlas-ds/react-native';
import { ProfileErrorBoundary } from '../../components/profile/ProfileErrorBoundary';
import { SectionHeading } from '../../components/profile/sections/ProfileDetailsSection';
import { NotificationPreferences } from '../../components/settings/sections/NotificationPreferences';
import { ChangePasswordSheet } from '../../components/settings/sections/ChangePasswordSheet';
import { useSettingsUseCases } from '../../hooks/useSettingsUseCases';
import type {
  ChangePasswordPayload,
  NotificationPreferenceId,
  SettingsOverview,
} from '../../../domain/entities/settings_entities';
import type { AuthScreenProps } from '../../../navigation';

type ToastState = { variant: ToastGlobalVariant; title: string; message?: string };

const TOAST_MS = 3000;

/**
 * "Settings" screen (Module 10) — password management and notification
 * preferences. The web build runs Change Password as a modal; on native it is a
 * bottom sheet.
 */
export const SettingsScreen: React.FC<AuthScreenProps<'Settings'>> = ({ navigation }) => {
  // The toast is absolutely positioned, so it sits outside the SafeAreaView's
  // padding and has to clear the status bar / notch itself.
  const insets = useSafeAreaInsets();
  const {
    getSettings,
    updateNotificationPreference,
    verifyCurrentPassword,
    requestOtp,
    verifyOtp,
    changePassword,
  } = useSettingsUseCases();

  const [settings, setSettings] = useState<SettingsOverview | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

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
      const result = await getSettings();
      if (!isActive) return;
      if (result.success && result.data) setSettings(result.data);
    };

    load();

    return () => {
      isActive = false;
    };
  }, [getSettings]);

  const handleToggle = useCallback(
    async (id: NotificationPreferenceId, enabled: boolean) => {
      // Optimistic: the switch must respond instantly, so roll back only on failure.
      setSettings((current) =>
        current
          ? {
              ...current,
              notifications: current.notifications.map((preference) =>
                preference.id === id ? { ...preference, enabled } : preference
              ),
            }
          : current
      );

      const result = await updateNotificationPreference(id, enabled);

      if (!result.success) {
        setSettings((current) =>
          current
            ? {
                ...current,
                notifications: current.notifications.map((preference) =>
                  preference.id === id ? { ...preference, enabled: !enabled } : preference
                ),
              }
            : current
        );
        showToast({
          variant: 'error',
          title: 'Could not update preference',
          message: 'Please try again in a moment.',
        });
      }
    },
    [updateNotificationPreference, showToast]
  );

  const handleChangePassword = useCallback(
    async (payload: ChangePasswordPayload) => {
      const result = await changePassword(payload);

      if (result.success) {
        setIsChangePasswordOpen(false);
        const refreshed = await getSettings();
        if (refreshed.success && refreshed.data) setSettings(refreshed.data);

        showToast({
          variant: 'success',
          title: 'Password Changed Successfully',
          message:
            'Your password has been updated successfully. Use your new password the next time you sign in.',
        });
      }

      return result;
    },
    [changePassword, getSettings, showToast]
  );

  const handleForgotPassword = useCallback(() => {
    setIsChangePasswordOpen(false);
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  // Normally this pops back to the profile menu, but the screen can also be the
  // only route on the stack (deep link, or the dev jumper's stack reset) — then
  // there is nothing to pop, so fall back to the dashboard as the web does.
  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Dashboard');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Button
          iconOnly
          variant="tertiaryGray"
          size="md"
          label="Back"
          leadingIcon={<CaretLeft size={22} color={colors.textBody} />}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ProfileErrorBoundary onGoBack={handleBack}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {settings ? (
            <View style={styles.panel}>
              <View style={styles.section}>
                <SectionHeading title="Password" />

                <View style={styles.passwordRow}>
                  <View style={styles.passwordText}>
                    <Text style={styles.passwordLabel}>Password Changed</Text>
                    <Text style={styles.passwordValue}>{settings.security.lastChangedLabel}</Text>
                  </View>

                  <Button
                    label="Change Password"
                    variant="secondaryGray"
                    size="sm"
                    leadingIcon={<Key size={16} color={colors.textBody} />}
                    onPress={() => setIsChangePasswordOpen(true)}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <SectionHeading title="Notifications" />
                <NotificationPreferences
                  preferences={settings.notifications}
                  onToggle={handleToggle}
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </ProfileErrorBoundary>

      <ChangePasswordSheet
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onVerifyCurrentPassword={verifyCurrentPassword}
        onVerifyOtp={verifyOtp}
        onResendOtp={requestOtp}
        onSubmit={handleChangePassword}
        onForgotPassword={handleForgotPassword}
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
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  // No padding of its own — the screen gutter already insets the content, and
  // the sections below carry their own borders. The card chrome would only be
  // visible in the gaps between them, so it is dropped too.
  panel: { gap: spacing.lg },
  section: { gap: spacing.md },
  // Stacked rather than side-by-side: "Change Password" plus the label leaves no
  // room on a phone width.
  passwordRow: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  passwordText: { gap: spacing.xs },
  passwordLabel: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  passwordValue: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  toast: { position: 'absolute', left: spacing.sm, right: spacing.sm, zIndex: 30 },
});
