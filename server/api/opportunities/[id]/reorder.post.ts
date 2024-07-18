import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { calculateCurrElIndexNumber } from '~/server/utils/reorder';
import type { Database } from '~/types/supabase';
import { reorderSchema, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, reorderSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const id = event.context.params!.id;

    const {
        // index_number of the task above the dragged and dropped task
        prevElIndexNumber,
        // index_number of the task under the dragged and dropped task
        nextElIndexNumber,
    } = zodResult.data;

    const currElIndexNumber = calculateCurrElIndexNumber(prevElIndexNumber, nextElIndexNumber);

    // Update currElIndexNumber as the index_number of the new task
    const { error } = await supabase.from('Opportunities').update({ index_number: currElIndexNumber }).eq('id', id);
    if (error) {
        console.error('Error updating index_number:', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});
