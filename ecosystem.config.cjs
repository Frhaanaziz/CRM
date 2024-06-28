module.exports = {
    apps: [
        {
            name: 'IDB2B',
            port: '3010',
            exec_mode: 'cluster',
            instances: 'max',
            script: './.output/server/index.mjs',
        },
    ],
};
