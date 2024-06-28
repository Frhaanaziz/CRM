import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateTaskIsCompletedSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResponse = await readValidatedBody(event, updateTaskIsCompletedSchema.safeParse);
    if (!zodResponse.success) {
        console.error('Error validating request body', zodResponse.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResponse) });
    }

    const { id, is_completed } = zodResponse.data;

    const { error } = await supabase.from('Tasks').update({ is_completed }).eq('id', id);
    if (error) {
        console.error('Error updating task is_completed', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});
