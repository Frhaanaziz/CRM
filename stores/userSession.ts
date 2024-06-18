import type { Session, User } from '~/types/supabase-auth';

export const userSessionStore = defineStore('userSession', () => {
    const session = ref<Session | null>(null);
    const user = ref<User | null>(null);

    return { session, user };
});
