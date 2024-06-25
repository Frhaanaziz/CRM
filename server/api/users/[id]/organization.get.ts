import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    // get user id from params
    const user_id = event.context.params?.id;
    if (!user_id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const { data: user, error } = await supabase
        .from('Users')
        .select(
            `
            organization: Organizations(*)
            `
        )
        .eq('id', user_id)
        .single();
    if (error) throw createError({ status: 500, statusMessage: error.message });

    return user.organization;
});
