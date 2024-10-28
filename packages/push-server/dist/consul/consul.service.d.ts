import * as Consul from 'consul';
export declare class ConsulService {
    private consul;
    constructor(consul: Consul.Consul);
    register(options: Consul.Agent.Service.RegisterOptions): Promise<any>;
    deregister(id: string): Promise<any>;
    maintenance(options: Consul.Agent.Service.MaintenanceOptions): Promise<any>;
    findService(serviceName: string): Promise<{
        host: string;
        port: number;
    }>;
}
