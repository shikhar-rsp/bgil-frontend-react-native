import type { IProfileRepository } from '../../domain/interfaces/profile_interfaces';
import type {
    EditableProfileData,
    ShareVirtualIdData,
    VirtualIdCardDraft,
} from '../../domain/entities/profile_entities';

export const createProfileUseCases = (repository: IProfileRepository) => ({
    getProfile: async () => {
        const result = await repository.getProfile();
        return { success: result.success, data: result.data };
    },

    updateProfile: async (data: EditableProfileData) => {
        const result = await repository.updateProfile(data);
        return { success: result.success, data: result.data };
    },

    getVirtualIdCard: async () => {
        const result = await repository.getVirtualIdCard();
        return { success: result.success, data: result.data };
    },

    createVirtualIdCard: async (data: VirtualIdCardDraft) => {
        const result = await repository.createVirtualIdCard(data);
        return { success: result.success, data: result.data };
    },

    updateVirtualIdCard: async (data: VirtualIdCardDraft) => {
        const result = await repository.updateVirtualIdCard(data);
        return { success: result.success, data: result.data };
    },

    getCustomers: async () => {
        const result = await repository.getCustomers();
        return { success: result.success, data: result.data ?? [] };
    },

    shareVirtualId: async (data: ShareVirtualIdData) => {
        const result = await repository.shareVirtualId(data);
        return { success: result.success };
    },
});
