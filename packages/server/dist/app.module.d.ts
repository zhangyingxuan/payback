import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsulService } from './consul/consul.service';
export declare class AppModule implements OnModuleInit {
    private readonly consulService;
    private readonly config;
    constructor(consulService: ConsulService, config: ConfigService);
    onModuleInit(): Promise<void>;
}
