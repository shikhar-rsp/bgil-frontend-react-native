import type { IProfileRepository } from '../../domain/interfaces/profile_interfaces';
import type {
    AgentProfile,
    Customer,
    EditableProfileData,
    ShareVirtualIdData,
    VirtualIdCard,
    VirtualIdCardDraft,
} from '../../domain/entities/profile_entities';

const MOCK_LATENCY_MS = 400;

const delay = <T>(data: T): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), MOCK_LATENCY_MS));

let profile: AgentProfile = {
    id: 'BA786314',
    displayName: 'Rajesh Chaurasia',
    roleTag: 'IMD',
    avatarKey: 'rmProfile',
    isOnline: true,
    imdCode: 'BA786314',
    employeeId: '0353839A',
    branch: 'Koregaon Park, Pune',
    personal: {
        fullName: 'Rakesh Kumar',
        employeeId: 'BA786314',
        dateOfJoining: '15/11/2022',
        gender: 'Male',
        dateOfBirth: '12/04/1994',
        maritalStatus: 'Un-Married',
    },
    contact: {
        emailId: 'rajeshchaurasia@mail.com',
        mobileNumber: '+91 98220 14785',
        whatsappNumber: '+91 9822014787',
    },
    address: {
        pincode: '411001',
        state: 'Maharashtra',
        city: 'Pune',
        address: 'A-1102, Skyview Towers,\nEON Free Zone Road,',
    },
    insights: {
        customers: 248,
        policiesSold: 186,
        conversionRate: 68,
        renewalRate: 91,
    },
};

/**
 * Set this to `null` to exercise the first-time "Create Virtual ID" flow
 * (Figma: "I click on ID Card for the first time"). Seeded by default so the
 * view/edit/share sheets are reachable without creating a card first.
 */
let virtualIdCard: VirtualIdCard | null = {
    defaultLanguage: 'English',
    secondaryLanguage: 'Marathi',
    shortBio:
        "I'm a licensed insurance advisor with 8+ years of experience in life, health, and retirement insurance. I'm committed to helping clients choose the right coverage through trusted guidance and personalized service.",
    selectedServiceIds: ['health', 'motor'],
    shareUrl: 'https://bajajallianz.com/virtual-id/BA786314',
};

const CUSTOMERS: Customer[] = [
    { id: 'c1', name: 'Priti Sinha', customerId: '2452523626364' },
    { id: 'c2', name: 'Pranav Patel', customerId: '2452523626364' },
    { id: 'c3', name: 'Simran Jain', customerId: '2452523626364' },
    { id: 'c4', name: 'Rashi Kumar', customerId: '2452523626364' },
    { id: 'c5', name: 'Sameer Mishra', customerId: '2452523626364' },
    { id: 'c6', name: 'Vaishnavi', customerId: '2452523626364' },
];

export const profileRepository: IProfileRepository = {
    getProfile: async () => {
        return delay({ success: true, data: profile });
    },

    updateProfile: async (data: EditableProfileData) => {
        profile = {
            ...profile,
            displayName: data.fullName,
            personal: {
                ...profile.personal,
                fullName: data.fullName,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                maritalStatus: data.maritalStatus,
            },
            contact: {
                emailId: data.emailId,
                mobileNumber: data.mobileNumber,
                whatsappNumber: data.whatsappNumber,
            },
            address: {
                pincode: data.pincode,
                state: data.state,
                city: data.city,
                address: data.address,
            },
        };
        return delay({ success: true, data: profile });
    },

    getVirtualIdCard: async () => {
        return delay({ success: true, data: virtualIdCard });
    },

    createVirtualIdCard: async (data: VirtualIdCardDraft) => {
        virtualIdCard = {
            defaultLanguage: 'English',
            shareUrl: `https://bajajallianz.com/virtual-id/${profile.imdCode}`,
            ...data,
        };
        return delay({ success: true, data: virtualIdCard });
    },

    updateVirtualIdCard: async (data: VirtualIdCardDraft) => {
        if (!virtualIdCard) {
            return delay({ success: false });
        }
        virtualIdCard = { ...virtualIdCard, ...data };
        return delay({ success: true, data: virtualIdCard });
    },

    getCustomers: async () => {
        return delay({ success: true, data: CUSTOMERS });
    },

    shareVirtualId: async (_data: ShareVirtualIdData) => {
        return delay({ success: true });
    },
};
