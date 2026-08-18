import { ConsulService } from './consul.service';
import { ConfigService } from '@nestjs/config';
export declare class ConsulModule {
    static forRoot(): {
        module: typeof ConsulModule;
        providers: (typeof ConsulService | {
            provide: string;
            inject: (typeof ConfigService)[];
            useFactory: (config: ConfigService) => any;
        })[];
        exports: (typeof ConsulService | {
            provide: string;
            inject: (typeof ConfigService)[];
            useFactory: (config: ConfigService) => any;
        })[];
    };
}
