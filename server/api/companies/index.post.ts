import type { Company } from '~/types';
import { addCompanySchema, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, addCompanySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: Company }>('/companies', {
        method: 'POST',
        body: JSON.stringify(zodResult.data),
    });

    return data;
});
