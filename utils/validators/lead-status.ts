import { z } from 'zod';

export const leadStatusSchema = z.object({
    created_at: z.coerce.date(),
    id: z.coerce.number().int(),
    index_number: z.coerce.number(),
    name: z.string().min(1, { message: 'Name is required' }),
    organization_id: z.coerce.number().int(),
    updated_at: z.coerce.date(),
});

export const addLeadStatusSchema = leadStatusSchema.pick({
    name: true,
});
