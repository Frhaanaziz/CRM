import { z } from 'zod';

export const signUpSchema = z
  .object({
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().min(6, { message: 'Invalid phone number' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    password_confirmation: z
      .string()
      .min(1, { message: 'Password confirmation is required' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});
