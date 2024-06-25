export default defineAppConfig({
    ui: {
        // Set the default theme to 'brand'
        primary: 'brand',

        notifications: {
            // Show toasts at the top right of the screen
            position: 'top-0 bottom-auto',
        },

        input: {
            base: 'disabled:bg-base-300',
        },

        card: {
            body: {
                padding: 'px-4 py-2',
            },
            header: {
                padding: 'py-2 px-4 sm:px-4',
            },
        },
    },

    // fix type-checkin error
    nuxtIcon: {},
});
