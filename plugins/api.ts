import jwt from 'jsonwebtoken';

export default defineNuxtPlugin(() => {
    const auth = useAuth();
    const userId = auth.user?.id;
  
    const api = $fetch.create({
        onRequest({ options }) {
            if (userId) {
                const { JWT_SECRET } = useRuntimeConfig();
                const token = jwt.sign({ id: userId }, JWT_SECRET);

                const headers = (options.headers ||= {});
                if (Array.isArray(headers)) {
                    headers.push(['Authorization', `Bearer ${token}`]);
                } else if (headers instanceof Headers) {
                    headers.set('Authorization', `Bearer ${token}`);
                } else {
                    headers.Authorization = `Bearer ${token}`;
                }
            }
        },
        async onResponseError({ response }) {
            if (response.status === 401) {
                await navigateTo('/auth/signin');
            }
        },
    });

    // Expose to useNuxtApp().$api
    return {
        provide: {
            api,
        },
    };
});
