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
var PayBackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayBackService = void 0;
const common_1 = require("@nestjs/common");
const create_pay_back_dto_1 = require("./dto/create-pay-back.dto");
const typeorm_1 = require("typeorm");
const shortTermData_entity_1 = require("./entities/shortTermData.entity");
const typeorm_2 = require("@nestjs/typeorm");
const playWrightUtil_1 = require("./utils/playWrightUtil");
const config_1 = require("./utils/config");
const transformDataUtil_1 = require("./utils/transformDataUtil");
const dayjs = require("dayjs");
const schedule_1 = require("@nestjs/schedule");
let PayBackService = PayBackService_1 = class PayBackService {
    constructor(shortTermDataRp) {
        this.shortTermDataRp = shortTermDataRp;
        this.logger = new common_1.Logger(PayBackService_1.name);
    }
    async crawlShortTermData() {
        this.logger.debug('crawlShortTermData is Begining!');
        const todayDateStr = new Date().toLocaleDateString();
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
        let createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
        const dailyLimitData = await playWrightUtil_1.default.getShortTermData(config_1.iwencaiUrl + config_1.params.dailyLimitMoreThan1, 'chart/get-robot-data');
        const downLimitData = await playWrightUtil_1.default.getShortTermData(config_1.iwencaiUrl + config_1.params.downLimit, 'chart/get-robot-data');
        let { SZAmount = 0, SHAmount = 0, board1 = 0, evenBoardData } = transformDataUtil_1.default.transformShortTermSourceData(dailyLimitData, todayDateStr);
        createPayBackDto.createTime = new Date();
        createPayBackDto.downLimitQuantity = downLimitData.length;
        createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
        createPayBackDto.marketHeight = evenBoardData.maxHeight;
        createPayBackDto.board1 = board1;
        createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
        createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
        createPayBackDto.SZAmount = SZAmount;
        createPayBackDto.SHAmount = SHAmount;
        await this.shortTermDataRp.save(createPayBackDto);
        this.logger.debug('Called is success!');
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
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async findOne(id) {
        return `This action findOne a #${id} payBack`;
    }
    async update(id, updatePayBackDto) {
        return await this.shortTermDataRp.update(id, updatePayBackDto);
    }
    async remove(id) {
        return `This action removes a #${id} payBack`;
    }
};
__decorate([
    (0, schedule_1.Cron)('0 0 17 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayBackService.prototype, "crawlShortTermData", null);
PayBackService = PayBackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(shortTermData_entity_1.shortTermData)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], PayBackService);
exports.PayBackService = PayBackService;
//# sourceMappingURL=shortTerm.service.js.map