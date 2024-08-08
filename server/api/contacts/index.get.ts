import type { Company, Contact, PaginationUtils } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';
import qs from 'qs';

export default defineEventHandler(async (event) => {
    interface IContact extends Contact {
        company: Pick<Company, 'name'> | null;
    }

    const query = getQuery(event);

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: PaginationUtils & { result: IContact[] } }>(
            `/contacts?${qs.stringify({
                ...query,
                filters: {
                    company_id: query.company_id,
                },
            })}`
        );

        return data;
    } catch (error) {
        console.error('Error getting contacts (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
