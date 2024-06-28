import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateLeadStatusId } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResponse = updateLeadStatusId.safeParse(JSON.parse(await readBody(event)));
    if (!zodResponse.success) {
        console.error('Error validating request body', zodResponse.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResponse) });
    }

    const { id, ...restData } = zodResponse.data;

    const { error } = await supabase.from('Leads').update(restData).eq('id', id);
    if (error) {
        console.error('Error updating lead lead_status_id', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});
