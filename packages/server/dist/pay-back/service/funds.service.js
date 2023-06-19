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
var FundsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const fundsData_entity_1 = require("../entities/fundsData.entity");
const typeorm_2 = require("@nestjs/typeorm");
const playWrightUtil_1 = require("../utils/playWrightUtil");
const dayjs = require("dayjs");
const schedule_1 = require("@nestjs/schedule");
let FundsService = FundsService_1 = class FundsService {
    constructor(fundsDataRp) {
        this.fundsDataRp = fundsDataRp;
        this.logger = new common_1.Logger(FundsService_1.name);
    }
    async crawlfundsData() {
        this.logger.debug('crawlfundsData is Begining!');
        const todayDateStr = new Date().toLocaleDateString();
        const todayDataFromDB = await this.fundsDataRp
            .createQueryBuilder('market_data')
            .where("market_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
            .getOne();
        if (todayDataFromDB) {
            this.logger.debug('crawlfundsData is end![isExist]!');
            return {
                code: 'isExist',
                msg: todayDateStr + ' 数据已存在！',
            };
        }
        let fundsData;
        try {
            fundsData = await playWrightUtil_1.default.getFundsData(dayjs(todayDateStr).format('YYYYMMDD'));
            console.log(fundsData);
            await this.fundsDataRp.save(fundsData);
            this.logger.debug('crawlfundsData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return fundsData;
    }
    async findAll() {
        return await this.fundsDataRp.find();
    }
    async findByLimit(len = 20) {
        return await this.fundsDataRp
            .createQueryBuilder('funds_data')
            .offset(0)
            .limit(len)
            .orderBy('createTime', 'DESC')
            .getMany();
    }
};
__decorate([
    (0, schedule_1.Cron)('0 0 18 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FundsService.prototype, "crawlfundsData", null);
FundsService = FundsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(fundsData_entity_1.fundsData)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], FundsService);
exports.FundsService = FundsService;
//# sourceMappingURL=funds.service.js.map