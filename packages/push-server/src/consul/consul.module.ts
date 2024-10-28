import { Global, Module } from '@nestjs/common';
import { ConsulService } from './consul.service';
import * as Consul from 'consul';

@Global()
@Module({})
export class ConsulModule {
  static forRoot() {
    const provider = {
      provide: 'CONSUL',
      useFactory: () => {
        return new Consul({
          host: '43.154.139.108',
          port: '18500',
          promisify: true,
        });
      },
    };
    return {
      module: ConsulModule,
      providers: [provider, ConsulService],
      exports: [provider, ConsulService],
    };
  }
}
