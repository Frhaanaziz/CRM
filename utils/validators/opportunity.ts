import { z } from 'zod';
import { priorityStatuses, opportunityCloseReasons, opportunityPaymentPlans } from '../constants';

export const opportunitySchema = z.object({
    act_budget: z.coerce.number().optional().nullable(),
    act_close_date: z.coerce.date().optional().nullable(),
    act_revenue: z.coerce.number().optional().nullable(),
    confidence: z.coerce
        .number()
        .int()
        .min(0, { message: 'Confidence must be greater than 0' })
        .max(100, { message: 'Confidence must be less than 100' })
        .optional()
        .nullable(),
    created_at: z.coerce.date(),
    currency_id: z.coerce.number().int().optional().nullable(),
    current_situation: z.string().optional().nullable(),
    customer_need: z.string().optional().nullable(),
    est_budget: z.coerce.number().optional().nullable(),
    est_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }).optional().nullable(),
    id: z.coerce.number().int(),
    lead_id: z.coerce.number({ message: 'Please select a lead' }).int(),
    opportunity_status_id: z.coerce
        .number({
            message: 'Please select an opportunity status',
        })
        .int(),
    payment_plan: z.enum(opportunityPaymentPlans).optional().nullable(),
    proposed_solution: z.string().optional().nullable(),
    updated_at: z.coerce.date(),
    user_id: z.string().trim(),
    organization_id: z.coerce.number().int(),
    priority: z.enum(priorityStatuses),
    close_reason: z.enum(opportunityCloseReasons),
    est_close_date: z.coerce.date().optional().nullable(),
    notes: z.string().optional().nullable(),
    contact_id: z.coerce.number().int().optional().nullable(),
});

export const addOpportunitySchema = opportunitySchema
    .pick({
        lead_id: true,
        opportunity_status_id: true,
        notes: true,

        contact_id: true,
        payment_plan: true,
        confidence: true,
        est_revenue: true,
        est_close_date: true,
    })
    .extend({
        contact_id: z.coerce.number({ message: 'Please select a contact' }).int(),
        payment_plan: z.enum(opportunityPaymentPlans, { message: 'Please select a payment plan' }),
        confidence: z.coerce
            .number()
            .int()
            .min(0, { message: 'Confidence must be greater than 0' })
            .max(100, { message: 'Confidence must be less than 100' }),
        est_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }),
        est_close_date: z.coerce.date(),
    });

export const addLeadOpportunitySchema = opportunitySchema
    .pick({
        opportunity_status_id: true,
        notes: true,

        est_revenue: true,
        payment_plan: true,
        contact_id: true,
        confidence: true,
        est_close_date: true,
    })
    .extend({
        est_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }),
        payment_plan: z.enum(opportunityPaymentPlans, { message: 'Please select a payment plan' }),
        contact_id: z.coerce.number({ message: 'Please select a contact' }).int(),
        confidence: z.coerce
            .number()
            .int()
            .min(0, { message: 'Confidence must be greater than 0' })
            .max(100, { message: 'Confidence must be less than 100' }),
        est_close_date: z.coerce.date(),
    });

export const updateOpportunitySchema = opportunitySchema
    .pick({
        contact_id: true,
        opportunity_status_id: true,
        currency_id: true,
        payment_plan: true,
        est_budget: true,
        est_revenue: true,
        est_close_date: true,
        confidence: true,
        act_budget: true,
        act_revenue: true,
        act_close_date: true,
        current_situation: true,
        customer_need: true,
        proposed_solution: true,
        close_reason: true,
        notes: true,
    })
    .partial();

export const updateOpportunityUserIdSchema = opportunitySchema.pick({
    user_id: true,
});

export const updateOpportunityStatusId = opportunitySchema.pick({
    opportunity_status_id: true,
});

export const updateOpportunityAsWonSchema = opportunitySchema
    .pick({
        act_revenue: true,
        act_close_date: true,
    })
    .extend({
        act_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }),
        act_close_date: z.coerce.date({ message: 'Close date is required' }),
    });

export const updateOpportunityAsLostSchema = opportunitySchema
    .pick({
        act_revenue: true,
        act_close_date: true,
    })
    .extend({
        act_revenue: z.coerce.number().int().min(0, { message: 'Revenue must be greater than 0' }),
        act_close_date: z.coerce.date({ message: 'Close date is required' }),
    });
