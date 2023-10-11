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
const special_stock_dto_1 = require("../dto/special-stock.dto");
const typeorm_1 = require("typeorm");
const specialStock_entity_1 = require("../entities/specialStock.entity");
const typeorm_2 = require("@nestjs/typeorm");
const transformDataUtil_1 = require("../utils/transformDataUtil");
const specialStockUtil_1 = require("../utils/specialStockUtil");
const dayjs = require("dayjs");
const schedule_1 = require("@nestjs/schedule");
const pay_back_core_1 = require("pay-back-core");
const ths_service_1 = require("./ths.service");
const fetchUtil_1 = require("../core/fetchUtil");
let SpecialStockService = SpecialStockService_1 = class SpecialStockService {
    constructor(specialStockRp, thsService) {
        this.specialStockRp = specialStockRp;
        this.thsService = thsService;
        this.logger = new common_1.Logger(SpecialStockService_1.name);
    }
    async autoCrawlBinddingData() {
        this.crawlBinddingData();
    }
    async autoCrawlBinddingDataLateSession() {
        this.crawlBinddingData();
    }
    async crawlBinddingData(isRemoveIncompatible = false) {
        this.logger.debug('autoCrawlBinddingData is Begining!');
        let isExist = false;
        const todayDateStr = new Date().toLocaleDateString();
        const todayDataFromDB = await this.getTodayData(todayDateStr);
        if (todayDataFromDB) {
            isExist = true;
        }
        let specialStockDto = new special_stock_dto_1.SpecialStockDto();
        try {
            const yesterdayDateStr = await this.getLastTradingDayByDB(todayDateStr);
            const { dailyLimitYesterdayBidding, newStocks, chooseStock1Expected } = await (0, specialStockUtil_1.getBiddingData)(todayDateStr, yesterdayDateStr);
            specialStockDto.biddingData = JSON.stringify(dailyLimitYesterdayBidding);
            specialStockDto.newStock = JSON.stringify(newStocks);
            specialStockDto.chooseStock = JSON.stringify({
                chooseStock1Expected
            });
            this.dealIncompatibleExpectStocks(isRemoveIncompatible, dailyLimitYesterdayBidding);
            console.log(specialStockDto);
            if (isExist) {
                this.logger.log('autoCrawlBinddingData 更新数据');
                await this.specialStockRp.update(todayDataFromDB.id, specialStockDto);
            }
            else {
                this.logger.log('autoCrawlBinddingData 新增数据');
                await this.specialStockRp.save(specialStockDto);
            }
            this.logger.debug('autoCrawlBinddingData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return specialStockDto;
    }
    async dealIncompatibleExpectStocks(isRemoveIncompatible, dailyLimitYesterdayBidding) {
        if (isRemoveIncompatible) {
            const incompatibleExpectStocks = [];
            dailyLimitYesterdayBidding.forEach(stock => {
                if (stock.expected === transformDataUtil_1.ExpectEnum.incompatible) {
                    incompatibleExpectStocks.push(stock);
                }
            });
            this.thsService.batchUpdateThsSelfStock(incompatibleExpectStocks, fetchUtil_1.ThsOprate.del);
        }
    }
    getTodayData(todayDateStr) {
        return this.specialStockRp
            .createQueryBuilder('special_stock')
            .where("special_stock.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
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
        const dateArr = await this.specialStockRp
            .createQueryBuilder('special_stock')
            .offset(0)
            .limit(2)
            .select(['special_stock.createTime'])
            .orderBy('createTime', 'DESC')
            .getMany();
        const currentDate = dayjs(todayDateStr).format(pay_back_core_1.iWencaiDateFormat);
        let lastTradingDay = dayjs(dateArr[0].createTime).format(pay_back_core_1.iWencaiDateFormat);
        if (lastTradingDay === currentDate) {
            lastTradingDay = dayjs(dateArr[1].createTime).format(pay_back_core_1.iWencaiDateFormat);
        }
        return lastTradingDay;
    }
};
__decorate([
    (0, schedule_1.Cron)('00 05 15 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpecialStockService.prototype, "autoCrawlBinddingDataLateSession", null);
SpecialStockService = SpecialStockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(specialStock_entity_1.specialStock)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        ths_service_1.ThsService])
], SpecialStockService);
exports.SpecialStockService = SpecialStockService;
//# sourceMappingURL=specialStock.service.js.map