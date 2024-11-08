import { Global, Module } from '@nestjs/common';
import { ConsulService } from './consul.service';
import * as Consul from 'consul';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PUSH_SERVER',
        useFactory: async (consulService: ConsulService) => {
          const serverName = 'payBack_pushServer_' + process.env.NODE_ENV || 'prod';
          const { host, port } = await consulService.findService(serverName);
          console.log(serverName, host, port);
          return {
            transport: Transport.TCP,
            options: {
              host,
              port,
            },
          };
        },
        inject: [ConsulService],
      },
    ]),
  ],
})
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
      exports: [provider, ConsulService, ClientsModule],
    };
  }
}
