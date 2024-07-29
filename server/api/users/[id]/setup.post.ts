import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { setupUserSchema, getZodErrorMessage } from '~/utils';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event);

    const user = await serverSupabaseUser(event);
    if (!user) throw createError({ status: 401, statusMessage: 'Unauthorized' });

    const zodResult = await readValidatedBody(event, setupUserSchema.safeParse);
    if (!zodResult.success) {
        console.error('Error validating body:', zodResult.error);
        throw createError({ status: 400, statusMessage: getZodErrorMessage(zodResult) });
    }

    const { phone, expectation } = zodResult.data;

    let first_name: string = user.user_metadata.first_name;
    let last_name: string = user.user_metadata.last_name;

    if (!first_name || !last_name) {
        const full_name = (user.user_metadata.full_name || user.user_metadata.name) as string | undefined;
        if (!full_name) throw createError({ status: 400, statusMessage: "Full name or name does't exist" });

        const names = full_name.split(' ');
        first_name = names[0];
        last_name = names.slice(1).join(' ');
    }

    // Insert twilio agents and settings for the user
    const [{ data: twilioAgent, error: insertTwilioAgentsError }, { data: twilioSettings, error: insertTwilioSettingsError }] =
        await Promise.all([
            supabase.from('Twilio_Agents').insert({}).select('id').single(),
            supabase.from('Twilio_Settings').insert({}).select('id').single(),
        ]);
    if (insertTwilioAgentsError) {
        console.error('Error inserting twilio agents (SERVER):', insertTwilioAgentsError);
        throw createError({ status: 400, statusMessage: insertTwilioAgentsError.message });
    }
    if (insertTwilioSettingsError) {
        console.error('Error inserting twilio settings (SERVER):', insertTwilioSettingsError);
        throw createError({ status: 400, statusMessage: insertTwilioSettingsError.message });
    }

    const [{ error: authError }, { error: insertError }] = await Promise.all([
        supabase.auth.updateUser({
            data: {
                first_name,
                last_name,
                phone,
                expectation,
                photo: user.user_metadata.avatar_url,
                twilio_agent_id: twilioAgent?.id,
                twilio_setting_id: twilioSettings?.id,
            },
        }),
        supabase.from('Users').insert({
            id: user.id,
            first_name,
            last_name,
            email: user.email || user.user_metadata.email,
            phone,
            expectation,
            photo: user.user_metadata.avatar_url ?? null,
            twilio_agent_id: twilioAgent?.id,
            twilio_setting_id: twilioSettings?.id,
        }),
    ]);
    if (authError) {
        console.error('Error updating user auth (SERVER):', authError);
        throw createError({ status: 400, statusMessage: authError.message });
    }
    if (insertError) {
        console.error('Error inserting user public (SERVER):', insertError);
        throw createError({ status: 400, statusMessage: insertError.message });
    }

    await supabase.auth.refreshSession();
});
