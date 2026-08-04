import type { VirtualIdLanguage, VirtualIdService } from '../../../domain/entities/profile_entities';

/**
 * Insurance services selectable for the Virtual ID card. `iconKey` indexes
 * `dashboardImages` — RN's `require` needs literal paths, so images can't be
 * referenced by URL the way the web build does.
 */
export const VIRTUAL_ID_SERVICES: VirtualIdService[] = [
    { id: 'health', label: 'Health Insurance', iconKey: 'health' },
    { id: 'motor', label: 'Motor Insurance', iconKey: 'motor' },
    { id: 'fire', label: 'Fire Insurance', iconKey: 'fire' },
    { id: 'property', label: 'Property Insurance', iconKey: 'property' },
];

/** Static explainer shown above the form in the Virtual ID sheets. */
export const VIRTUAL_ID_BENEFITS = [
    {
        title: 'Share Anywhere',
        description: 'Send your Virtual ID via WhatsApp, SMS, email, or social media.',
    },
    {
        title: 'Build Trust',
        description: 'Show customers your verified profile, credentials, and expertise.',
    },
    {
        title: 'Make It Easy to Connect',
        description: 'Let customers access your contact details and services with a single link.',
    },
    {
        title: 'Showcase Your Expertise',
        description: 'Highlight your experience, achievements, certifications, and areas of specialization.',
    },
];

/**
 * Languages offered for the Virtual ID card.
 * NOTE: the selector is presentational only — no translation layer is wired up yet,
 * pending Marathi/Hindi copy from the content team.
 */
export const VIRTUAL_ID_LANGUAGES: VirtualIdLanguage[] = ['English', 'Marathi', 'Hindi'];

/** Account default used when no Virtual ID card exists yet. */
export const DEFAULT_VIRTUAL_ID_LANGUAGE: VirtualIdLanguage = 'English';

export const VIRTUAL_ID_BIO_PLACEHOLDER =
    'Write a few sentences about yourself, highlighting your experience, achievements, certifications, and areas of expertise.';

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

/** Figma "Dropdown menu" (node 2231:13057) — the authoritative marital status list. */
export const MARITAL_STATUS_OPTIONS = [
    'Single',
    'Married',
    'Divorced',
    'Widowed',
    'Prefer not to say',
];

/**
 * Share targets. `iconKey` is empty for SMS, which the design draws as a blue
 * chat glyph rather than a brand logo.
 */
export const SHARE_CHANNELS = [
    { id: 'whatsapp' as const, label: 'WhatsApp', iconKey: 'whatsapp', border: '#A7F3D0', tint: '#ECFDF5' },
    { id: 'email' as const, label: 'Email', iconKey: 'mail', border: '#FED7AA', tint: '#FFF7ED' },
    { id: 'sms' as const, label: 'SMS', iconKey: '', border: '#BFDBFE', tint: '#EFF6FF' },
];

/**
 * Section-heading gradient shared by the profile detail sections and the Edit
 * Profile sheet (web: `bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE]`).
 */
export const SECTION_HEADING_GRADIENT = ['#EFF6FF', '#DBEAFE'];

/**
 * Card banner behind the avatar. The web build fakes Figma's image fill with a
 * radial highlight over #93C5FD; RN's LinearGradient gets the same read with a
 * light-to-blue diagonal sweep.
 */
export const PROFILE_BANNER_GRADIENT = ['#DBEAFE', '#93C5FD'];

/** Insight/service tile fill (web: `bg-gradient-to-b from-white to-[#EFF6FF]`). */
export const TILE_GRADIENT = ['#FFFFFF', '#EFF6FF'];
