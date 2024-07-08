import { z } from 'zod';

export const B2BContactSchema = z.object({
    city_id: z.coerce.number().int().optional().nullable(),
    company_id: z.coerce.number().int(),
    country_id: z.coerce.number().int(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    email: z.string().email({
        message: 'Invalid email address.',
    }),
    facebook: z.string().optional().nullable(),
    first_name: z.string().optional().nullable(),
    id: z.coerce.number().int(),
    instagram: z.string().optional().nullable(),
    job_title: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    main_phone: z.string().optional().nullable(),
    mobile_phone: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    province_id: z.coerce.number().int().optional().nullable(),
    street_1: z.string().optional().nullable(),
    street_2: z.string().optional().nullable(),
    street_3: z.string().optional().nullable(),
    updated_at: z.coerce.date(),
    website: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
});

export const addB2BContactSchema = B2BContactSchema.pick({
    company_id: true,
    email: true,
    mobile_phone: true,
}).extend({
    first_name: z.string().min(1, { message: 'First name is required.' }),
    last_name: z.string().min(1, { message: 'Last name is required.' }),
    job_title: z.string().min(1, { message: 'Job title is required.' }),
});
