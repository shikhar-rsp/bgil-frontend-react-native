import { useMemo } from 'react';
import { useLoader } from '../context/LoaderContext';
import { createProfileUseCases } from '../../application/useCases/profile_use_cases';
import { profileRepository } from '../../infrastructure/repository/profile_repository';
import type {
    EditableProfileData,
    ShareVirtualIdData,
    VirtualIdCardDraft,
} from '../../domain/entities/profile_entities';

/**
 * Presentation-layer hook that wires the profile use cases with the injected repository
 * and wraps every call with the global loader.
 * Keeps the application layer free of UI concerns (clean architecture).
 *
 * The returned object is memoised so it can safely sit in a `useEffect` dependency array.
 */
export const useProfileUseCases = () => {
    const { withLoader } = useLoader();

    return useMemo(() => {
        const profileUseCases = createProfileUseCases(profileRepository);

        return {
            getProfile: () => withLoader(() => profileUseCases.getProfile()),

            updateProfile: (data: EditableProfileData) =>
                withLoader(() => profileUseCases.updateProfile(data)),

            getVirtualIdCard: () => withLoader(() => profileUseCases.getVirtualIdCard()),

            createVirtualIdCard: (data: VirtualIdCardDraft) =>
                withLoader(() => profileUseCases.createVirtualIdCard(data)),

            updateVirtualIdCard: (data: VirtualIdCardDraft) =>
                withLoader(() => profileUseCases.updateVirtualIdCard(data)),

            getCustomers: () => withLoader(() => profileUseCases.getCustomers()),

            shareVirtualId: (data: ShareVirtualIdData) =>
                withLoader(() => profileUseCases.shareVirtualId(data)),
        };
    }, [withLoader]);
};
