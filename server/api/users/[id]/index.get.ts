import type { User } from '~/types';

export default defineEventHandler(async (event) => {
    const id = event.context.params!.id;

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: User }>(`/users/${id}`);

    return data;
});
