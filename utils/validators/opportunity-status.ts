import { z } from 'zod';

export const opportunityStatusSchema = z.object({
    created_at: z.coerce.date(),
    id: z.coerce.number().int(),
    name: z
        .string()
        .min(1, { message: 'Name must be at least 1 character long' })
        .max(100, { message: 'Name must be at most 100 characters long' }),
    organization_id: z.coerce.number().int(),
    index_number: z.coerce.number(),
    updated_at: z.coerce.date(),
});

export const createOpportunityStatusSchema = opportunityStatusSchema.pick({
    name: true,
});

export const editOpportunityStatusSchema = opportunityStatusSchema
    .pick({
        name: true,
        index_number: true,
    })
    .partial()
    .extend({
        id: z.number().int(),
    });

export const reorderOpportunityStatusSchema = z.object({
    prevElIndexNumber: z.number().optional(),
    nextElIndexNumber: z.number().optional(),
});
