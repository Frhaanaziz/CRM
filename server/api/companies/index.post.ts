import type { Company } from '~/types';
import { addCompanySchema, getErrorCode, getNestErrorMessage, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, addCompanySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Company }>('/companies', {
            method: 'POST',
            body: JSON.stringify(zodResult.data),
        });

        return data;
    } catch (error) {
        console.error('Error adding company (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
