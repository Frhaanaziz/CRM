import { z } from 'zod';

export const taskSchema = z.object({
    id: z.coerce.number().int(),
    lead_id: z.coerce.number().int().optional().nullable(),
    opportunity_id: z.coerce.number().int().optional().nullable(),
    description: z.string().trim().min(1, { message: 'Description is required' }),
    date: z.coerce.date({ message: 'Date is required' }),
    is_completed: z.boolean(),
    user_id: z.string().trim().min(1, { message: 'Please select a user' }),
    organization_id: z.coerce.number().int(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

export const addTaskSchema = taskSchema.pick({
    description: true,
    date: true,
    lead_id: true,
    opportunity_id: true,
    user_id: true,
});

export const updateTaskSchema = taskSchema
    .pick({
        description: true,
        date: true,
    })
    .extend({
        description: z.string().trim().min(1, { message: 'Description is required' }),
        date: z.coerce.date({ message: 'Date is required' }),
    });
