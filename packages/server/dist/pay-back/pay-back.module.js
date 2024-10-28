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
exports.PayBackModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const shortTerm_service_1 = require("./service/shortTerm.service");
const market_service_1 = require("./service/market.service");
const plate_service_1 = require("./service/plate.service");
const funds_service_1 = require("./service/funds.service");
const hotList_service_1 = require("./service/hotList.service");
const latestConceptPlate_service_1 = require("./service/latestConceptPlate.service");
const review_service_1 = require("./service/review.service");
const specialStock_service_1 = require("./service/specialStock.service");
const ths_service_1 = require("./service/ths.service");
const systemConfig_service_1 = require("./service/systemConfig.service");
const apiTest_service_1 = require("./service/apiTest.service");
const qyWechatNotice_service_1 = require("./service/qyWechatNotice.service");
const ths_trade_controller_1 = require("./ths-trade.controller");
const pay_back_controller_1 = require("./pay-back.controller");
const systemConfig_controller_1 = require("./systemConfig.controller");
const typeorm_1 = require("@nestjs/typeorm");
const shortTermData_entity_1 = require("./entities/shortTermData.entity");
const specialStock_entity_1 = require("./entities/specialStock.entity");
const marketData_entity_1 = require("./entities/marketData.entity");
const plateData_entity_1 = require("./entities/plateData.entity");
const fundsData_entity_1 = require("./entities/fundsData.entity");
const hotList_entity_1 = require("./entities/hotList.entity");
const latestConceptPlate_entity_1 = require("./entities/latestConceptPlate.entity");
const review_entity_1 = require("./entities/review.entity");
const systemConfig_entity_1 = require("./entities/systemConfig.entity");
const users_module_1 = require("../users/users.module");
const scheduler_task_module_1 = require("../scheduler-task/scheduler-task.module");
const config_1 = require("../config");
const consul_module_1 = require("../consul/consul.module");
const consul_service_1 = require("../consul/consul.service");
console.log('microserviceConfig', config_1.microserviceConfig, process.env.NODE_ENV);
let PayBackModule = class PayBackModule {
    constructor(consulService) {
        this.consulService = consulService;
    }
    async onModuleInit() {
        await this.consulService.register({
            name: 'gateway',
            address: '127.0.0.1',
            port: 3000,
        });
    }
};
PayBackModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            scheduler_task_module_1.SchedulerTaskModule,
            typeorm_1.TypeOrmModule.forFeature([shortTermData_entity_1.shortTermData]),
            typeorm_1.TypeOrmModule.forFeature([specialStock_entity_1.specialStock]),
            typeorm_1.TypeOrmModule.forFeature([marketData_entity_1.marketData]),
            typeorm_1.TypeOrmModule.forFeature([plateData_entity_1.plateData]),
            typeorm_1.TypeOrmModule.forFeature([hotList_entity_1.hotList]),
            typeorm_1.TypeOrmModule.forFeature([fundsData_entity_1.fundsData]),
            typeorm_1.TypeOrmModule.forFeature([review_entity_1.reviewData]),
            typeorm_1.TypeOrmModule.forFeature([systemConfig_entity_1.systemConfig]),
            typeorm_1.TypeOrmModule.forFeature([latestConceptPlate_entity_1.latestConceptPlate]),
            consul_module_1.ConsulModule.forRoot(),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'PUSH_SERVER',
                    useFactory: async (consulService) => {
                        const { host, port } = await consulService.findService('PUSH_SERVER');
                        return {
                            transport: microservices_1.Transport.TCP,
                            options: {
                                host,
                                port,
                            },
                        };
                    },
                    inject: [consul_service_1.ConsulService],
                },
            ]),
        ],
        controllers: [pay_back_controller_1.PayBackController, ths_trade_controller_1.ThsTradeController, systemConfig_controller_1.SystemConfigController],
        providers: [
            shortTerm_service_1.ShorTermService,
            specialStock_service_1.SpecialStockService,
            market_service_1.MarketService,
            plate_service_1.PlateService,
            funds_service_1.FundsService,
            hotList_service_1.HotListService,
            latestConceptPlate_service_1.LatestConceptPlateService,
            review_service_1.ReviewService,
            ths_service_1.ThsService,
            systemConfig_service_1.SystemConfigService,
            apiTest_service_1.ApiTestService,
            qyWechatNotice_service_1.QyWechatNotice,
        ],
    }),
    __metadata("design:paramtypes", [consul_service_1.ConsulService])
], PayBackModule);
exports.PayBackModule = PayBackModule;
//# sourceMappingURL=pay-back.module.js.map