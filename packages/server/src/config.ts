export const microserviceConfig = {
  env: {
    pushServerUrl: 'http://localhost:3000/push',
    newsServerUrl: 'http://localhost:4000/pay',
  },
  prod: {
    pushServerUrl: 'http://localhost:3000/push',
    newsServerUrl: 'http://localhost:4000/pay',
  },
};

export const config = microserviceConfig[process.env.NODE_ENV];
