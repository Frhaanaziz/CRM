import type { Role, User } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const organization_id = getRouterParam(event, 'id');
    if (!organization_id) throw createError({ status: 400, statusMessage: 'Organization id is needed' });

    interface IUser extends User {
        role?: Pick<Role, 'name'> | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: IUser[] }>(`/organizations/${organization_id}/users`);

        return data;
    } catch (error) {
        console.error('Error getting organization users (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
