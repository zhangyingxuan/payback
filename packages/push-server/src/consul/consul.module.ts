import { Global, Module } from '@nestjs/common';
import { ConsulService } from './consul.service';
import * as Consul from 'consul';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class ConsulModule {
  static forRoot() {
    const provider = {
      provide: 'CONSUL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Consul({
          host: config.get('CONSUL_HOST'),
          port: config.get('CONSUL_PORT'),
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
