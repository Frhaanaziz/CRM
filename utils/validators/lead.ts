import { z } from 'zod';

export const leadSchema = z.object({
    company_id: z.coerce.number().int(),
    created_at: z.coerce.date().optional().nullable(),
    id: z.coerce.number().int(),
    lead_status_id: z.coerce.number().int().optional().nullable(),
    rating_id: z.coerce.number().int(),
    updated_at: z.coerce.date().optional().nullable(),
    source: z.string().optional().nullable(),
    user_id: z.string().trim(),
    organization_id: z.coerce.number().int(),
});

export const addLeadSchema = z.object({
    company_name: z.string().trim().min(1, { message: 'Company name must be at least 1 character long' }),
});

export const updateLeadUserIdSchema = leadSchema.pick({
    user_id: true,
});
