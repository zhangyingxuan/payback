"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsulService = void 0;
const common_1 = require("@nestjs/common");
const Consul = require("consul");
let ConsulService = class ConsulService {
    constructor(consul) {
        this.consul = consul;
    }
    async register(options) {
        return await this.consul.agent.service.register(options);
    }
    async deregister(id) {
        return await this.consul.agent.service.deregister(id);
    }
    async maintenance(options) {
        return await this.consul.agent.service.maintenance(options);
    }
    async findService(serviceName) {
        const services = await this.consul.catalog.service.nodes(serviceName);
        if (!services.length) {
            throw new Error(`Service ${serviceName} not found`);
        }
        const service = services[0];
        return {
            host: service.ServiceAddress,
            port: service.ServicePort,
        };
    }
};
ConsulService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CONSUL')),
    __metadata("design:paramtypes", [typeof (_a = typeof Consul !== "undefined" && Consul.Consul) === "function" ? _a : Object])
], ConsulService);
exports.ConsulService = ConsulService;
//# sourceMappingURL=consul.service.js.map