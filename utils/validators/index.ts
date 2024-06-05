import { z } from 'zod';

export const getPaginatedDataSchema = z.object({
  page: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().positive().optional().default(10),
  search: z.string().trim().optional(),
});
