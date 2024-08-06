import { z } from 'zod';
import { companySchema } from './company';
import { contactSchema } from './contact';

export const addToLeadSchema = z.object({
    company: companySchema,
    contact: z.array(contactSchema),
});
