import { z } from 'zod'

export const profileSchema =  z.object({
  id: z.string(),
  created_at: z.coerce.date(),
  email: z.string().email(),
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  linkedin: z.string().nullable().optional(),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  photo: z.string().nullable().optional(),
  updated_at: z.coerce.date()
})

export const updateProfileSchema = profileSchema.pick({ first_name: true, last_name: true, phone: true, linkedin: true }).partial()