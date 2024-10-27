export declare const microserviceConfigs: {
    dev: {
        pushServer: {
            host: string;
            port: number;
        };
    };
    prod: {
        pushServer: {
            host: string;
            port: number;
        };
    };
};
interface ServerConfig {
    host: string;
    port: number;
}
interface MicroserviceConfig {
    pushServer: ServerConfig;
}
export declare const microserviceConfig: MicroserviceConfig;
export {};
