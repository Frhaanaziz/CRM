import type { Company } from '~/types';
import { inviteUserSchema, getNestErrorMessage, getErrorCode } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, inviteUserSchema.parse);

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Company }>(`/users/${id}/invite`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        return data;
    } catch (error) {
        console.error('Error inviting user (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
