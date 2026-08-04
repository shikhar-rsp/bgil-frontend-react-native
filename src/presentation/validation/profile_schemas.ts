import * as z from 'zod';

/** Matches the display format used across the profile screens, e.g. "12/04/1994". */
const dateStringSchema = z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/, 'Use the DD/MM/YYYY format');

/** Accepts the "+91 98220 14785" style shown in the design, spaces optional. */
const phoneSchema = z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^(\+91[\s-]?)?[\d\s-]{10,14}$/, 'Enter a valid mobile number');

export const editProfileSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    gender: z.string().min(1, 'Gender is required'),
    dateOfBirth: dateStringSchema,
    maritalStatus: z.string().min(1, 'Marital status is required'),
    emailId: z.string().min(1, 'Email ID is required').email('Please enter a valid email address'),
    mobileNumber: phoneSchema,
    whatsappNumber: phoneSchema,
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export const virtualIdCardSchema = z.object({
    secondaryLanguage: z.string().nullable(),
    shortBio: z.string().max(400, 'Short bio must be 400 characters or fewer'),
    selectedServiceIds: z.array(z.string()).min(1, 'Select at least one service'),
});

export type VirtualIdCardFormValues = z.infer<typeof virtualIdCardSchema>;
