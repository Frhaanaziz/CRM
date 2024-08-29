import type { LeadStatus } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: LeadStatus[] }>('/lead-statuses');

        return data;
    } catch (error) {
        console.error('Error getting lead statuses (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
