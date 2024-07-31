export default defineAppConfig({
    ui: {
        // Set the default theme to 'brand'
        primary: 'brand',

        notifications: {
            // Show toasts at the top right of the screen
            position: 'top-0 bottom-auto',
        },

        formGroup: { label: { base: 'font-semibold' } },

        card: {
            body: {
                padding: 'px-2 py-2 sm:px-2 sm:py-2 ',
            },
            header: {
                padding: 'py-2 px-2 sm:px-2 ',
            },
        },
    },

    // fix type-checkin error
    nuxtIcon: {},
});
