import type {
    AgentProfile,
    Customer,
    EditableProfileData,
    ShareVirtualIdData,
    VirtualIdCard,
    VirtualIdCardDraft,
} from '../entities/profile_entities';

export interface IProfileRepository {
    getProfile(): Promise<{ success: boolean; data?: AgentProfile }>;
    updateProfile(data: EditableProfileData): Promise<{ success: boolean; data?: AgentProfile }>;
    /** Resolves `data: null` when the agent has not created a Virtual ID yet. */
    getVirtualIdCard(): Promise<{ success: boolean; data?: VirtualIdCard | null }>;
    createVirtualIdCard(data: VirtualIdCardDraft): Promise<{ success: boolean; data?: VirtualIdCard }>;
    updateVirtualIdCard(data: VirtualIdCardDraft): Promise<{ success: boolean; data?: VirtualIdCard }>;
    getCustomers(): Promise<{ success: boolean; data?: Customer[] }>;
    shareVirtualId(data: ShareVirtualIdData): Promise<{ success: boolean }>;
}
