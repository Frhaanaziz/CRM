module.exports = {
    apps: [
        {
            name: process.env.NAME || 'app',
            port: process.env.PORT || 3000,
            script: './.output/server/index.mjs',
        },
    ],
};
