import type { ISettingsRepository } from '../../domain/interfaces/settings_interfaces';
import type {
    ChangePasswordPayload,
    NotificationPreferenceId,
} from '../../domain/entities/settings_entities';

/**
 * Factory that creates settings use cases with the given repository.
 * Follows Dependency Inversion: depends on ISettingsRepository, not a concrete class.
 * Pure application logic — no UI concerns, no route strings, no framework imports.
 */
export const createSettingsUseCases = (repository: ISettingsRepository) => ({
    getSettings: async () => {
        const result = await repository.getSettings();
        return { success: result.success, data: result.data };
    },

    updateNotificationPreference: async (id: NotificationPreferenceId, enabled: boolean) => {
        const result = await repository.updateNotificationPreference(id, enabled);
        return { success: result.success, data: result.data };
    },

    verifyCurrentPassword: async (password: string) => {
        const result = await repository.verifyCurrentPassword(password);
        return { success: result.success, message: result.message };
    },

    requestOtp: async () => {
        const result = await repository.requestOtp();
        return { success: result.success };
    },

    verifyOtp: async (otp: string) => {
        const result = await repository.verifyOtp(otp);
        return { success: result.success, message: result.message };
    },

    changePassword: async (payload: ChangePasswordPayload) => {
        const result = await repository.changePassword(payload);
        return { success: result.success, message: result.message };
    },
});
