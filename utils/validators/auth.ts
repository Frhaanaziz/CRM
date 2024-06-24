import { z } from 'zod';
import { phone } from '.';

export const signUpSchema = z
    .object({
        first_name: z.string().min(1, { message: 'First name is required' }),
        last_name: z.string().min(1, { message: 'Last name is required' }),
        email: z.string().email({ message: 'Invalid email address' }),
        phone: phone(z.string()),
        password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
        confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password'],
    });

export const signInSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
        confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password'],
    });
