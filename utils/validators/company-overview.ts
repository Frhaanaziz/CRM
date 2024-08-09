import { z } from 'zod';

export const companyOverviewSchema = z.object({
    id: z.coerce.number().int(),
    title: z.string().trim().min(1, { message: 'Title must be at least 1 character long' }),
    description: z.string().trim().min(1, { message: 'Description must be at least 1 character long' }),
    company_id: z.coerce.number().int(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

export const addCompanyOverviewSchema = companyOverviewSchema.pick({
    title: true,
    description: true,
});

export const updateCompanyOverviewSchema = companyOverviewSchema.pick({
    title: true,
    description: true,
});
