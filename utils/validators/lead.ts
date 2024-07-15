import { z } from 'zod';
import { phone } from '.';
import { leadStatuses } from '../constants';

export const leadSchema = z.object({
    company_id: z.coerce.number().int(),
    contact_id: z.coerce.number().int(),
    created_at: z.string().optional().nullable(),
    disqualify_reason_id: z.coerce.number().int().optional().nullable(),
    id: z.coerce.number().int(),
    status: z.enum(leadStatuses),
    message: z.string().optional().nullable(),
    rating_id: z.coerce.number().int(),
    score: z.coerce.number().int().optional().nullable(),
    source_id: z.coerce.number().int(),
    topic: z.string().optional().nullable(),
    updated_at: z.coerce.date().optional().nullable(),
    user_id: z.string(),
    organization_id: z.coerce.number().int(),
});

export const addLeadSchema = leadSchema
    .pick({
        company_id: true,
        user_id: true,
        organization_id: true,
        contact_id: true,
    })
    .extend({
        first_name: z.string().min(1, { message: 'First name is required' }),
        last_name: z.string().min(1, { message: 'Last name is required' }),
        email: z.string().email({ message: 'Invalid email address' }),
        mobile_phone: phone(z.string()).optional().nullable(),
    });

export const updateLeadUserIdSchema = leadSchema.pick({
    user_id: true,
    id: true,
});

export const updateLeadTopicSchema = leadSchema.pick({
    topic: true,
    id: true,
});

export const updateLeadStatus = leadSchema.pick({
    id: true,
    status: true,
});
