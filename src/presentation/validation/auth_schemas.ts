import * as z from 'zod';

export const passwordSchema = z
    .string()
    .min(8, 'Minimum 8 Characters')
    .regex(/[a-z]/, 'At least one lowercase letter')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number');

export const imdSchema = z.object({
    imdCode: z.string().min(1, 'IMD code is required').email('Incorrect IMD code.'),
    password: z.string().min(1, 'Password is required'),
});

export const mobileSchema = z.object({
    mobileNumber: z.string().min(1, 'Mobile number is required').regex(/^\d{10}$/, 'Mobile Number must be exactly 10 digits'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password do not match',
        path: ['confirmPassword'],
    });

export const userDetailsRequestSchema = z.object({
    agentCode: z.string().min(1).optional(),
    mobNo: z.string().optional(),
    email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    agentType: z.string().min(1, 'Agent Type is required'),
});
