import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { reorderOpportunityStatusSchema, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, reorderOpportunityStatusSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const id = event.context.params!.id;

    console.log('Reordering opportunity status', zodResult.data);
    const {
        // index_number of the task above the dragged and dropped task
        prevElIndexNumber,
        // index_number of the task under the dragged and dropped task
        nextElIndexNumber,
    } = zodResult.data;

    // a variable containing the index_number of the dragged and dropped task
    let currElIndexNumber: number;

    // prevElIndexNumber === undefined, this is happended when the drag-and-drop task is at the top of the to-do list.
    // Since there is no upper task, set the index_number of the lower task + 0.5 as the currElIndexNumber
    if (prevElIndexNumber === undefined) {
        if (nextElIndexNumber === undefined)
            throw createError({ status: 400, statusMessage: 'Both prevElIndexNumber and nextElIndexNumber are undefined' });

        currElIndexNumber = nextElIndexNumber + 0.5;

        // nextElIndexNumber === undefined, this is happended when the dragged-and-dropped task is at the bottom of the to-do list
        // Set the index_number of the task above - 0.5 as the currElIndexNumber
    } else if (nextElIndexNumber === undefined) {
        currElIndexNumber = prevElIndexNumber - 0.5;

        // If there are tasks both above and below the dragged-and-dropped task, then
        // currElIndexNumber = (index_number of the top task + index_number of the bottom task)/2
    } else {
        currElIndexNumber = (prevElIndexNumber + nextElIndexNumber) / 2;
    }

    // Update currElIndexNumber as the index_number of the new task
    const { error } = await supabase
        .from('Opportunity_Statuses')
        .update({ index_number: currElIndexNumber, updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) {
        console.error('Error updating index_number:', error);
        throw createError({ status: 500, statusMessage: error.message });
    }
});
