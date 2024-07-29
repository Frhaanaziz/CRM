import { z } from 'zod';

export const signUpSchema = z.object({
    first_name: z.string().trim().min(1, { message: 'First name is required' }),
    last_name: z.string().optional().nullable(),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().trim().min(6, { message: 'Password must be at least 6 characters' }),
});

export const signInSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().trim().min(6, { message: 'Password must be at least 6 characters' }),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().trim().min(6, { message: 'Password must be at least 6 characters' }),
        confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password'],
    });

export const connectEmailSchema = z.object({
    smtp_host: z.string().trim().min(1, { message: 'SMTP host is required' }),
    smtp_username: z.string().trim().min(1, { message: 'SMTP username is required' }),
    smtp_password: z.string().trim().min(1, { message: 'SMTP password is required' }),
    smtp_secure: z.boolean(),
    imap_host: z.string().trim().min(1, { message: 'IMAP host is required' }),
    imap_username: z.string().trim().min(1, { message: 'IMAP username is required' }),
    imap_password: z.string().trim().min(1, { message: 'IMAP password is required' }),
    imap_secure: z.boolean(),
});
