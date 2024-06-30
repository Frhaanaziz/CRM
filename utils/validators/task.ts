import { z } from 'zod';

export const taskSchema = z.object({
    id: z.coerce.number().int(),
    lead_id: z.coerce.number().int(),
    opportunity_id: z.coerce.number().int().optional().nullable(),
    description: z.string().min(1, { message: 'Description is required' }),
    date: z.coerce.date(),
    is_completed: z.boolean(),
    user_id: z.string(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

export const addTaskSchema = taskSchema.pick({ description: true, date: true, lead_id: true, user_id: true });

export const updateTaskSchema = taskSchema.pick({ id: true, description: true, date: true });

export const updateTaskIsCompletedSchema = taskSchema.pick({ id: true, is_completed: true });