import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { calculateCurrElIndexNumber } from '~/server/utils/reorder';
import type { Database } from '~/types/supabase';
import { reorderSchema, updateOpportunityStatusId } from '~/utils';

const schema = updateOpportunityStatusId.merge(reorderSchema);
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity id is needed' });

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const {
        opportunity_status_id,

        // index_number of the task above the dragged and dropped task
        prevElIndexNumber,
        // index_number of the task under the dragged and dropped task
        nextElIndexNumber,
    } = await readValidatedBody(event, schema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    if (!prevElIndexNumber && !nextElIndexNumber) {
        const { data: maxIndexOpportunity, error: maxIndexError } = await supabase
            .from('Opportunities')
            .select('index_number')
            .match({
                organization_id: user.user_metadata.organization_id,
                opportunity_status_id,
            })
            .order('index_number', { ascending: false })
            .limit(1)
            .single();
        if (maxIndexError && maxIndexError.code !== 'PGRST116') {
            console.error('Error fetching max index opportunity (SERVER)', maxIndexError);
            throw createError({
                status: 500,
                statusMessage: maxIndexError.message,
            });
        }

        const { error } = await supabase
            .from('Opportunities')
            .update({ opportunity_status_id, index_number: maxIndexOpportunity ? maxIndexOpportunity.index_number + 0.5 : 1 })
            .eq('id', id);
        if (error) {
            console.error('Error updating index_number:', error);
            throw createError({ status: 500, statusMessage: error.message });
        }
        return;
    }

    const currElIndexNumber = calculateCurrElIndexNumber(prevElIndexNumber, nextElIndexNumber);

    // Update currElIndexNumber as the index_number of the new task
    const { error } = await supabase
        .from('Opportunities')
        .update({ opportunity_status_id, index_number: currElIndexNumber })
        .eq('id', id);
    if (error) {
        console.error('Error updating index_number:', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});
