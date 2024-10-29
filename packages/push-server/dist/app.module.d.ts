import { OnModuleInit } from '@nestjs/common';
import { ConsulService } from './consul/consul.service';
import { ConfigService } from '@nestjs/config';
export declare class AppModule implements OnModuleInit {
    private readonly consulService;
    private readonly config;
    constructor(consulService: ConsulService, config: ConfigService);
    onModuleInit(): Promise<void>;
}
