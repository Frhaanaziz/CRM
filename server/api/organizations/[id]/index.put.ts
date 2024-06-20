import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
import { getZodErrorMessage, updateOrganizationSchema } from '~/utils';

export default defineEventHandler(async (event: H3Event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const organizationId = event.context.params?.id;
    if (!organizationId) throw createError({ status: 400, statusMessage: 'Organization id is needed' });

    const zodResult = await readValidatedBody(event, updateOrganizationSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating request body', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { error } = await supabase.from('Organizations').update(zodResult.data).eq('id', organizationId);
    if (error) {
        console.error('Error updating organization', error);
        throw createError({ status: 500, statusMessage: error.message });
    }

    await supabase.auth.refreshSession();
});
