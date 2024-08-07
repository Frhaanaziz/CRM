import { z } from 'zod';
import { B2BCompanySchema } from './b2b-company';
import { B2BContactSchema } from './b2b-contact';

export const addToLeadSchema = z.object({
    company: B2BCompanySchema,
    contact: z.array(B2BContactSchema),
});
