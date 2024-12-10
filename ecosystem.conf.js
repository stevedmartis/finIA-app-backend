module.exports = {
    apps: [{
        name: 'finIA-app-backend',
        script: 'npm',
        args: 'start',
        interpreter: 'none',
        env: {
            NODE_ENV: 'production',
        },
    }],
};