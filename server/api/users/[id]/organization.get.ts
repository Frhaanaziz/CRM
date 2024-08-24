import type { Organization, User } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const user_id = getRouterParam(event, 'id');

    interface IUser extends User {
        organization: Organization | null;
    }

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: IUser }>(`/users/${user_id}/organization`);

        return data.organization;
    } catch (error) {
        console.error('Error getting organization (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
