import { z } from 'zod';

export const B2BCompanySchema = z.object({
    avatar: z.string().optional().nullable(),
    city_id: z.coerce.number().int().optional().nullable(),
    company_id: z.coerce.number().int().optional().nullable(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    email: z
        .string()
        .email({
            message: 'Invalid email address.',
        })
        .optional()
        .nullable(),
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
    name: z.string().min(1, { message: 'Name is required' }),
    phone: z.string().optional().nullable(),
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

export const updateB2BCompanySchema = B2BCompanySchema.pick({
    id: true,
    name: true,
    website: true,
    linkedin: true,
    phone: true,
    email: true,
    industry_id: true,
    size_id: true,
    province_id: true,
    city_id: true,
    location: true,
    zip_code: true,
});
