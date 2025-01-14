import { z } from 'zod';
import { phone } from '.';
import { userStatuses } from '../constants';

export const userSchema = z.object({
    id: z.string(),
    created_at: z.coerce.date(),
    email: z.string().trim().email(),
    first_name: z.string().trim().min(1, { message: 'First name is required' }),
    last_name: z.string().trim().min(1, { message: 'Last name is required' }),
    linkedin: z.string().nullable().optional(),
    phone: phone(z.string()),
    photo: z.string().url().nullable().optional(),
    status: z.enum(userStatuses, {
        message: "Invalid status. Must be 'active' or 'inactive'",
    }),
    role_id: z.coerce.number().int(),
    updated_at: z.coerce.date(),
    expectation: z.array(z.string()).min(1, { message: 'Please select an option' }).optional().nullable(),
    google_refresh_token: z.string().optional().nullable(),
    organization_id: z.coerce.number().optional().nullable(),
    twilio_agent_id: z.coerce.number().optional().nullable(),
    twilio_setting_id: z.coerce.number().optional().nullable(),
    email_setting_id: z.coerce.number().optional().nullable(),
});

export const updateUserSchema = userSchema
    .pick({ first_name: true, last_name: true, phone: true, linkedin: true, expectation: true })
    .partial();

export const updateUserRoleSchema = userSchema.pick({ role_id: true });

export const updateUserStatusSchema = userSchema.pick({ status: true });

export const setupUserSchema = userSchema
    .pick({
        phone: true,

        expectation: true,
        google_refresh_token: true,
    })
    .extend({
        expectation: z.array(z.string()).min(1, { message: 'Please select an option' }),
        google_refresh_token: z.string().optional().nullable(),
    });
