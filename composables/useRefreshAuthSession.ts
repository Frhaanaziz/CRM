export async function useRefreshAuthSession() {
    const sessionStore = userSessionStore();

    const { data: auth } = await useSupabaseClient().auth.refreshSession();
    sessionStore.session = auth.session;
    sessionStore.user = auth.user;

    return auth;
}
