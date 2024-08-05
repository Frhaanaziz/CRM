import { z } from 'zod';
import { phone } from '.';
import { leadSources } from '../constants';

export const leadSchema = z.object({
    company_id: z.coerce.number().int(),
    created_at: z.coerce.date().optional().nullable(),
    id: z.coerce.number().int(),
    status: z.string().optional().nullable(),
    rating_id: z.coerce.number().int(),
    updated_at: z.coerce.date().optional().nullable(),
    source: z.enum(leadSources),
    user_id: z.string().trim(),
    organization_id: z.coerce.number().int(),
});

export const addLeadSchema = z.object({
    company_name: z.string().trim().min(1, { message: 'Company name must be at least 1 character long' }),
    email: z.string().trim().email().optional().nullable(),
    mobile_phone: phone(z.string().trim()).optional().nullable(),
});

export const updateLeadUserIdSchema = leadSchema.pick({
    user_id: true,
    id: true,
});

export const updateLeadStatus = leadSchema.pick({
    id: true,
    status: true,
});
