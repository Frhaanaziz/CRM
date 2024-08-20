import { z } from 'zod';
import { activityTypes } from '../constants';

export const activitySchema = z.object({
    id: z.coerce.number().int(),
    description: z.string().optional().nullable(),
    lead_id: z.coerce.number().int().optional().nullable(),
    opportunity_id: z.coerce.number().int().optional().nullable(),
    subject: z.string().trim().min(1, { message: 'Subject is required' }),
    type: z.enum(activityTypes),
    user_id: z.string(),
    organization_id: z.coerce.number().int(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

export const createActivitySchema = activitySchema.pick({
    description: true,
    lead_id: true,
    opportunity_id: true,
    subject: true,
    type: true,
});
