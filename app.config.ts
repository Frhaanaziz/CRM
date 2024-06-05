export default defineAppConfig({
  ui: {
    // Set the default theme to 'brand'
    primary: 'brand',

    notifications: {
      // Show toasts at the top right of the screen
      position: 'top-0 bottom-auto',
    },

    input: {
      base: 'disabled:bg-base-300'
    }
  },
});
