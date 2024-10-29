import { ConsulService } from './consul.service';
import { ConfigService } from '@nestjs/config';
export declare class ConsulModule {
    static forRoot(): {
        module: typeof ConsulModule;
        providers: ({
            provide: string;
            inject: (typeof ConfigService)[];
            useFactory: (config: ConfigService) => any;
        } | typeof ConsulService)[];
        exports: ({
            provide: string;
            inject: (typeof ConfigService)[];
            useFactory: (config: ConfigService) => any;
        } | typeof ConsulService)[];
    };
}
