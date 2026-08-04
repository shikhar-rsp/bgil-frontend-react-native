import { useMemo } from 'react';
import { useLoader } from '../context/LoaderContext';
import { createSettingsUseCases } from '../../application/useCases/settings_use_cases';
import { settingsRepository } from '../../infrastructure/repository/settings_repository';
import type {
    ChangePasswordPayload,
    NotificationPreferenceId,
} from '../../domain/entities/settings_entities';

/**
 * Presentation-layer hook that wires the settings use cases with the injected
 * repository and wraps every call with the global loader.
 *
 * The returned object is memoised so it can safely sit in a `useEffect` dependency array.
 */
export const useSettingsUseCases = () => {
    const { withLoader } = useLoader();

    return useMemo(() => {
        const settingsUseCases = createSettingsUseCases(settingsRepository);

        return {
            getSettings: () => withLoader(() => settingsUseCases.getSettings()),

            // Deliberately not wrapped in the global loader: toggles update optimistically
            // and a full-screen spinner on every flip would feel broken.
            updateNotificationPreference: (id: NotificationPreferenceId, enabled: boolean) =>
                settingsUseCases.updateNotificationPreference(id, enabled),

            verifyCurrentPassword: (password: string) =>
                withLoader(() => settingsUseCases.verifyCurrentPassword(password)),

            requestOtp: () => withLoader(() => settingsUseCases.requestOtp()),

            verifyOtp: (otp: string) => withLoader(() => settingsUseCases.verifyOtp(otp)),

            changePassword: (payload: ChangePasswordPayload) =>
                withLoader(() => settingsUseCases.changePassword(payload)),
        };
    }, [withLoader]);
};
