import { z } from 'zod'

export const updateProfileSchema = z
  .object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    linkedin: z.string().optional()
  })