import { z } from 'zod';

export const organizationSchema = z.object({
    id: z.coerce.number().int(),
    city_id: z.coerce.number().int().optional().nullable(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    industry_id: z.coerce.number().int().optional().nullable(),
    name: z.string().min(1, { message: 'Organization name is required' }),
    province_id: z.coerce.number().int().optional().nullable(),
    size_id: z.coerce.number().int().optional().nullable(),
    updated_at: z.coerce.date(),
    website: z.string().url({ message: 'Invalid URL' }),
});

export const updateOrganizationSchema = organizationSchema.omit({
    created_at: true,
    updated_at: true,
});
