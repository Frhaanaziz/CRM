import { z } from 'zod';

export const contactSchema = z.object({
    id: z.number().int(),
    city_id: z.number().int().optional().nullable(),
    company_id: z.number().int().optional().nullable(),
    contact_status_id: z.number().int().optional().nullable(),
    country_id: z.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    first_name: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    is_valid_email: z.boolean().nullable(),
    job_title: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    main_phone: z.string().optional().nullable(),
    mobile_phone: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    province_id: z.number().int().optional().nullable(),
    street_1: z.string().optional().nullable(),
    street_2: z.string().optional().nullable(),
    street_3: z.string().optional().nullable(),
    updated_at: z.coerce.date(),
    user_id: z.string().optional().nullable(),
    website: z.string().url().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
});

export const addContactSchema = z.object({
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    job_title: z.string().optional().nullable(),
    company_id: z.number().int(),
});
