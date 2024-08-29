import { z } from 'zod';
import { phone } from '.';

export const contactSchema = z.object({
    id: z.coerce.number().int(),
    city_id: z.coerce.number().int().optional().nullable(),
    company_id: z.coerce.number({ message: 'Lead is required' }).int(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    email: z.string().trim().email({ message: 'Invalid email address' }).optional().nullable(),
    facebook: z.string().optional().nullable(),
    first_name: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    is_added_to_smartlead: z.coerce.boolean().optional().nullable(),
    is_valid_email: z.boolean().nullable(),
    job_title: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    linkedin: z.string().url({ message: 'Invalid linkedin url' }).optional().nullable(),
    main_phone: z.string().optional().nullable(),
    mobile_phone: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    province_id: z.coerce.number().int().optional().nullable(),
    updated_at: z.coerce.date(),
    organization_id: z.coerce.number().int(),
    website: z.string().url().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
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
    .partial();

export const addContactSchema = contactSchema
    .pick({
        first_name: true,
        mobile_phone: true,
        last_name: true,
        email: true,
        job_title: true,
        company_id: true,
    })
    .extend({
        first_name: z.string().trim().min(1, { message: 'First name is required' }),
        mobile_phone: phone(z.string().trim()).optional().nullable(),
    });
