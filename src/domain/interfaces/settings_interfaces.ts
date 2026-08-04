import type {
    ChangePasswordPayload,
    NotificationPreference,
    NotificationPreferenceId,
    SettingsOverview,
} from '../entities/settings_entities';

export interface ISettingsRepository {
    getSettings(): Promise<{ success: boolean; data?: SettingsOverview }>;

    updateNotificationPreference(
        id: NotificationPreferenceId,
        enabled: boolean
    ): Promise<{ success: boolean; data?: NotificationPreference[] }>;

    /** Step 1 of the change-password flow. */
    verifyCurrentPassword(password: string): Promise<{ success: boolean; message?: string }>;

    /** Issues (or re-issues) the OTP for step 2. */
    requestOtp(): Promise<{ success: boolean }>;

    /** Step 2 of the change-password flow. */
    verifyOtp(otp: string): Promise<{ success: boolean; message?: string }>;

    /** Step 3 — commits the new password. */
    changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message?: string }>;
}
