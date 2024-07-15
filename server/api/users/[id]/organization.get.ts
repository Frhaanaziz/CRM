import type { Organization, User } from '~/types';

export default defineEventHandler(async (event) => {
    const user_id = event.context.params?.id;

    interface IUser extends User {
        organization: Organization | null;
    }

    const fetchApi = await backendApi(event);
    const { data } = await fetchApi<{ data: IUser }>(`/users/${user_id}/organization`);

    return data.organization;
});
