import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { updateOpportunityStatusId } from '~/utils';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'Opportunity id is needed' });

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) {
        console.error('Unauthorized access to leads');
        throw createError({ status: 401, statusMessage: 'Unauthorized' });
    }

    const { opportunity_status_id } = await readValidatedBody(event, updateOpportunityStatusId.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const opportunityRes = await supabase
        .from('Opportunities')
        .update({ opportunity_status_id, close_reason_id: null, act_revenue: null, act_close_date: null })
        .eq('id', id);
    if (opportunityRes.error) {
        console.error('Error updating opportunity status', opportunityRes.error);
        throw createError({ status: 500, statusMessage: opportunityRes.error.message });
    }

    const activityRes = await supabase
        .from('Activities')
        .insert({
            opportunity_id: parseInt(id),
            type: 'reopened',
            subject: 'Reopened by {{author}}',
            user_id: user.id,
            organization_id: user.user_metadata.organization_id,
        })
        .select('id')
        .single();
    if (activityRes.error) {
        console.error('Error creating activity', activityRes.error);
        throw createError({ status: 500, statusMessage: activityRes.error.message });
    }

    await supabase.from('Activity_Participants').insert({ activity_id: activityRes.data.id, role: 'author', user_id: user.id });
});
