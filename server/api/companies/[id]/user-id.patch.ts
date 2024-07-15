import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateCompanyUserIdSchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) {
        console.error('Unauthorized access to leads');
        throw createError({ status: 401, statusMessage: 'Unauthorized' });
    }

    const body = await readValidatedBody(event, updateCompanyUserIdSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, user_id } = body.data;

    const { error } = await supabase.from('Companies').update({ user_id }).eq('id', id);
    if (error) {
        console.error('Error updating company user_id', error);
        throw createError({ status: 500, statusMessage: error.message });
    }

    const activityRes = await supabase
        .from('Activities')
        .insert({
            company_id: id,
            type: 'assigned',
            subject: '{{author}} Assigned this company to {{assignee}}',
            user_id: user.id,
            organization_id: user.user_metadata.organization_id,
        })
        .select('id')
        .single();
    if (activityRes.error) {
        console.error('Error creating activity', activityRes.error);
        throw createError({ status: 500, statusMessage: activityRes.error.message });
    }

    await supabase.from('Activity_Participants').insert([
        { activity_id: activityRes.data.id, role: 'author', user_id: user.id },
        { activity_id: activityRes.data.id, role: 'assignee', user_id },
    ]);
});
