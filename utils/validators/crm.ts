import { z } from 'zod';

const addCompanyLeadSchema = z.object({
    industry_id: z.number(),
    size_id: z.number(),
    country_id: z.number(),
    province_id: z.number(),
    city_id: z.number(),
    name: z.string(),
    website: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    street_1: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
});

const addContactLeadSchema = z.object({
    country_id: z.number().optional().nullable(),
    province_id: z.number().optional().nullable(),
    city_id: z.number().optional().nullable(),
    first_name: z.string(),
    last_name: z.string(),
    job_title: z.string().optional().nullable(),
    email: z.string(),
    main_phone: z.string().optional().nullable(),
    mobile_phone: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    street_1: z.string().optional().nullable(),
    street_2: z.string().optional().nullable(),
    street_3: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});

export const addToLeadSchema = z.object({
    company: addCompanyLeadSchema,
    contact: addContactLeadSchema,
});
