import { serverSupabaseClient } from '#supabase/server';
import { calculateCurrElIndexNumber } from '~/server/utils/reorder';
import type { Database } from '~/types/supabase';
import { reorderSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity ID is required' });

    const body = await readValidatedBody(event, reorderSchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const {
        // index_number of the task above the dragged and dropped task
        prevElIndexNumber,
        // index_number of the task under the dragged and dropped task
        nextElIndexNumber,
    } = body;

    const currElIndexNumber = calculateCurrElIndexNumber(prevElIndexNumber, nextElIndexNumber);

    // Update currElIndexNumber as the index_number of the new task
    const { error } = await supabase.from('Opportunities').update({ index_number: currElIndexNumber }).eq('id', id);
    if (error) {
        console.error('Error updating index_number:', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});
