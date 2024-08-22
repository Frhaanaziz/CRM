import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getErrorCode, getNestErrorMessage, updateOrganizationSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Organization id is needed' });

    const body = await readValidatedBody(event, updateOrganizationSchema.partial().parse);

    const supabase = await serverSupabaseClient<Database>(event);

    try {
        const fetchApi = await backendApi(event);
        await fetchApi(`/organizations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });

        await supabase.auth.refreshSession();
    } catch (error) {
        console.error(`Error updating organization with id (${id}) (SERVER):`, error);
        throw createError({ status: getErrorCode(error), statusMessage: getNestErrorMessage(error) });
    }
});
