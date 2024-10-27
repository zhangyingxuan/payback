export const microserviceConfigs = {
  dev: {
    pushServer: {
      host: '43.154.139.108',
      // host: 'localhost',
      port: 3001,
    },
  },
  prod: {
    pushServer: {
      host: '43.154.139.108',
      port: 3001,
    },
  },
};

interface ServerConfig {
  host: string;
  port: number;
}
interface MicroserviceConfig {
  pushServer: ServerConfig;
}
export const microserviceConfig: MicroserviceConfig = microserviceConfigs[process.env.NODE_ENV];
