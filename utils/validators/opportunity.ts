import { z } from 'zod';
import { phone } from '.';
import { priorityStatuses, opportunityCloseReasons, opportunityPaymentPlans } from '../constants';

export const opportunitySchema = z.object({
    act_budget: z.coerce.number().optional().nullable(),
    act_close_date: z.coerce.date().optional().nullable(),
    act_revenue: z.coerce.number().optional().nullable(),
    company_id: z.coerce.number({ message: 'Please select a company' }).int(),
    confidence: z.coerce
        .number()
        .int()
        .min(0, { message: 'Confidence must be greater than 0' })
        .max(100, { message: 'Confidence must be less than 100' })
        .optional()
        .nullable(),
    created_at: z.coerce.date().optional().nullable(),
    currency_id: z.coerce.number().int().optional().nullable(),
    current_situation: z.string().optional().nullable(),
    customer_need: z.string().optional().nullable(),
    est_budget: z.coerce.number().optional().nullable(),
    est_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }).optional().nullable(),
    id: z.coerce.number().int(),
    lead_id: z.coerce.number().int(),
    opportunity_status_id: z.coerce
        .number({
            message: 'Please select an opportunity status',
        })
        .int(),
    payment_plan: z.enum(opportunityPaymentPlans),
    proposed_solution: z.string().optional().nullable(),
    updated_at: z.coerce.date().optional().nullable(),
    user_id: z.string().trim(),
    organization_id: z.coerce.number().int(),
    priority: z.enum(priorityStatuses),
    close_reason: z.enum(opportunityCloseReasons),
});

export const updateOpportunitySchema = opportunitySchema
    .pick({
        act_close_date: true,
        currency_id: true,
        act_budget: true,
        est_revenue: true,
        payment_plan: true,
        confidence: true,
        priority: true,
        opportunity_status_id: true,
        current_situation: true,
        customer_need: true,
        proposed_solution: true,
    })
    .partial()
    .extend({ id: z.coerce.number().int() });

export const addOpportunitySchema = opportunitySchema
    .pick({
        company_id: true,
    })
    .extend({
        first_name: z.string().trim().min(1, { message: 'First name is required' }),
        last_name: z.string().trim().min(1, { message: 'Last name is required' }),
        email: z.string().trim().email({ message: 'Invalid email address' }),
        phone: phone(z.string()).optional().nullable(),
    });

export const updateOpportunityUserIdSchema = opportunitySchema.pick({
    user_id: true,
    id: true,
});

export const updateOpportunityStatusId = opportunitySchema.pick({
    id: true,
    opportunity_status_id: true,
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
        act_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }),
        act_close_date: z.coerce.date({ message: 'Close date is required' }),
    });
