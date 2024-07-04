import { z } from 'zod';
import { phone } from '.';

export const opportunitySchema = z.object({
    act_budget: z.coerce.number().optional().nullable(),
    act_close_date: z.coerce.date().optional().nullable(),
    act_revenue: z.coerce.number().optional().nullable(),
    close_reason_id: z.coerce.number().int().optional().nullable(),
    company_id: z.coerce.number({ message: 'Please select a company' }).int(),
    confidence: z.coerce
        .number()
        .int()
        .min(0, { message: 'Confidence must be greater than 0' })
        .max(100, { message: 'Confidence must be less than 100' })
        .optional()
        .nullable(),
    contact_id: z.coerce
        .number({
            message: 'Please select a contact',
        })
        .int(),
    created_at: z.coerce.date().optional().nullable(),
    currency_id: z.coerce.number().int().optional().nullable(),
    current_situation: z.string().optional().nullable(),
    customer_need: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    est_budget: z.coerce.number().optional().nullable(),
    est_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }).optional().nullable(),
    id: z.coerce.number().int(),
    lead_id: z.coerce.number().int(),
    opportunity_status_id: z.coerce
        .number({
            message: 'Please select an opportunity status',
        })
        .int(),
    payment_plan_id: z.coerce.number().int().optional().nullable(),
    proposed_solution: z.string().optional().nullable(),
    topic: z.string().min(1, { message: 'Topic is required' }),
    upadate_at: z.coerce.date().optional().nullable(),
    user_id: z.string(),
    organization_id: z.coerce.number().int(),
});

export const updateOpportunitySchema = opportunitySchema.pick({
    id: true,
    act_close_date: true,
    currency_id: true,
    act_budget: true,
    est_revenue: true,
    payment_plan_id: true,
    confidence: true,
});

export const addOpportunitySchema = opportunitySchema
    .pick({
        topic: true,
        company_id: true,
        organization_id: true,
        user_id: true,
        // oppotunity_status_id: true,
    })
    .extend({
        first_name: z.string().min(1, { message: 'First name is required' }),
        last_name: z.string().min(1, { message: 'Last name is required' }),
        email: z.string().email({ message: 'Invalid email address' }),
        phone: phone(z.string()).optional().nullable(),
    });

export const updateOpportunityUserIdSchema = opportunitySchema.pick({
    user_id: true,
    id: true,
});

export const updateOpportunityCloseReasonIdSchema = opportunitySchema.pick({
    close_reason_id: true,
    id: true,
});

export const updateOpportunityTopicSchema = opportunitySchema.pick({
    topic: true,
    id: true,
});

export const updateOpportunityStatusId = opportunitySchema.pick({
    id: true,
    opportunity_status_id: true,
});

export const updateOpportunityActRevenue = opportunitySchema.pick({
    id: true,
    act_revenue: true,
});

export const updateOpportunityActCloseDate = opportunitySchema.pick({
    id: true,
    act_close_date: true,
});

export const updateOpportunityAsWonSchema = opportunitySchema
    .pick({
        id: true,
    })
    .extend({
        act_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }),
        act_close_date: z.coerce.date({ message: 'Close date is required' }),
    });

export const updateOpportunityAsLostSchema = opportunitySchema
    .pick({
        id: true,
    })
    .extend({
        close_reason_id: z.coerce.number({ message: 'Close reason is required' }).int(),
        act_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }),
        act_close_date: z.coerce.date({ message: 'Close date is required' }),
    });
