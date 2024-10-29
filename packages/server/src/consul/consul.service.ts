import { Inject, Injectable } from '@nestjs/common';
import * as Consul from 'consul';
import { ConsulServiceNode } from './consul.interface';

@Injectable()
export class ConsulService {
  constructor(@Inject('CONSUL') private consul: Consul.Consul) { }

  async register(options: Consul.Agent.Service.RegisterOptions) {
    return await this.consul.agent.service.register(options);
  }

  async deregister(id: string) {
    return await this.consul.agent.service.deregister(id);
  }

  async maintenance(options: Consul.Agent.Service.MaintenanceOptions) {
    return await this.consul.agent.service.maintenance(options);
  }

  /**
   * 查找微服务
   * @param serviceName
   * @returns
   */
  async findService(serviceName: string): Promise<{ host: string; port: number }> {
    const services = await this.consul.catalog.service.nodes<ConsulServiceNode[]>(serviceName);
    if (!services.length) {
      throw new Error(`Service ${serviceName} not found`);
    }
    const service = services[0];
    return {
      host: service.ServiceAddress,
      port: service.ServicePort,
    };
  }
}
