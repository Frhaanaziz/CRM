import type { User } from '~/types';
import { getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: User }>(`/users/${id}`);

        return data;
    } catch (error) {
        console.error(`Error getting user with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
