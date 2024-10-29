module.exports = {
  apps: [
    {
      name: 'payBack',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'prod',
      },
      env_dev: {
        NODE_ENV: 'dev',
      },
      env_prod: {
        NODE_ENV: 'prod',
      },
    },
  ],
};
