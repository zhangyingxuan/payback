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
var ShorTermService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShorTermService = void 0;
const common_1 = require("@nestjs/common");
const create_pay_back_dto_1 = require("../dto/create-pay-back.dto");
const typeorm_1 = require("typeorm");
const shortTermData_entity_1 = require("../entities/shortTermData.entity");
const typeorm_2 = require("@nestjs/typeorm");
const shortTermUtil_1 = require("../utils/shortTermUtil");
const ths_service_1 = require("./ths.service");
const dayjs = require("dayjs");
const schedule_1 = require("@nestjs/schedule");
let ShorTermService = ShorTermService_1 = class ShorTermService {
    constructor(thsService, shortTermDataRp) {
        this.thsService = thsService;
        this.shortTermDataRp = shortTermDataRp;
        this.logger = new common_1.Logger(ShorTermService_1.name);
    }
    async autoCrawlShortTermDataLateSession() {
        const result = await this.crawlShortTermData();
        process.env.NODE_ENV !== 'dev' && this.thsService.modifyThsSelfStocks(JSON.parse(result.evenBoardData));
    }
    async autoCrawlShortTermDataMidday() {
        this.crawlShortTermData();
    }
    async autoRemoveLessThanExpect() {
        const result = (0, shortTermUtil_1.autoRemoveLessThanExpect)();
    }
    async autoCrawlBinddingData() {
        this.logger.debug('autoSelectExceededExpect is Begining!');
        let isExist = false;
        const todayDateStr = new Date().toLocaleDateString();
        const todayDataFromDB = await this.shortTermDataRp
            .createQueryBuilder('short_term_data')
            .where("short_term_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
            .getOne();
        if (todayDataFromDB) {
            isExist = true;
        }
        let createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
        try {
            const dailyLimitYesterdayBiddingDto = await (0, shortTermUtil_1.getBiddingData)(todayDateStr);
            createPayBackDto.biddingData = JSON.stringify(dailyLimitYesterdayBiddingDto);
            console.log(createPayBackDto);
            if (isExist) {
                this.logger.log('autoSelectExceededExpect 更新数据');
                await this.shortTermDataRp.update(todayDataFromDB.id, createPayBackDto);
            }
            else {
                this.logger.log('autoSelectExceededExpect 新增数据');
                await this.shortTermDataRp.save(createPayBackDto);
            }
            this.logger.debug('autoSelectExceededExpect is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return createPayBackDto;
    }
    async crawlShortTermData() {
        this.logger.debug('crawlShortTermData is Begining!');
        let isExist = false;
        const todayDateStr = new Date().toLocaleDateString();
        const todayDataFromDB = await this.shortTermDataRp
            .createQueryBuilder('short_term_data')
            .where("short_term_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
            .getOne();
        if (todayDataFromDB) {
            isExist = true;
        }
        let createPayBackDto;
        try {
            createPayBackDto = await (0, shortTermUtil_1.getShortTermData)(todayDateStr);
            console.log(createPayBackDto);
            if (isExist) {
                this.logger.log('crawlShortTermData 更新数据');
                await this.shortTermDataRp.update(todayDataFromDB.id, createPayBackDto);
            }
            else {
                this.logger.log('crawlShortTermData 新增数据');
                await this.shortTermDataRp.save(createPayBackDto);
            }
            this.logger.debug('crawlShortTermData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return createPayBackDto;
    }
    async crawlShortTermDataByDate(todayDateStr) {
        this.logger.debug('crawlShortTermDataByDate is Begining!');
        const todayDataFromDB = await this.shortTermDataRp
            .createQueryBuilder('short_term_data')
            .where("short_term_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
            .getOne();
        if (todayDataFromDB) {
            this.logger.debug('crawlShortTermData is end![isExist]');
            return {
                code: 'isExist',
                msg: todayDateStr + ' 数据已存在！',
            };
        }
        let createPayBackDto;
        try {
            createPayBackDto = await (0, shortTermUtil_1.getShortTermDataByDate)(todayDateStr);
            console.log(createPayBackDto);
            await this.shortTermDataRp.save(createPayBackDto);
            this.logger.debug('crawlShortTermDataByDate is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return createPayBackDto;
    }
    async findAll() {
        return await this.shortTermDataRp.find();
    }
    async findByLimit(len = 20) {
        return await this.shortTermDataRp
            .createQueryBuilder('short_term_data')
            .offset(0)
            .limit(len)
            .select(['short_term_data.dailyLimitQuantity',
            'short_term_data.downLimitQuantity',
            'short_term_data.marketHeight',
            'short_term_data.evenBoardAmount',
            'short_term_data.createTime'])
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async findEvenBoardByLimit(len = 20) {
        return await this.shortTermDataRp
            .createQueryBuilder('short_term_data')
            .offset(0)
            .limit(len)
            .select(['short_term_data.createTime',
            'short_term_data.evenBoardAmount',
            'short_term_data.dailyLimitQuantity',
            'short_term_data.downLimitQuantity',
            'short_term_data.sealingRate',
            'short_term_data.dailyLimitReturnSealQuantity',
            'short_term_data.evenBoardData',
            'short_term_data.biddingData',
            'short_term_data.hugeFallData',
            'short_term_data.cycle',
            'short_term_data.downLimitData'])
            .orderBy('createTime', 'DESC')
            .getMany();
    }
};
__decorate([
    (0, schedule_1.Cron)('0 20 15 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShorTermService.prototype, "autoCrawlShortTermDataLateSession", null);
__decorate([
    (0, schedule_1.Cron)('0 36 11 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShorTermService.prototype, "autoCrawlShortTermDataMidday", null);
__decorate([
    (0, schedule_1.Cron)('08 25 9 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShorTermService.prototype, "autoCrawlBinddingData", null);
ShorTermService = ShorTermService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(shortTermData_entity_1.shortTermData)),
    __metadata("design:paramtypes", [ths_service_1.ThsService,
        typeorm_1.Repository])
], ShorTermService);
exports.ShorTermService = ShorTermService;
//# sourceMappingURL=shortTerm.service.js.map