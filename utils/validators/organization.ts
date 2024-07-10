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
    website: z.string().url({ message: 'Please enter a valid URL, including the protocol (http:// or https://)' }),
});

export const createOrganizationSchema = organizationSchema
    .pick({
        name: true,
        website: true,
        size_id: true,
        industry_id: true,
    })
    .extend({
        user_id: z.string().min(1),
    });

export const joinOrganizationSchema = z.object({
    code: z.string().min(1, { message: 'Code is required' }),
});

export const updateOrganizationSchema = organizationSchema.omit({
    created_at: true,
    updated_at: true,
});

export const inviteUserSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    role: z.string().min(1, { message: 'Role is required' }),
});
