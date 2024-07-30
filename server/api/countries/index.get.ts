import type { Country } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Country[] }>('/countries');

        return data;
    } catch (error) {
        console.error('Error getting countries (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
