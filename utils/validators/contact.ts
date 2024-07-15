import { z } from 'zod';

export const contactSchema = z.object({
    id: z.coerce.number().int(),
    city_id: z.coerce.number().int().optional().nullable(),
    company_id: z.coerce.number(),
    contact_status_id: z.coerce.number(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    email: z.string().email({ message: 'Invalid email address' }).optional().nullable(),
    facebook: z.string().optional().nullable(),
    first_name: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    is_valid_email: z.boolean().nullable(),
    job_title: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    linkedin: z.string().url({ message: 'Invalid linkedin url' }).optional().nullable(),
    main_phone: z.string().optional().nullable(),
    mobile_phone: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    province_id: z.coerce.number().int().optional().nullable(),
    street_1: z.string().optional().nullable(),
    street_2: z.string().optional().nullable(),
    street_3: z.string().optional().nullable(),
    updated_at: z.coerce.date(),
    user_id: z.string(),
    organization_id: z.coerce.number().int(),
    website: z.string().url().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
});

export const updateContactSchema = contactSchema
    .pick({
        email: true,
        first_name: true,
        last_name: true,
        job_title: true,
        mobile_phone: true,
        whatsapp: true,
        linkedin: true,
        company_id: true,
        is_valid_email: true,
    })
    .partial()
    .extend({
        id: z.number().int(),
    });

export const addContactSchema = contactSchema
    .pick({
        job_title: true,
        company_id: true,
    })
    .extend({
        first_name: z.string().min(1, { message: 'First name is required' }),
        last_name: z.string().min(1, { message: 'Last name is required' }),
        email: z.string().email({ message: 'Invalid email address' }),
    });

export const updateContactUserIdSchema = contactSchema.pick({
    id: true,
    user_id: true,
});
