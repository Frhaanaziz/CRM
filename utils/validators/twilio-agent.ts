import { z } from 'zod';

export const twilioAgentSchema = z.object({
    id: z.coerce.number(),
    call_receiving_device: z.string().trim().min(1, { message: 'Call Receiving Device is required' }).optional().nullable(),
    twilio_number: z.string().trim().min(1, { message: 'Twilio Number is required' }).optional().nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

export const updateTwilioAgentSchema = twilioAgentSchema.pick({
    call_receiving_device: true,
    twilio_number: true,
});
