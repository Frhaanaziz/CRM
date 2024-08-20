import { z } from 'zod';
import { inboxTypes } from '../constants';

export const inboxSchema = z.object({
    call_log_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    email_id: z.string().optional().nullable(),
    id: z.coerce.number().int(),
    is_read: z.boolean(),
    organization_id: z.coerce.number().int(),
    subject: z.string(),
    task_id: z.coerce.number().int().optional().nullable(),
    title: z.string(),
    type: z.enum(inboxTypes),
    updated_at: z.coerce.date(),
    user_id: z.string(),
});

export const readInboxSchema = z.object({
    ids: z.array(z.coerce.number().int()),
});
