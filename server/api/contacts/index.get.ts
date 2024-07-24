import type { Company, Contact, PaginationUtils } from '~/types';

export default defineEventHandler(async (event) => {
    interface IContact extends Contact {
        company: Pick<Company, 'name'> | null;
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: PaginationUtils & { result: IContact[] } }>('/contacts', {
        query: getQuery(event),
    });

    return data;
});
