import { addContactSchema, getErrorCode, getNestErrorMessage } from '~/utils';
import type { Contact } from '~/types';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, addContactSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Contact }>('/contacts', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        return data;
    } catch (error) {
        console.error('Error adding contact (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
