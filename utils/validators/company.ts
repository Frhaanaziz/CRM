import { z } from 'zod';

export const companiesSchema = z.object({
    id: z.coerce.number().int(),
    city_id: z.coerce.number().int().optional().nullable(),
    company_status_id: z.coerce.number().int().optional().nullable(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    industry_id: z.coerce.number().int().optional().nullable(),
    linkedin: z.string().nullable(),
    name: z.string().min(1, { message: 'Name is required' }),
    phone: z.string().nullable(),
    postal_code: z.string().nullable(),
    primary_contact_id: z.coerce.number().int().optional().nullable(),
    province_id: z.coerce.number().int().optional().nullable(),
    size_id: z.coerce.number().int().optional().nullable(),
    street_1: z.string().nullable(),
    street_2: z.string().nullable(),
    street_3: z.string().nullable(),
    state_id: z.coerce.number().optional(),
    updated_at: z.coerce.date(),
    user_id: z.string(),
    organization_id: z.coerce.number().int(),
    website: z.string().url({ message: 'Invalid URL' }).optional().nullable(),
});

export const addCompanySchema = companiesSchema.pick({
    name: true,
    website: true,
    user_id: true,
    organization_id: true,
});

export const addCompanyPrimaryContactSchema = companiesSchema.pick({
    id: true,
    primary_contact_id: true,
});

export const updateCompanyUserIdSchema = companiesSchema.pick({
    id: true,
    user_id: true,
});
