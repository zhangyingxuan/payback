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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerTaskService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
let SchedulerTaskService = class SchedulerTaskService {
    constructor(schedulerRegistry) {
        this.schedulerRegistry = schedulerRegistry;
    }
    async executeTask(name, cronExpression, callback, needDel) {
        try {
            const job = new cron_1.CronJob(cronExpression, () => {
                if (callback) {
                    callback();
                }
                needDel && this.deleteCron(name);
            });
            this.schedulerRegistry.addCronJob(name, job);
            job.start();
        }
        catch (e) {
            throw new common_1.HttpException(e, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    deleteCron(name) {
        this.schedulerRegistry.deleteCronJob(name);
    }
    doesExist(type, name) {
        return this.schedulerRegistry.doesExist(type, name);
    }
};
SchedulerTaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [schedule_1.SchedulerRegistry])
], SchedulerTaskService);
exports.SchedulerTaskService = SchedulerTaskService;
//# sourceMappingURL=scheduler-task.service.js.map