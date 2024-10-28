import { OnModuleInit } from '@nestjs/common';
import { ConsulService } from './consul/consul.service';
export declare class AppModule implements OnModuleInit {
    private readonly consulService;
    constructor(consulService: ConsulService);
    onModuleInit(): Promise<void>;
}
