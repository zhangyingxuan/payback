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
var SpecialStockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialStockService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const specialStock_entity_1 = require("../entities/specialStock.entity");
const typeorm_2 = require("@nestjs/typeorm");
const transformDataUtil_1 = require("../utils/transformDataUtil");
const specialStockUtil_1 = require("../utils/specialStockUtil");
const dayjs = require("dayjs");
const pay_back_core_1 = require("pay-back-core");
const ths_service_1 = require("./ths.service");
const fetchUtil_1 = require("../core/fetchUtil");
const tradeDateUtil_1 = require("../utils/tradeDateUtil");
const users_service_1 = require("../../users/users.service");
const thsUtils_1 = require("../utils/thsUtils");
let SpecialStockService = SpecialStockService_1 = class SpecialStockService {
    constructor(specialStockRp, thsService, usersService) {
        this.specialStockRp = specialStockRp;
        this.thsService = thsService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(SpecialStockService_1.name);
    }
    async crawlBinddingData(isRemoveIncompatible = 0, account) {
        this.logger.debug('crawlBinddingData is Begining!');
        const todayDateStr = (0, tradeDateUtil_1.toTradeDate)();
        let todayDataFromDB = null;
        const specialStockDto = {
            biddingData: '',
            newStock: '',
            chooseStock: '',
            fundsLikeStock: '',
            heightestStock: '',
            createTime: new Date(),
            updatedTime: new Date(),
            tradeDate: todayDateStr,
        };
        try {
            const yesterdayDateStr = await this.getLastTradingDayByDB(todayDateStr);
            const cookie = (0, thsUtils_1.getIwencaiCookie)(await this.usersService.getUserByAccount(account));
            const dailyLimitYesterdayBidding = await (0, specialStockUtil_1.fetchLastdayDailyLimitBinddingData)(todayDateStr, yesterdayDateStr, cookie);
            isRemoveIncompatible && this.dealIncompatibleExpectStocks(dailyLimitYesterdayBidding, account);
            todayDataFromDB = await this.getTodayData(todayDateStr);
            if (todayDataFromDB) {
                todayDataFromDB.biddingData = JSON.stringify(dailyLimitYesterdayBidding);
                todayDataFromDB.updatedTime = new Date();
                this.logger.log('crawlBinddingData 更新数据');
                await this.specialStockRp.update(todayDataFromDB.id, todayDataFromDB);
            }
            else {
                specialStockDto.biddingData = JSON.stringify(dailyLimitYesterdayBidding);
                specialStockDto.updatedTime = new Date();
                specialStockDto.createTime = new Date();
                this.logger.log('crawlBinddingData 新增数据');
                await this.specialStockRp.save(specialStockDto);
            }
            this.logger.debug('crawlBinddingData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
            throw e;
        }
        return todayDataFromDB ? todayDataFromDB : specialStockDto;
    }
    async crawlSpecialStockData(account) {
        this.logger.debug('crawlSpecialStockData is Begining!');
        let todayDataFromDB = null;
        const todayDateStr = (0, tradeDateUtil_1.toTradeDate)();
        const specialStockDto = {
            biddingData: '',
            newStock: '',
            chooseStock: '',
            fundsLikeStock: '',
            heightestStock: '',
            createTime: new Date(),
            updatedTime: new Date(),
            tradeDate: todayDateStr,
        };
        try {
            const yesterdayDateStr = await this.getLastTradingDayByDB(todayDateStr);
            const cookie = (0, thsUtils_1.getIwencaiCookie)(await this.usersService.getUserByAccount(account));
            const { newStocks, chooseStock1Expected } = await (0, specialStockUtil_1.fetchSpecialStockBinddingData)(todayDateStr, yesterdayDateStr, cookie);
            if (newStocks && newStocks.length > 0) {
                try {
                    this.thsService.batchUpdateThsSelfStock(newStocks, fetchUtil_1.ThsOprate.add, account);
                }
                catch (error) {
                    this.logger.error('自动加入新股到自选股失败', error);
                }
            }
            todayDataFromDB = await this.getTodayData(todayDateStr);
            if (todayDataFromDB) {
                todayDataFromDB.newStock = JSON.stringify(newStocks);
                todayDataFromDB.chooseStock = JSON.stringify({ chooseStock1Expected });
                todayDataFromDB.updatedTime = new Date();
                this.logger.log('crawlSpecialStockData 更新数据');
                await this.specialStockRp.update(todayDataFromDB.id, todayDataFromDB);
            }
            else {
                specialStockDto.newStock = JSON.stringify(newStocks);
                specialStockDto.chooseStock = JSON.stringify({ chooseStock1Expected });
                specialStockDto.updatedTime = new Date();
                specialStockDto.createTime = new Date();
                this.logger.log('crawlSpecialStockData 新增数据');
                await this.specialStockRp.save(specialStockDto);
            }
            this.logger.debug('crawlSpecialStockData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
            throw e instanceof Error ? e : new Error(String(e));
        }
        return todayDataFromDB ? todayDataFromDB : specialStockDto;
    }
    async dealIncompatibleExpectStocks(dailyLimitYesterdayBidding, account) {
        this.logger.log('dealIncompatibleExpectStocks 删除不及预期个股');
        const incompatibleExpectStocks = [];
        dailyLimitYesterdayBidding &&
            dailyLimitYesterdayBidding.forEach(stock => {
                if (stock.expected === transformDataUtil_1.ExpectEnum.incompatible) {
                    incompatibleExpectStocks.push(stock);
                }
            });
        incompatibleExpectStocks.length > 0 &&
            this.thsService.batchUpdateThsSelfStock(incompatibleExpectStocks, fetchUtil_1.ThsOprate.del, account);
    }
    getTodayData(todayDateStr) {
        return this.specialStockRp
            .createQueryBuilder('special_stock')
            .where('special_stock.tradeDate = :tradeDate', { tradeDate: (0, tradeDateUtil_1.toTradeDate)(todayDateStr) })
            .orWhere('special_stock.tradeDate IS NULL AND DATE(special_stock.createTime) = :tradeDate', {
            tradeDate: (0, tradeDateUtil_1.toTradeDate)(todayDateStr),
        })
            .getOne();
    }
    async findAll() {
        return await this.specialStockRp.find();
    }
    async findByLimit(len = 20) {
        return await this.specialStockRp
            .createQueryBuilder('special_stock')
            .offset(0)
            .limit(len)
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async getLastTradingDayByDB(todayDateStr) {
        var _a, _b;
        const dateArr = await this.specialStockRp
            .createQueryBuilder('special_stock')
            .offset(0)
            .limit(2)
            .select(['special_stock.createTime'])
            .orderBy('createTime', 'DESC')
            .getMany();
        const currentDate = dayjs(todayDateStr).format(pay_back_core_1.iWencaiDateFormat);
        let lastTradingDay = dayjs((_a = dateArr[0]) === null || _a === void 0 ? void 0 : _a.createTime).format(pay_back_core_1.iWencaiDateFormat);
        if (lastTradingDay === currentDate) {
            lastTradingDay = dayjs((_b = dateArr[1]) === null || _b === void 0 ? void 0 : _b.createTime).format(pay_back_core_1.iWencaiDateFormat);
        }
        return lastTradingDay;
    }
    async deleteByCreateTime(date) {
        return await this.specialStockRp
            .createQueryBuilder()
            .delete()
            .where('createTime like :date', { date: date + '%' })
            .execute();
    }
};
SpecialStockService = SpecialStockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(specialStock_entity_1.specialStock)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        ths_service_1.ThsService,
        users_service_1.UsersService])
], SpecialStockService);
exports.SpecialStockService = SpecialStockService;
//# sourceMappingURL=specialStock.service.js.map