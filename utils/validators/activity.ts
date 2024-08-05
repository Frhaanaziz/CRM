import { z } from 'zod';
import { activityTypes } from '../constants';

export const activitySchema = z.object({
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    id: z.coerce.number().int(),
    lead_id: z.coerce.number().int().optional().nullable(),
    opportunity_id: z.coerce.number().int().optional().nullable(),
    organization_id: z.coerce.number().int(),
    subject: z.string().trim().min(1, { message: 'Subject is required' }),
    type: z.enum(activityTypes),
    updated_at: z.coerce.date(),
    user_id: z.string(),
});

export const createActivitySchema = activitySchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    user_id: true,
    organization_id: true,
});
