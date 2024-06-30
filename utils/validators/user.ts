import { z } from 'zod';
import { phone } from '.';
import { userStatuses } from '../constants';

export const userSchema = z.object({
    id: z.string(),
    created_at: z.coerce.date(),
    email: z.string().email(),
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    linkedin: z.string().nullable().optional(),
    phone: phone(z.string()),
    photo: z.string().url().nullable().optional(),
    status: z.enum(userStatuses, {
        message: "Invalid status. Must be 'active' or 'inactive'",
    }),
    role_id: z.coerce.number().int(),
    updated_at: z.coerce.date(),
});

export const updateUserSchema = userSchema.pick({ first_name: true, last_name: true, phone: true, linkedin: true }).partial();
export const updateUserRoleSchema = userSchema.pick({ id: true, role_id: true });
export const updateUserStatusSchema = userSchema.pick({ id: true, status: true });