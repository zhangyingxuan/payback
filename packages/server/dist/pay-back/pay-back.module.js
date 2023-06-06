"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayBackModule = void 0;
const common_1 = require("@nestjs/common");
const shortTerm_service_1 = require("./service/shortTerm.service");
const market_service_1 = require("./service/market.service");
const funds_service_1 = require("./service/funds.service");
const hotList_service_1 = require("./service/hotList.service");
const pay_back_controller_1 = require("./pay-back.controller");
const typeorm_1 = require("@nestjs/typeorm");
const shortTermData_entity_1 = require("./entities/shortTermData.entity");
const marketData_entity_1 = require("./entities/marketData.entity");
const fundsData_entity_1 = require("./entities/fundsData.entity");
const hotList_entity_1 = require("./entities/hotList.entity");
let PayBackModule = class PayBackModule {
};
PayBackModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shortTermData_entity_1.shortTermData]),
            typeorm_1.TypeOrmModule.forFeature([marketData_entity_1.marketData]),
            typeorm_1.TypeOrmModule.forFeature([hotList_entity_1.hotList]),
            typeorm_1.TypeOrmModule.forFeature([fundsData_entity_1.fundsData]),
        ],
        controllers: [pay_back_controller_1.PayBackController],
        providers: [shortTerm_service_1.PayBackService, market_service_1.MarketService, funds_service_1.FundsService, hotList_service_1.HotListService]
    })
], PayBackModule);
exports.PayBackModule = PayBackModule;
//# sourceMappingURL=pay-back.module.js.map