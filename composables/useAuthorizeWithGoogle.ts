export function useAuthorizeWithGoogle() {
    const supabase = useSupabaseClient();
    const runtimeConfig = useRuntimeConfig();
    const sessionStore = userSessionStore();

    async function authorizeWithGoogle() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${runtimeConfig.public.BASE_URL}/auth/confirm`,
                    // scopes: 'email openid profile https://mail.google.com/',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
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

    async function connectGmail() {
        try {
            await supabase.auth.signOut();
            sessionStore.session = null;
            sessionStore.user = null;

            await supabase.auth.refreshSession();

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'email openid profile https://mail.google.com/',
                    redirectTo: `${runtimeConfig.public.BASE_URL}/auth/confirm`,
                    skipBrowserRedirect: true,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) {
                console.error('Error connecting Gmail:', error);
                throw new Error(error.message);
            }
        } catch (e) {
            console.error('Error connecting Gmail:', e);
            toast.error(getErrorMessage(e));
        }
    }

    return {
        authorizeWithGoogle,
        connectGmail,
    };
}
