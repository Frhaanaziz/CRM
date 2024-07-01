// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ['@nuxt/eslint', '@nuxtjs/supabase', '@nuxt/ui', '@nuxt/image', '@pinia/nuxt'],
    routeRules: {
        '/': { redirect: '/dashboard' },
        '/auth/**': { prerender: true },
    },

    runtimeConfig: {
        public: {
            BASE_URL: process.env.NUXT_PUBLIC_BASE_URL,
        },
    },

    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
            },
        },
    },

    ui: {
        icons: ['heroicons'],
    },

    // UI module options
    colorMode: {
        preference: 'light',
    },

    // TypeScript module options
    typescript: {
        typeCheck: true,
    },

    // Supabase module options
    supabase: {
        redirectOptions: {
            login: '/auth/signin',
            callback: '/auth/confirm',
            exclude: ['/auth(/*)?'],
            cookieRedirect: true,
        },
    },
});
