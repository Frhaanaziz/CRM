import type { H3Event } from 'h3';
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateUserOrganizationSchema } from '~/utils';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const id = event.context.params?.id;
    if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' });

    const body = await readValidatedBody(event, updateUserOrganizationSchema.safeParse);
    if (!body.success) {
        console.error('Error validating request body', body.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(body) });
    }

    const { role: roleName } = body.data;

    const { data: role, error: roleError } = await supabase.from('Roles').select('id').eq('name', roleName).single();
    if (roleError) {
        console.error('Error getting role', roleError);
        throw createError({ status: 500, statusMessage: 'Error getting role' });
    }

    const { error: errorPublicUser } = await supabase.from('Users').update({ role_id: role.id }).eq('id', id);
    if (errorPublicUser) {
        console.error('Error updating user role in public', errorPublicUser);
        throw createError({ status: 500, statusMessage: 'Error updating user role' });
    }

    const { error: errorAuthUser } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: { role_id: role.id } });
    if (errorAuthUser) {
        console.error('Error updating user role in auth', errorAuthUser);
        throw createError({ status: 500, statusMessage: 'Error updating user role in auth' });
    }
});
