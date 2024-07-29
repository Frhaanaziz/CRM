import type { B2BCompany, City, Industry, PaginationUtils, Province, Size } from '~/types';
import qs from 'qs';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    interface IB2BCompany extends B2BCompany {
        industry: Industry | null;
        size: Size | null;
        province: Province | null;
        city: City | null;
    }

    const query = getQuery(event);

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: PaginationUtils & { result: IB2BCompany[] } }>(
            `/b2b-companies?${qs.stringify({
                ...query,
                filters: {
                    industry_id: query.industry_id,
                    size_id: query.size_id,
                },
            })}`
        );

        return data;
    } catch (error) {
        console.error('Error getting b2b companies (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
