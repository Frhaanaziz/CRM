import { serverSupabaseUser } from '#supabase/server';
import { setupUserSchema, getZodErrorMessage, getErrorCode, getNestErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, setupUserSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/users/${user.id}/setup`, {
            method: 'POST',
            body: JSON.stringify(zodResult.data),
        });
    } catch (error) {
        console.error(`Error setup user with id ${user.id} (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
