import * as z from 'zod';
import { SETTINGS_MESSAGES } from '../../domain/entities/settings_entities';

/**
 * Password policy for Settings → Change Password, taken from the Figma error state:
 * "Must be at least 6 characters and include at least one number and one uppercase letter."
 *
 * NOTE: this is deliberately looser than `passwordSchema` in auth_schemas.ts, which
 * requires 8 characters plus a lowercase letter. The two flows currently disagree —
 * carried over from the web build rather than silently reconciled here.
 */
export const newPasswordSchema = z
    .string()
    .min(6, SETTINGS_MESSAGES.passwordRule)
    .regex(/[0-9]/, SETTINGS_MESSAGES.passwordRule)
    .regex(/[A-Z]/, SETTINGS_MESSAGES.passwordRule);

export const currentPasswordSchema = z.object({
    currentPassword: z.string().min(1, SETTINGS_MESSAGES.incorrectCurrentPassword),
});

export const newPasswordFormSchema = z
    .object({
        newPassword: newPasswordSchema,
        confirmPassword: z.string().min(1, SETTINGS_MESSAGES.passwordsDoNotMatch),
        logoutOtherDevices: z.boolean(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: SETTINGS_MESSAGES.passwordsDoNotMatch,
        path: ['confirmPassword'],
    });

export type NewPasswordFormValues = z.infer<typeof newPasswordFormSchema>;
