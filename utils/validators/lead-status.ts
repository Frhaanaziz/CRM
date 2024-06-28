import { z } from 'zod';
import { leadStatuses } from '../constants';

export const leadStatusSchema = z.object({
    id: z.coerce.number().int(),
    name: z.enum(leadStatuses),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
