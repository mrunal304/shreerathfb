module.exports = {
  apps: [{
    name: "public", // shreerathfb-deployment
    script: "./dist/index.cjs",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    // MONGODB_URI and SESSION_SECRET must be set as real environment variables
    // wherever this pm2 process runs (e.g. `MONGODB_URI=... SESSION_SECRET=... pm2 start ecosystem.config.cjs`).
    // They are intentionally NOT hardcoded here to avoid committing credentials to the repo.
    env: {
      NODE_ENV: "production",
      PORT: process.env.PORT || 3005,
      MONGODB_URI: process.env.MONGODB_URI,
      SESSION_SECRET: process.env.SESSION_SECRET
    }
  }]
};
