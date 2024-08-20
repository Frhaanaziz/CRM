import { z } from 'zod';

export const B2BCompanySchema = z.object({
    avatar: z.string().optional().nullable(),
    city_id: z.coerce.number().int().optional().nullable(),
    company_id: z.coerce.number().int().optional().nullable(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    founded: z.string().optional().nullable(),
    id: z.coerce.number().int(),
    industry_id: z.coerce.number().int().optional().nullable(),
    linkedin: z
        .string()
        .url({
            message: 'Invalid LinkedIn URL.',
        })
        .optional()
        .nullable(),
    location: z.string().optional().nullable(),
    name: z.string().trim().min(1, { message: 'Name is required' }),
    province_id: z.coerce.number().int().optional().nullable(),
    size_id: z.coerce.number().int().optional().nullable(),
    specialities: z.string().optional().nullable(),
    tagline: z.string().optional().nullable(),
    updated_at: z.coerce.date(),
    website: z
        .string()
        .url({
            message: 'Invalid website URL.',
        })
        .optional()
        .nullable(),
    zip_code: z.string().optional().nullable(),
});

export const addB2BCompanyToLeadSchema = z.object({
    b2b_company_id: z.coerce.number().int(),
});
