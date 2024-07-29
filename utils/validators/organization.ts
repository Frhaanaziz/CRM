import { z } from 'zod';

export const organizationSchema = z.object({
    id: z.coerce.number().int(),
    city_id: z.coerce.number().int().optional().nullable(),
    country_id: z.coerce.number().int().optional().nullable(),
    created_at: z.coerce.date(),
    description: z.string().optional().nullable(),
    industry_id: z.coerce.number().int().optional().nullable(),
    name: z.string().trim().min(1, { message: 'Organization name is required' }),
    province_id: z.coerce.number().int().optional().nullable(),
    size_id: z.coerce.number().int().optional().nullable(),
    updated_at: z.coerce.date(),
    website: z.string().url({ message: 'Please enter a valid URL, including the protocol (http:// or https://)' }),
    sales_size: z.string().optional().nullable(),
    lead_source: z.string().optional().nullable(),
});

export const createOrganizationSchema = organizationSchema
    .pick({
        name: true,
        website: true,
        size_id: true,
        industry_id: true,
        sales_size: true,
        lead_source: true,
    })
    .extend({
        user_id: z.string().trim(),
    });

export const joinOrganizationSchema = z.object({
    code: z.string().trim().min(1, { message: 'Code is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
});

export const updateOrganizationSchema = organizationSchema.omit({
    created_at: true,
    updated_at: true,
});

export const inviteUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    role_id: z.coerce.number({ message: 'Role is required' }),
});
