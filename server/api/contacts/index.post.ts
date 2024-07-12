import { addContactSchema, getZodErrorMessage } from '~/utils';
import type { Contact } from '~/types';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, addContactSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: Contact }>('/contacts', {
        method: 'POST',
        body: JSON.stringify(zodResult.data),
    });

    return data;
});
