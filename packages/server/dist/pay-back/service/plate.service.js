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
var PlateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const plateData_entity_1 = require("../entities/plateData.entity");
const typeorm_2 = require("@nestjs/typeorm");
const plateUtil_1 = require("../utils/plateUtil");
const dayjs = require("dayjs");
const schedule_1 = require("@nestjs/schedule");
let PlateService = PlateService_1 = class PlateService {
    constructor(plateDataRp) {
        this.plateDataRp = plateDataRp;
        this.logger = new common_1.Logger(PlateService_1.name);
    }
    async autoCrawlPlateDataLateSession() {
        this.crawlPlateData();
    }
    async autoCrawlPlateDataMidday() {
        this.crawlPlateData();
    }
    async crawlPlateData() {
        this.logger.debug('crawlPlateData is Begining!');
        const todayDateStr = new Date().toLocaleDateString();
        let plateData;
        try {
            plateData = await plateUtil_1.default.getPlateData(dayjs(todayDateStr).format('YYYYMMDD'));
            const todayDataFromDB = await this.plateDataRp
                .createQueryBuilder('plate_data')
                .where('plate_data.createTime like :createTime', { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
                .getOne();
            if (todayDataFromDB) {
                this.logger.log('crawlPlateData 更新数据');
                await this.plateDataRp.update(todayDataFromDB.id, plateData);
            }
            else {
                this.logger.log('crawlPlateData 新增数据');
                await this.plateDataRp.save(plateData);
            }
            this.logger.debug('crawlPlateData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return plateData;
    }
    async findAll() {
        return await this.plateDataRp.find();
    }
    async findByLimit(len = 20) {
        return await this.plateDataRp
            .createQueryBuilder('plate_data')
            .offset(0)
            .limit(len)
            .select([
            'plate_data.createTime',
            'plate_data.gainianDailyLimitData',
            'plate_data.gainianDailyLimitNum',
            'plate_data.hangyeDailyLimitData',
            'plate_data.hangyeDailyLimitNum',
        ])
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async delteByCreateTime(date) {
        return await this.plateDataRp
            .createQueryBuilder()
            .delete()
            .where('createTime like :date', { date: date + '%' })
            .execute();
    }
};
__decorate([
    (0, schedule_1.Cron)('0 15 15 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlateService.prototype, "autoCrawlPlateDataLateSession", null);
__decorate([
    (0, schedule_1.Cron)('0 33 11 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlateService.prototype, "autoCrawlPlateDataMidday", null);
PlateService = PlateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(plateData_entity_1.plateData)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], PlateService);
exports.PlateService = PlateService;
//# sourceMappingURL=plate.service.js.map