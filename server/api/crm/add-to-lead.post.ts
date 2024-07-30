import { getErrorCode, getNestErrorMessage, getZodErrorMessage } from '~/utils';
import { addToLeadSchema } from '~/utils/validators/crm';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, addToLeadSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    try {
        const fetchApi = await backendApi(event);
        await fetchApi('/crm/add-to-lead', {
            method: 'POST',
            body: JSON.stringify(zodResult.data),
        });
    } catch (error) {
        console.error('Error add to lead (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
