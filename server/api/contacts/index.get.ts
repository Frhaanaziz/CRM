import type { Company, Contact } from '~/types';

export default defineEventHandler(async (event) => {
    interface IContact extends Contact {
        company: Pick<Company, 'name'> | null;
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: IContact[] }>('/contacts');

    return data;
});
