// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    css: ['~/assets/css/tailwind.css'],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    modules: [
        '@nuxt/eslint',
        '@nuxtjs/supabase',
        '@nuxt/ui',
        '@nuxt/image',
        '@nuxtjs/kinde',
    ],

    runtimeConfig: {
        JWT_SECRET: process.env.NUXT_JWT_SECRET,
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
        redirect: false,
        // redirectOptions: {
        //   login: '/auth/signin',
        //   callback: '/dashboard',
        //   include: ['/', '/dashboard(/*)?'],
        //   cookieRedirect: true,
        // },
    },
});
