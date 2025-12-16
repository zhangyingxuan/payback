module.exports = {
  apps: [{
    name: 'nest-webhook',
    script: 'dist/main.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'dev',
    },
    env_production: {
      NODE_ENV: 'prod',
    }
  }]
};