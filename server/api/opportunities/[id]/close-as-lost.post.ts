import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOpportunityAsLostSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) {
        console.error('Unauthorized access to leads');
        throw createError({ status: 401, statusMessage: 'Unauthorized' });
    }

    const zodResult = await readValidatedBody(event, updateOpportunityAsLostSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, act_close_date, ...rest } = zodResult.data;

    const opportunityRes = await supabase
        .from('Opportunities')
        .update({
            ...rest,
            act_close_date: act_close_date.toISOString(),
        })
        .eq('id', id);
    if (opportunityRes.error) {
        console.error('Error updating opportunity status', opportunityRes.error);
        throw createError({ status: 500, statusMessage: opportunityRes.error.message });
    }

    const activityRes = await supabase
        .from('Activities')
        .insert({
            opportunity_id: id,
            type: 'closed as lost',
            subject: 'Closed as Lost by {{author}}',
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
