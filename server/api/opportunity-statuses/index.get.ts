import { getErrorCode, getNestErrorMessage } from '~/utils';
import type { OpportunityStatus } from '~/types';

export default defineEventHandler(async (event) => {
    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: OpportunityStatus[] }>('/opportunity-statuses');

        return data;
    } catch (error) {
        console.error('Error fetching opportunity statuses (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
