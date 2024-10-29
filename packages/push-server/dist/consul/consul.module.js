"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConsulModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsulModule = void 0;
const common_1 = require("@nestjs/common");
const consul_service_1 = require("./consul.service");
const Consul = require("consul");
const config_1 = require("@nestjs/config");
let ConsulModule = ConsulModule_1 = class ConsulModule {
    static forRoot() {
        const provider = {
            provide: 'CONSUL',
            inject: [config_1.ConfigService],
            useFactory: (config) => {
                return new Consul({
                    host: config.get('CONSUL_HOST'),
                    port: config.get('CONSUL_PORT'),
                    promisify: true,
                });
            },
        };
        return {
            module: ConsulModule_1,
            providers: [provider, consul_service_1.ConsulService],
            exports: [provider, consul_service_1.ConsulService],
        };
    }
};
ConsulModule = ConsulModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], ConsulModule);
exports.ConsulModule = ConsulModule;
//# sourceMappingURL=consul.module.js.map