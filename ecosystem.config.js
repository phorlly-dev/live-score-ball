module.exports = {
    apps: [
        {
            name: "live-score-sync",
            script: "src/server.js",
            watch: false,
            max_restarts: 5,
            restart_delay: 5000,
        },
    ],
};
