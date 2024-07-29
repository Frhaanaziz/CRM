import { z } from 'zod';

export const twilioSettingSchema = z.object({
    id: z.coerce.number(),
    account_sid: z.string().min(1, { message: 'Account SID is required' }).optional().nullable(),
    api_key: z.string().min(1, { message: 'API Key is required' }).optional().nullable(),
    api_secret: z.string().min(1, { message: 'API Secret is required' }).optional().nullable(),
    auth_token: z.string().min(1, { message: 'Auth Token is required' }).optional().nullable(),
    enabled: z.boolean(),
    record_calls: z.boolean(),
    twiml_sid: z.string().min(1, { message: 'Twiml SID is required' }).optional().nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

export const updateTwilioSettingSchema = twilioSettingSchema.pick({
    id: true,
    account_sid: true,
    api_key: true,
    api_secret: true,
    auth_token: true,
    enabled: true,
    record_calls: true,
    twiml_sid: true,
});
