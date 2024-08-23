import type { Industry } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Pick<Industry, 'id' | 'name'>[] }>('/industries/b2b-companies');

        return data;
    } catch (error) {
        console.error('Error getting industries b2b-companies (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
