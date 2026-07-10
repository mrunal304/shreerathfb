module.exports = {
  apps: [{
    name: "public",
    script: "./dist/index.cjs",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3005,
      MONGODB_URI: "mongodb+srv://Mrunali:Mrunalifeedback@feedbackqrform.fbhwhe8.mongodb.net/shreerathqr?appName=feedbackqrform",
      SESSION_SECRET: "TH44OuZsO8Eo1xeojLGNfJYBIhv6oANERF57ZpijD2ALHThp2a0zoghjJDW1ygylOUgOoaT5xY2kwFmIxHFF9w==",
      ADMIN_USERNAME: "admin",
      ADMIN_PASSWORD: "shreerath_admin_2026"
      TRUST_PROXY: "1",
    }
  }]
};
