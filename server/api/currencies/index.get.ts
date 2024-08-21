import type { Currency } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Currency[] }>('/currencies');

        return data;
    } catch (error) {
        console.error('Error getting currencies (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
