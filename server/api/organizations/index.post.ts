import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import { createOrganizationSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseAdmin = serverSupabaseServiceRole<Database>(event);

    const zodResult = await readValidatedBody(event, createOrganizationSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { user_id, ...rest } = zodResult.data;

    const { data: organization, error: organizationError } = await supabase
        .from('Organizations')
        .insert(rest)
        .select('*')
        .single();
    if (organizationError) {
        console.error('Error inserting contact:', organizationError);
        throw createError({ status: 400, statusMessage: organizationError.message });
    }

    const { data: ownerRole, error: roleError } = await supabase.from('Roles').select('id').eq('name', 'owner').single();
    if (roleError) {
        console.error('Error getting owner role:', roleError);
        throw createError({ status: 500, statusMessage: 'Error getting owner role' });
    }

    const { error: errorPublicUser } = await supabase
        .from('Users')
        .update({ organization_id: organization.id, role_id: ownerRole.id })
        .eq('id', user_id);
    if (errorPublicUser) {
        console.error('Error updating user organization_id in public', errorPublicUser);
        throw createError({ status: 500, statusMessage: 'Error updating user organization_id' });
    }

    const { error: errorAuthUser } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        user_metadata: { organization_id: organization.id, role_id: ownerRole.id },
    });
    if (errorAuthUser) {
        console.error('Error updating user organization_id in auth', errorAuthUser);
        throw createError({ status: 500, statusMessage: 'Error updating user organization_id in auth' });
    }

    await supabase.auth.refreshSession();
});