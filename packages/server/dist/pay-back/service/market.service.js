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
const marketUtil_1 = require("../utils/marketUtil");
const tradeDateUtil_1 = require("../utils/tradeDateUtil");
const users_service_1 = require("../../users/users.service");
const thsUtils_1 = require("../utils/thsUtils");
let MarketService = MarketService_1 = class MarketService {
    constructor(marketDataRp, usersService) {
        this.marketDataRp = marketDataRp;
        this.usersService = usersService;
        this.logger = new common_1.Logger(MarketService_1.name);
    }
    async crawlMarketData(account = 'admin') {
        this.logger.debug('crawlMarketData is Begining!');
        const todayDateStr = (0, tradeDateUtil_1.toTradeDate)();
        let marketData;
        try {
            marketData = await marketUtil_1.default.getMarketData((0, tradeDateUtil_1.toIwencaiDate)(todayDateStr), (0, thsUtils_1.getIwencaiCookie)(await this.usersService.getUserByAccount(account)));
            marketData.tradeDate = todayDateStr;
            const todayDataFromDB = await this.marketDataRp
                .createQueryBuilder('market_data')
                .where('market_data.tradeDate = :tradeDate', { tradeDate: todayDateStr })
                .orWhere('market_data.tradeDate IS NULL AND DATE(market_data.createTime) = :tradeDate', {
                tradeDate: todayDateStr,
            })
                .getOne();
            if (todayDataFromDB) {
                this.logger.log('crawlMarketData 更新数据');
                await this.marketDataRp.update(todayDataFromDB.id, marketData);
            }
            else {
                this.logger.log('crawlMarketData 新增数据');
                await this.marketDataRp.save(marketData);
            }
            this.logger.debug('crawlMarketData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
            throw e;
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
            'market_data.tradeDate',
            'market_data.createTime',
            'market_data.marketScore',
            'market_data.riseAmount',
            'market_data.fallAmount',
            'market_data.dailyLimitIncome',
            'market_data.shangzhengRiseAndFall',
            'market_data.marketTurnover',
            'market_data.shangzhengPoint',
            'market_data.shenzhengPoint',
            'market_data.chuangyePoint',
            'market_data.beizheng50Point',
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
            'market_data.hangyeFallFloat',
        ])
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async deleteByCreateTime(date) {
        return await this.marketDataRp
            .createQueryBuilder()
            .delete()
            .where('createTime like :date', { date: date + '%' })
            .execute();
    }
};
MarketService = MarketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(marketData_entity_1.marketData)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        users_service_1.UsersService])
], MarketService);
exports.MarketService = MarketService;
//# sourceMappingURL=market.service.js.map