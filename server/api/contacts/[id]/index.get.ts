import type { Company, Contact, User } from '~/types';

export default defineEventHandler(async (event) => {
    const id = event.context.params!.id;

    interface IContact extends Contact {
        company: Company | null;
        user: User | null;
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: IContact }>(`/contacts/${id}`);

    return data;
});
