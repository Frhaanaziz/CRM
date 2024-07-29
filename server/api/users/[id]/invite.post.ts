import type { Company } from '~/types';
import { inviteUserSchema, getZodErrorMessage, getNestErrorMessage, getErrorCode } from '~/utils';

export default defineEventHandler(async (event) => {
    const zodResult = await readValidatedBody(event, inviteUserSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const id = event.context.params!.id;

    try {
        const fetchApi = await backendApi(event);
        const { data } = await fetchApi<{ data: Company }>(`/users/${id}/invite`, {
            method: 'POST',
            body: JSON.stringify(zodResult.data),
        });

        return data;
    } catch (error) {
        console.error('Error inviting user (SERVER):', error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
