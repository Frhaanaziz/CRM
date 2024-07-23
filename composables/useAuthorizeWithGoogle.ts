export function useAuthorizeWithGoogle() {
    const supabase = useSupabaseClient();
    const runtimeConfig = useRuntimeConfig();

    async function authorizeWithGoogle() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${runtimeConfig.public.BASE_URL}/auth/confirm`,
                    // scopes: 'email, openid, profile, https://mail.google.com/',
                    // queryParams: {
                    //     access_type: 'offline',
                    //     prompt: 'consent',
                    // },
                },
            });
            if (error) {
                console.error('Error authorizing with Google:', error);
                throw new Error(error.message);
            }
        } catch (e) {
            console.error('Error authorizing with Google:', e);
            toast.error(getErrorMessage(e));
        }
    }

    return {
        authorizeWithGoogle,
    };
}
