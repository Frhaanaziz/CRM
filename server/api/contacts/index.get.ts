import type { Company, Contact, PaginationUtils } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    interface IContact extends Contact {
        company: Pick<Company, 'name'> | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: PaginationUtils & { result: IContact[] } }>('/contacts', {
            query: getQuery(event),
        });

        return data;
    } catch (error) {
        console.error('Error getting contacts (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
