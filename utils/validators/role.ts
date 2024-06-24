import { roleNames } from '../constants';
import { z } from 'zod';

export const roleSchema = z.object({
    id: z.number().int(),
    name: z.enum(roleNames, {
        message: "Invalid role. Must be 'owner', 'admin', 'manager', or 'sales'",
    }),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
