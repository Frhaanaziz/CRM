import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { createActivitySchema } from '~/utils';

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const body = await readValidatedBody(event, createActivitySchema.parse);

    const supabase = await serverSupabaseClient<Database>(event);

    const res = await supabase.from('Activities').insert({
        ...body,
        organization_id: user.user_metadata.organization_id,
        user_id: user.id,
    });
    if (res.error) {
        console.error('Error create activities (SERVER):', res.error);
        throw createError({ status: 400, statusMessage: res.error.message });
    }

    return res.data;
});
