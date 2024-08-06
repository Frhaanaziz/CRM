import { z } from 'zod';

export const companySchema = z.object({
    id: z.coerce.number().int(),
    city_id: z.coerce.number().int().optional().nullable(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    industry_id: z.coerce.number().int().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    name: z.string().trim().min(1, { message: 'Name is required' }),
    postal_code: z.string().optional().nullable(),
    province_id: z.coerce.number().int().optional().nullable(),
    size_id: z.coerce.number().int().optional().nullable(),
    updated_at: z.coerce.date(),
    organization_id: z.coerce.number().int(),
    website: z.string().url({ message: 'Invalid URL' }).optional().nullable(),
    address: z.string().optional().nullable(),
});

export const updateCompanySchema = companySchema.pick({
    name: true,
    industry_id: true,
    size_id: true,
    country_id: true,
    city_id: true,
    postal_code: true,
    website: true,
    address: true,
});
