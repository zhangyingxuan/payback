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
var MarketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const marketData_entity_1 = require("../entities/marketData.entity");
const typeorm_2 = require("@nestjs/typeorm");
const playWrightUtil_1 = require("../utils/playWrightUtil");
const dayjs = require("dayjs");
const schedule_1 = require("@nestjs/schedule");
let MarketService = MarketService_1 = class MarketService {
    constructor(marketDataRp) {
        this.marketDataRp = marketDataRp;
        this.logger = new common_1.Logger(MarketService_1.name);
    }
    async crawlMarketData() {
        this.logger.debug('crawlMarketData is Begining!');
        const todayDateStr = new Date().toLocaleDateString();
        const todayDataFromDB = await this.marketDataRp
            .createQueryBuilder('market_data')
            .where("market_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
            .getOne();
        if (todayDataFromDB) {
        }
        let marketData;
        try {
            marketData = await playWrightUtil_1.default.getMarketData(dayjs(todayDateStr).format('YYYYMMDD'));
            console.log(marketData);
            this.logger.debug('crawlMarketData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return marketData;
    }
    async findAll() {
        return await this.marketDataRp.find();
    }
    async findByLimit(len = 20) {
        return await this.marketDataRp
            .createQueryBuilder('market_data')
            .offset(0)
            .limit(len)
            .select([
            'market_data.createTime',
            'market_data.marketScore',
            'market_data.riseAmount',
            'market_data.fallAmount',
            'market_data.dailyLimitIncome',
            'market_data.shangzhengPoint',
            'market_data.shenzhengPoint',
            'market_data.chuangyePoint',
            'market_data.beizheng50Point'
        ])
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async findPlateByLimit(len = 20) {
        return await this.marketDataRp
            .createQueryBuilder('market_data')
            .offset(0)
            .limit(len)
            .select([
            'market_data.createTime',
            'market_data.gainianRiseFloat',
            'market_data.gainianFallFloat',
            'market_data.hangyeRiseFloat',
            'market_data.hangyeFallFloat'
        ])
            .orderBy('createTime', 'DESC')
            .getMany();
    }
};
__decorate([
    (0, schedule_1.Cron)('0 0 16 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketService.prototype, "crawlMarketData", null);
MarketService = MarketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(marketData_entity_1.marketData)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], MarketService);
exports.MarketService = MarketService;
//# sourceMappingURL=market.service.js.map