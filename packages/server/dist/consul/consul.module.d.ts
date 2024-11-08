import { ConsulService } from './consul.service';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
export declare class ConsulModule {
    static forRoot(): {
        module: typeof ConsulModule;
        providers: (typeof ConsulService | {
            provide: string;
            inject: (typeof ConfigService)[];
            useFactory: (config: ConfigService) => any;
        })[];
        exports: (typeof ClientsModule | typeof ConsulService | {
            provide: string;
            inject: (typeof ConfigService)[];
            useFactory: (config: ConfigService) => any;
        })[];
    };
}
