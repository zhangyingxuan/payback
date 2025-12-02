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
const typeorm_1 = require("@nestjs/typeorm");
const pay_back_module_1 = require("./pay-back/pay-back.module");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const article_module_1 = require("./article/article.module");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const consul_module_1 = require("./consul/consul.module");
const consul_service_1 = require("./consul/consul.service");
const envFilePath = `.env.${process.env.NODE_ENV || 'prod'}`;
function atob(a) {
    if (!a)
        return;
    return Buffer.from(a, 'base64').toString('binary');
}
let AppModule = class AppModule {
    constructor(consulService, config) {
        this.consulService = consulService;
        this.config = config;
    }
    async onModuleInit() {
        const config = this.config;
        console.log(config.get('APP_NAME'), config.get('APP_HOST'), config.get('APP_PORT'));
        await this.consulService.register({
            name: config.get('APP_NAME'),
            address: config.get('APP_HOST'),
            port: Number(config.get('APP_PORT') || 3000),
        });
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const host = config.get('DDD_HOST');
                    const port = config.get('DDD_PORT');
                    const username = config.get('DDD_USER');
                    const password = atob(config.get('DDD_PD'));
                    const database = config.get('DDD_NAME');
                    return {
                        type: 'mysql',
                        host,
                        port,
                        username,
                        password,
                        database,
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: true,
                    };
                },
            }),
            consul_module_1.ConsulModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            pay_back_module_1.PayBackModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            article_module_1.ArticleModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    }),
    __metadata("design:paramtypes", [consul_service_1.ConsulService, config_1.ConfigService])
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map