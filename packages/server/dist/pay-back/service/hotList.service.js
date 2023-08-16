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
var HotListService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotListService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const hotList_entity_1 = require("../entities/hotList.entity");
const typeorm_2 = require("@nestjs/typeorm");
const hotListUtil_1 = require("../utils/hotListUtil");
const dayjs = require("dayjs");
const schedule_1 = require("@nestjs/schedule");
let HotListService = HotListService_1 = class HotListService {
    constructor(hotListRp) {
        this.hotListRp = hotListRp;
        this.logger = new common_1.Logger(HotListService_1.name);
    }
    async crawlHotListData() {
        let isExist = false;
        this.logger.debug('crawlHotListData is Begining!');
        const todayDateStr = new Date().toLocaleDateString();
        const todayDataFromDB = await this.hotListRp
            .createQueryBuilder('hot_list')
            .where("hot_list.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
            .getOne();
        if (todayDataFromDB) {
            isExist = true;
        }
        let hotListData;
        try {
            hotListData = await (0, hotListUtil_1.getHotListData)();
            const hotListData4Db = {
                stockNormal: JSON.stringify(hotListData.stockNormal),
                stockValue: JSON.stringify(hotListData.stockValue),
                plateConcept: JSON.stringify(hotListData.plateConcept),
                plateIndustry: JSON.stringify(hotListData.plateIndustry),
                updatedTime: hotListData.updatedTime,
                createTime: hotListData.updatedTime,
            };
            if (isExist) {
                this.logger.log('更新数据, id=' + todayDataFromDB.id);
                delete hotListData4Db.createTime;
                await this.hotListRp.update(todayDataFromDB.id, hotListData4Db);
            }
            else {
                this.logger.log('新增数据');
                await this.hotListRp.save(hotListData4Db);
            }
            this.logger.debug('crawlHotListData is success!');
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
        }
        return {
            code: 200,
            data: Object.assign(Object.assign({}, hotListData), { createTime: dayjs(hotListData.updatedTime).format('MM/DD HH:mm') })
        };
    }
    async findAll() {
        return await this.hotListRp.find();
    }
    async findByLimit(len = 20) {
        return await this.hotListRp
            .createQueryBuilder('hot_list_data')
            .offset(0)
            .limit(len)
            .orderBy('createTime', 'DESC')
            .getMany();
    }
};
__decorate([
    (0, schedule_1.Cron)('0 */30 7-23 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HotListService.prototype, "crawlHotListData", null);
HotListService = HotListService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(hotList_entity_1.hotList)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], HotListService);
exports.HotListService = HotListService;
//# sourceMappingURL=hotList.service.js.map