import type { Company } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const organizationId = event.context.params?.id;
    if (!organizationId) throw createError({ status: 400, statusMessage: 'Organization id is needed' });

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Company[] }>(`/organizations/${organizationId}/companies`);

        return data;
    } catch (error) {
        console.error('Error getting organization companies (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
