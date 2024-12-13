module.exports = {
    apps: [{
        name: "finIA-app-backend",
        script: "./dist/main.js",
        watch: false,
        env: {
            NODE_ENV: "production",
        }
    }]
}