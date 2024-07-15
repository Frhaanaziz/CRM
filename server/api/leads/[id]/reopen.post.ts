import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateLeadStatus } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) {
        console.error('Unauthorized access to leads');
        throw createError({ status: 401, statusMessage: 'Unauthorized' });
    }

    const zodResult = updateLeadStatus.safeParse(JSON.parse(await readBody(event)));
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { id, status } = zodResult.data;

    const { error } = await supabase.from('Leads').update({ status }).eq('id', id);
    if (error) {
        console.error('Error updating lead status', error);
        throw createError({ status: 500, statusMessage: error.message });
    }

    const activityRes = await supabase
        .from('Activities')
        .insert({
            lead_id: id,
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
