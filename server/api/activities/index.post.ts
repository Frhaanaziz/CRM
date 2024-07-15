import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { createActivitySchema, getZodErrorMessage } from '~/utils';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const zodResult = await readValidatedBody(event, createActivitySchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const user = await serverSupabaseUser(event);
    if (!user || !user.user_metadata.organization_id) {
        console.error('Unouthorized access to activities');
        throw createError({ status: 401, statusMessage: 'Unauthorized' });
    }

    const res = await supabase.from('Activities').insert({
        ...zodResult.data,
        organization_id: user.user_metadata.organization_id,
        user_id: user.id,
    });
    if (res.error) {
        console.error('Error create activities (SERVER):', res.error);
        throw createError({ status: 400, statusMessage: res.error.message });
    }

    return res.data;
});
