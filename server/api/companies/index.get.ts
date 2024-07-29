import type { City, Company, Contact, Industry, PaginationUtils, Province, Size } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    interface ICompany extends Company {
        primaryContact: Contact | null;
        industry: Pick<Industry, 'name'> | null;
        size: Pick<Size, 'size_range'> | null;
        province: Pick<Province, 'name'> | null;
        city: Pick<City, 'name'> | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: PaginationUtils & { result: ICompany[] } }>('/companies', {
            query: getQuery(event),
        });

        return data;
    } catch (error) {
        console.error('Error getting companies (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
