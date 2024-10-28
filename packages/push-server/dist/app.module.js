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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const news_module_1 = require("./news/news.module");
const push_module_1 = require("./push/push.module");
const consul_module_1 = require("./consul/consul.module");
const consul_service_1 = require("./consul/consul.service");
let AppModule = class AppModule {
    constructor(consulService) {
        this.consulService = consulService;
    }
    async onModuleInit() {
        await this.consulService.register({
            name: 'PUSH_SERVER',
            address: '43.154.139.108',
            port: 3001,
        });
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [news_module_1.NewsModule, push_module_1.PushModule, consul_module_1.ConsulModule.forRoot()],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    }),
    __metadata("design:paramtypes", [consul_service_1.ConsulService])
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map