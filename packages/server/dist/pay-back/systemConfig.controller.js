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
var SystemConfigController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigController = void 0;
const common_1 = require("@nestjs/common");
const systemConfig_service_1 = require("./service/systemConfig.service");
const config_1 = require("../scheduler-task/config");
const scheduler_task_service_1 = require("../scheduler-task/scheduler-task.service");
const microservices_1 = require("@nestjs/microservices");
class SystemConfigDto {
}
let SystemConfigController = SystemConfigController_1 = class SystemConfigController {
    constructor(systemConfigService, schedulerTaskService, pushServer) {
        this.systemConfigService = systemConfigService;
        this.schedulerTaskService = schedulerTaskService;
        this.pushServer = pushServer;
        this.logger = new common_1.Logger(SystemConfigController_1.name);
    }
    async fetchSystemConfig() {
        const config = await this.systemConfigService.findLatestOne();
        return {
            code: 0,
            data: config,
        };
    }
    async updateSystemConfig(body) {
        const config = await this.systemConfigService.findLatestOne();
        const result = await this.systemConfigService.updateSystemConfig(Object.assign(Object.assign({}, config), body));
        return {
            code: 0,
            data: result,
        };
    }
    async toggleNewsPushEnable(body) {
        try {
            const doesExist = this.schedulerTaskService.doesExist('cron', config_1.newsPushSchedulerTask.taskName);
            if (body.isAutoPushNews) {
                !doesExist &&
                    this.schedulerTaskService.executeTask(config_1.newsPushSchedulerTask.taskName, config_1.newsPushSchedulerTask.cron, () => {
                        console.log('执行定时任务 - ', config_1.newsPushSchedulerTask.service, config_1.newsPushSchedulerTask.func);
                        this[config_1.newsPushSchedulerTask.service].emit(config_1.newsPushSchedulerTask.func, {});
                    });
            }
            else {
                doesExist && this.schedulerTaskService.deleteCron(config_1.newsPushSchedulerTask.taskName);
            }
            await this.systemConfigService.updateSystemConfig(body);
        }
        catch (e) {
            this.logger.error(e);
            return {
                code: 1,
                message: e.message,
            };
        }
        return {
            code: 0,
            data: null,
        };
    }
};
__decorate([
    (0, common_1.Get)('fetchSystemConfig'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemConfigController.prototype, "fetchSystemConfig", null);
__decorate([
    (0, common_1.Post)('/updateSystemConfig'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SystemConfigDto]),
    __metadata("design:returntype", Promise)
], SystemConfigController.prototype, "updateSystemConfig", null);
__decorate([
    (0, common_1.Post)('/toggleNewsPushEnable'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SystemConfigDto]),
    __metadata("design:returntype", Promise)
], SystemConfigController.prototype, "toggleNewsPushEnable", null);
SystemConfigController = SystemConfigController_1 = __decorate([
    (0, common_1.Controller)('system-config'),
    __param(2, (0, common_1.Inject)('PUSH_SERVER')),
    __metadata("design:paramtypes", [systemConfig_service_1.SystemConfigService,
        scheduler_task_service_1.SchedulerTaskService,
        microservices_1.ClientProxy])
], SystemConfigController);
exports.SystemConfigController = SystemConfigController;
//# sourceMappingURL=systemConfig.controller.js.map