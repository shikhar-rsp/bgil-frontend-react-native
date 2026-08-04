import type { ISettingsRepository } from '../../domain/interfaces/settings_interfaces';
import type {
    ChangePasswordPayload,
    NotificationPreference,
    NotificationPreferenceId,
    SettingsOverview,
} from '../../domain/entities/settings_entities';
import { SETTINGS_MESSAGES } from '../../domain/entities/settings_entities';

const MOCK_LATENCY_MS = 400;

const delay = <T>(data: T): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), MOCK_LATENCY_MS));

/**
 * Credentials the mock accepts. Any other current password reproduces the
 * "Password has been entered incorrectly." error state, and any OTP other than
 * MOCK_OTP reproduces "Incorrect OTP. Please enter again.".
 */
const MOCK_CURRENT_PASSWORD = 'Password123';
const MOCK_OTP = '123456';

let security = { lastChangedLabel: 'Last changed 3 months ago' };

let notifications: NotificationPreference[] = [
    {
        id: 'tasks',
        title: 'Tasks & Reminders',
        description: 'Stay informed about assigned tasks, upcoming reminders, meetings, and follow-ups.',
        enabled: true,
    },
    {
        id: 'quotes',
        title: 'Quotes & Policies',
        description:
            'Get updates on quotes, policy issuance, status changes, endorsements, and cancellations.',
        enabled: true,
    },
    {
        id: 'renewals',
        title: 'Renewals',
        description:
            'Receive alerts for upcoming, overdue, and completed policy renewals.Customers & Tickets',
        enabled: false,
    },
    {
        id: 'campaigns',
        title: 'Campaigns & Performance',
        description:
            'Keep track of campaign activities, sales targets, contests, commissions, and achievements.',
        enabled: false,
    },
];

export const settingsRepository: ISettingsRepository = {
    getSettings: async () => {
        const data: SettingsOverview = { security, notifications };
        return delay({ success: true, data });
    },

    updateNotificationPreference: async (id: NotificationPreferenceId, enabled: boolean) => {
        notifications = notifications.map((preference) =>
            preference.id === id ? { ...preference, enabled } : preference
        );
        return delay({ success: true, data: notifications });
    },

    verifyCurrentPassword: async (password: string) => {
        if (password !== MOCK_CURRENT_PASSWORD) {
            return delay({ success: false, message: SETTINGS_MESSAGES.incorrectCurrentPassword });
        }
        return delay({ success: true });
    },

    requestOtp: async () => {
        return delay({ success: true });
    },

    verifyOtp: async (otp: string) => {
        if (otp !== MOCK_OTP) {
            return delay({ success: false, message: SETTINGS_MESSAGES.incorrectOtp });
        }
        return delay({ success: true });
    },

    changePassword: async (payload: ChangePasswordPayload) => {
        if (payload.newPassword === MOCK_CURRENT_PASSWORD) {
            return delay({ success: false, message: SETTINGS_MESSAGES.sameAsCurrentPassword });
        }

        security = { lastChangedLabel: 'Last changed just now' };
        return delay({ success: true });
    },
};
