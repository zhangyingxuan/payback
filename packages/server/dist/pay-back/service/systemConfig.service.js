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
var SystemConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const systemConfig_entity_1 = require("../entities/systemConfig.entity");
const typeorm_2 = require("@nestjs/typeorm");
let SystemConfigService = SystemConfigService_1 = class SystemConfigService {
    constructor(sysTemconfigServiceRp) {
        this.sysTemconfigServiceRp = sysTemconfigServiceRp;
        this.logger = new common_1.Logger(SystemConfigService_1.name);
    }
    async findAll() {
        return await this.sysTemconfigServiceRp.find();
    }
    async updateSystemConfig(systemConfigDto) {
        const currentConfig = await this.findLatestOne();
        let result;
        try {
            this.logger.debug('updateSystemConfig 更新数据 start');
            await this.sysTemconfigServiceRp.update(currentConfig.id, systemConfigDto);
            this.logger.debug('updateSystemConfig is success!');
            result = '更新成功';
        }
        catch (e) {
            this.logger.error('出错啦！！！', e);
            result = '出错啦！！！' + e;
        }
        return result;
    }
    async findLatestOne() {
        return await this.sysTemconfigServiceRp
            .createQueryBuilder('system_config')
            .offset(0)
            .limit(1)
            .orderBy('createTime', 'DESC')
            .getOne();
    }
};
SystemConfigService = SystemConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(systemConfig_entity_1.systemConfig)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], SystemConfigService);
exports.SystemConfigService = SystemConfigService;
//# sourceMappingURL=systemConfig.service.js.map