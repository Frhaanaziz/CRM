import type { DisqualifyReason } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: DisqualifyReason[] }>('/disqualify-reasons');

        return data;
    } catch (error) {
        console.error('Error getting disqualify reasons (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
