import { ConsulService } from './consul.service';
export declare class ConsulModule {
    static forRoot(): {
        module: typeof ConsulModule;
        providers: (typeof ConsulService | {
            provide: string;
            useFactory: () => any;
        })[];
        exports: (typeof ConsulService | {
            provide: string;
            useFactory: () => any;
        })[];
    };
}
