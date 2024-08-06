module.exports = {
    apps: [
        {
            name: 'app.idb2b',
            port: '3010',
            exec_mode: 'cluster',
            instances: 'max',
            script: './.output/server/index.mjs',
        },
    ],
};
