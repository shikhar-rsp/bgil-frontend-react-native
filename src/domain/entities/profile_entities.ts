export type PersonalInformation = {
    fullName: string;
    employeeId: string;
    dateOfJoining: string;
    gender: string;
    dateOfBirth: string;
    maritalStatus: string;
};

export type ContactInformation = {
    emailId: string;
    mobileNumber: string;
    whatsappNumber: string;
};

export type AddressInformation = {
    pincode: string;
    state: string;
    city: string;
    address: string;
};

export type ProfileInsights = {
    customers: number;
    policiesSold: number;
    conversionRate: number;
    renewalRate: number;
};

export type AgentProfile = {
    id: string;
    displayName: string;
    /** Badge rendered next to the name on the summary card, e.g. "IMD". */
    roleTag: string;
    /**
     * Key into `dashboardImages` rather than the web's `/rm-profile.png` URL —
     * RN's `require` needs literal paths, so images are registered statically.
     */
    avatarKey: string;
    isOnline: boolean;
    imdCode: string;
    employeeId: string;
    branch: string;
    personal: PersonalInformation;
    contact: ContactInformation;
    address: AddressInformation;
    insights: ProfileInsights;
};

/** The subset of the profile the agent is allowed to edit (see the Edit Profile sheet). */
export type EditableProfileData = {
    fullName: string;
    gender: string;
    dateOfBirth: string;
    maritalStatus: string;
    emailId: string;
    mobileNumber: string;
    whatsappNumber: string;
    pincode: string;
    state: string;
    city: string;
    address: string;
};

/* ========================================================
   VIRTUAL ID CARD
======================================================== */

export type VirtualIdLanguage = 'English' | 'Marathi' | 'Hindi';

export type VirtualIdService = {
    id: string;
    label: string;
    /** Key into `dashboardImages` (see `avatarKey`). */
    iconKey: string;
};

export type VirtualIdCard = {
    /** Locked to the account default in the design; rendered as a disabled select. */
    defaultLanguage: VirtualIdLanguage;
    secondaryLanguage: VirtualIdLanguage | null;
    shortBio: string;
    selectedServiceIds: string[];
    shareUrl: string;
};

/** Payload produced by the "Edit ID Card" form. */
export type VirtualIdCardDraft = {
    secondaryLanguage: VirtualIdLanguage | null;
    shortBio: string;
    selectedServiceIds: string[];
};

/* ========================================================
   SHARING
======================================================== */

export type ShareChannel = 'whatsapp' | 'email' | 'sms';

export type Customer = {
    id: string;
    name: string;
    customerId: string;
};

export type ShareVirtualIdData = {
    customerIds: string[];
    channels: ShareChannel[];
};
