export type NotificationPreferenceId = 'tasks' | 'quotes' | 'renewals' | 'campaigns';

export type NotificationPreference = {
    id: NotificationPreferenceId;
    title: string;
    description: string;
    enabled: boolean;
};

export type SecuritySettings = {
    /** Pre-formatted by the backend in the design, e.g. "Last changed 3 months ago". */
    lastChangedLabel: string;
};

export type SettingsOverview = {
    security: SecuritySettings;
    notifications: NotificationPreference[];
};

/** Steps of the Change Password flow, in order. */
export type ChangePasswordStep = 'current-password' | 'verify-otp' | 'new-password';

export type ChangePasswordPayload = {
    currentPassword: string;
    otp: string;
    newPassword: string;
    logoutOtherDevices: boolean;
};

/**
 * Error copy taken verbatim from the Figma "Error States" section so the UI and the
 * mock backend cannot drift apart.
 */
export const SETTINGS_MESSAGES = {
    incorrectCurrentPassword: 'Password has been entered incorrectly.',
    incorrectOtp: 'Incorrect OTP. Please enter again.',
    passwordRule:
        'Must be at least 6 characters and include at least one number and one uppercase letter.',
    passwordsDoNotMatch: "Passwords don't match. Please enter again.",
    sameAsCurrentPassword:
        'Your new password cannot be the same as your current password. Please choose a different password.',
} as const;
