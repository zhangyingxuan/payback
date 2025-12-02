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
var LatestConceptPlateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatestConceptPlateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const latestConceptPlate_entity_1 = require("../entities/latestConceptPlate.entity");
const typeorm_2 = require("@nestjs/typeorm");
const latestConceptPlateUtil_1 = require("../utils/latestConceptPlateUtil");
let LatestConceptPlateService = LatestConceptPlateService_1 = class LatestConceptPlateService {
    constructor(latestConceptPlateRp) {
        this.latestConceptPlateRp = latestConceptPlateRp;
        this.logger = new common_1.Logger(LatestConceptPlateService_1.name);
    }
    async crawlLatestConceptPlateData() {
        this.logger.debug('crawlLatestConceptPlateData is Begining!');
        const conceptPlate = await this.findLatestOne();
        let latestConceptPlates;
        try {
            latestConceptPlates = await (0, latestConceptPlateUtil_1.getLatestConceptPlate)(conceptPlate);
            if (latestConceptPlates) {
                latestConceptPlates.forEach(async (latestConceptPlate) => {
                    await this.latestConceptPlateRp.save(latestConceptPlate);
                });
            }
            this.logger.debug('crawlLatestConceptPlateData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
            throw new Error(e);
        }
        return latestConceptPlates;
    }
    async findAll() {
        return await this.latestConceptPlateRp.find();
    }
    async findByLimit(len = 20) {
        return await this.latestConceptPlateRp
            .createQueryBuilder('latest_concept_plate')
            .offset(0)
            .limit(len)
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async findWithinNDays(n = 15) {
        const nDaysAgo = new Date();
        nDaysAgo.setDate(nDaysAgo.getDate() - n);
        return await this.latestConceptPlateRp
            .createQueryBuilder('latest_concept_plate')
            .where('latest_concept_plate.createTime > :date', { date: nDaysAgo })
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async findLatestOne() {
        return await this.latestConceptPlateRp
            .createQueryBuilder('latest_concept_plate')
            .offset(0)
            .limit(1)
            .orderBy('id', 'DESC')
            .getOne();
    }
};
LatestConceptPlateService = LatestConceptPlateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(latestConceptPlate_entity_1.latestConceptPlate)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], LatestConceptPlateService);
exports.LatestConceptPlateService = LatestConceptPlateService;
//# sourceMappingURL=latestConceptPlate.service.js.map