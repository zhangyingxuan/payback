module.exports = {
  apps: [
    {
      name: 'pushServer',
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
