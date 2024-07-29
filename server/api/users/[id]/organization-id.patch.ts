import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import { z } from 'zod';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage } from '~/utils';

const schema = z.object({
    id: z.string(),
    organization_id: z.coerce.number(),
});
export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const body = await readValidatedBody(event, schema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { id, organization_id } = body.data;

    const { error: errorPublicUser } = await supabase.from('Users').update({ organization_id }).eq('id', id);
    if (errorPublicUser) {
        console.error('Error updating user organization_id in public', errorPublicUser);
        throw createError({ status: 500, statusMessage: 'Error updating user organization_id' });
    }

    const { error: errorAuthUser } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: { organization_id } });
    if (errorAuthUser) {
        console.error('Error updating user organization_id in auth', errorAuthUser);
        throw createError({ status: 500, statusMessage: 'Error updating user organization_id in auth' });
    }

    await supabase.auth.refreshSession();
});
