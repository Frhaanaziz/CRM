import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { activitySchema } from '~/utils/validators/activity';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const queryParamResult = await getValidatedQuery(event, activitySchema.omit({ organization_id: true }).partial().parse);

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) {
        console.error('Unouthorized access to activities');
        throw createError({ status: 401, statusMessage: 'Unauthorized' });
    }

    const res = await supabase
        .from('Activities')
        .select(
            `
            *,
            user: Users(*),
            participants: Activity_Participants(*, user: Users(*))
            `
        )
        .match({
            ...queryParamResult,
            organization_id: user.user_metadata.organization_id,
        });
    if (res.error) {
        console.error('Error getting activities (SERVER):', res.error);
        throw createError({ status: 400, statusMessage: res.error.message });
    }

    return res.data;
});
