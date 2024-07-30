import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getErrorCode, getNestErrorMessage, getZodErrorMessage, updateOrganizationSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Organization id is needed' });

    const zodResult = await readValidatedBody(event, updateOrganizationSchema.partial().safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/organizations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(zodResult.data),
        });

        await supabase.auth.refreshSession();
    } catch (error) {
        console.error(`Error updating organization with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
