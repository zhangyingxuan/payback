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
var PayBackController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayBackController = void 0;
const common_1 = require("@nestjs/common");
const shortTerm_service_1 = require("./service/shortTerm.service");
const specialStock_service_1 = require("./service/specialStock.service");
const market_service_1 = require("./service/market.service");
const plate_service_1 = require("./service/plate.service");
const funds_service_1 = require("./service/funds.service");
const hotList_service_1 = require("./service/hotList.service");
const latestConceptPlate_service_1 = require("./service/latestConceptPlate.service");
const review_service_1 = require("./service/review.service");
const ths_service_1 = require("./service/ths.service");
const apiTest_service_1 = require("./service/apiTest.service");
const scheduler_task_service_1 = require("../scheduler-task/scheduler-task.service");
const consul_service_1 = require("../consul/consul.service");
const public_decorator_1 = require("../decorator/public.decorator");
const users_service_1 = require("../users/users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
const dayjs = require("dayjs");
const qyWechatNotice_service_1 = require("./service/qyWechatNotice.service");
const config_1 = require("../scheduler-task/config");
const systemConfig_service_1 = require("./service/systemConfig.service");
const microservices_1 = require("@nestjs/microservices");
const schedulerUtil_1 = require("./utils/schedulerUtil");
class CrawlTodayDataDto {
}
let PayBackController = PayBackController_1 = class PayBackController {
    constructor(shorTermService, specialStockService, fundsService, hotListService, reviewService, thsService, apiTestService, latestConceptPlateService, usersService, marketService, plateService, schedulerTaskService, qyWechatNotice, systemConfigService, consulService, pushServer) {
        this.shorTermService = shorTermService;
        this.specialStockService = specialStockService;
        this.fundsService = fundsService;
        this.hotListService = hotListService;
        this.reviewService = reviewService;
        this.thsService = thsService;
        this.apiTestService = apiTestService;
        this.latestConceptPlateService = latestConceptPlateService;
        this.usersService = usersService;
        this.marketService = marketService;
        this.plateService = plateService;
        this.schedulerTaskService = schedulerTaskService;
        this.qyWechatNotice = qyWechatNotice;
        this.systemConfigService = systemConfigService;
        this.consulService = consulService;
        this.pushServer = pushServer;
        this.logger = new common_1.Logger(PayBackController_1.name);
    }
    async testApi(query) {
    }
    async autoCrawlTodayDataAM() {
        this.logger.debug('[必入]定时任务执行了！0 */5 9-12 * * 1-5');
        const currentTime = dayjs();
        const currentDate = currentTime.format('YYYY-MM-DD');
        if (currentTime.isAfter(currentDate + ' 09:19:00') && currentTime.isBefore(currentDate + ' 11:31:00')) {
            this.logger.debug('[选入]定时任务执行了！0 */5 9-12 * * 1-5');
        }
    }
    async autoCrawlTodayDataPM() {
        this.logger.debug('定时任务执行了！0 */5 13-15 * * 1-5');
    }
    async crawlTodayData(body, req) {
        var _a, _b;
        let short, funds, market, bindding, resultData, plate, specialStock;
        const account = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.account) || 'admin';
        switch (body.fetchTodayDataType) {
            case 0:
                short = this.shorTermService.crawlShortTermData();
                funds = this.fundsService.crawlfundsData();
                market = this.marketService.crawlMarketData();
                bindding = this.specialStockService.crawlBinddingData(0, account);
                specialStock = this.specialStockService.crawlSpecialStockData(account);
                plate = this.plateService.crawlPlateData();
                resultData = {};
                await Promise.all([short, funds, market, bindding, specialStock, plate]);
                break;
            case 1:
                resultData = await this.shorTermService.crawlShortTermData();
                break;
            case 2:
                plate = this.plateService.crawlPlateData();
                market = this.marketService.crawlMarketData();
                await Promise.all([plate, market]);
                break;
            case 3:
                resultData = await this.fundsService.crawlfundsData();
                break;
            case 4:
                const crawlBindding = this.specialStockService.crawlBinddingData(body.isRemoveIncompatible, (_b = req.user) === null || _b === void 0 ? void 0 : _b.account);
                const crawlSpecialStock = this.specialStockService.crawlSpecialStockData(account);
                const [crawlBinddingData, crawlSpecialStockData] = await Promise.all([crawlBindding, crawlSpecialStock]);
                resultData = crawlSpecialStockData;
                break;
            default:
                break;
        }
        return {
            code: 0,
            data: resultData,
        };
    }
    async crawlBinddingData(body, req) {
        var _a;
        let code = 0, message = 'success';
        const binddingData = await this.specialStockService.crawlBinddingData(body.isRemoveIncompatible, (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
        let result = null;
        try {
            const currentDayEventData = await this.shorTermService.findEvenBoardByLimit(3);
            result = currentDayEventData[1];
            result.newStock = binddingData.newStock;
            result.chooseStock = binddingData.chooseStock;
            result.biddingDataUpdateTime = currentDayEventData[0].biddingDataUpdateTime;
        }
        catch (e) {
            this.logger.error(e);
            code = 500;
            message = e;
        }
        return {
            code,
            data: result,
            message
        };
    }
    async crawlSpecialStockData(req) {
        var _a;
        const account = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.account) || 'admin';
        const specialStockData = await this.specialStockService.crawlSpecialStockData(account);
        return {
            code: 0,
            data: specialStockData,
        };
    }
    async deleteData(body) {
        let code = 0, message = 'success';
        try {
            const shorTerm = this.shorTermService.deleteByCreateTime(body.date);
            const specialStock = this.specialStockService.deleteByCreateTime(body.date);
            const market = this.marketService.deleteByCreateTime(body.date);
            const funds = this.fundsService.deleteByCreateTime(body.date);
            const plate = this.plateService.deleteByCreateTime(body.date);
            const hostList = this.hotListService.deleteByCreateTime(body.date);
            await Promise.all([shorTerm, specialStock, market, funds, plate, hostList]);
        }
        catch (e) {
            code = 500;
            message = e;
        }
        return {
            code,
            message,
        };
    }
    async crawlHotListData() {
        const data = await this.hotListService.crawlHotListData();
        return {
            code: 0,
            data,
        };
    }
    crawlShortTermByDate(query) {
        const date = query.date || new Date();
        return this.shorTermService.crawlShortTermDataByDate(date);
    }
    async crawlPlateData() {
        const data = await this.plateService.crawlPlateData();
        return {
            code: 0,
            data,
        };
    }
    async findByLimit(query) {
        const limit = +(query.limit || 20);
        const shortTermData = (await this.shorTermService.findByLimit(limit)).reverse();
        const marketData = (await this.marketService.findByLimit(limit)).reverse();
        const fundsData = (await this.fundsService.findByLimit(limit)).reverse();
        return {
            code: 0,
            data: {
                shortTermData,
                marketData,
                fundsData,
            },
        };
    }
    async fetchEvenBoardData(query) {
        const limit = +(query.limit || 20);
        const shortTermData = await this.shorTermService.findEvenBoardByLimit(limit);
        return {
            code: 0,
            data: shortTermData,
        };
    }
    async fetchHostListData(query) {
        const limit = +(query.limit || 20);
        const hotListData = await this.hotListService.findByLimit(limit);
        return {
            code: 0,
            data: hotListData,
        };
    }
    async fetchReveiwDataByDate(query) {
        const date = query.date || new Date();
        const reviewData = await this.reviewService.findByDate(date);
        return {
            code: 0,
            data: reviewData,
        };
    }
    async findConceptPlateWithinNDays(query) {
        const nDays = +(query.nDays || 15);
        const palateData = await this.latestConceptPlateService.findWithinNDays(nDays);
        return {
            code: 0,
            data: palateData,
        };
    }
    async findConceptPlateByLimit(query) {
        const limit = +(query.limit || 15);
        const palateData = await this.latestConceptPlateService.findByLimit(limit);
        return {
            code: 0,
            data: palateData,
        };
    }
    async findPlateByLimit(query) {
        const limit = +(query.limit || 20);
        const palateData = await this.marketService.findPlateByLimit(limit);
        return {
            code: 0,
            data: palateData,
        };
    }
    async fetchPlateOrderByDailyLimit(query) {
        const limit = +(query.limit || 20);
        const palateData = await this.plateService.findByLimit(limit);
        return {
            code: 0,
            data: palateData,
        };
    }
    async fetchLatestNews(query) {
        const latestTime = query.latestTime || new Date().getTime();
        this.logger.debug('获取最新新闻fetchLatestNews');
        return await this.pushServer.send('fetchLatestNews', latestTime);
    }
    async saveUserInfo(body, req) {
        var _a;
        const { token, user } = body;
        const success = await this.usersService.updateUserInfo((_a = req.user) === null || _a === void 0 ? void 0 : _a.account, token, user);
        return {
            code: success ? 0 : 500,
        };
    }
    async initSchedulerTask() {
        this.logger.debug('initSchedulerTask初始化定时任务');
        await Promise.all(config_1.schedulerTaskList.map(task => this.schedulerTaskService.executeTask(task.taskName, task.cron, () => (0, schedulerUtil_1.executeTaskFunc)(this, task, Number(process.env.TASK_RETRY_TIME) || 3))));
        const config = await this.systemConfigService.findLatestOne();
        const { isAutoPushNews } = config;
        if (isAutoPushNews && process.env.NODE_ENV !== 'dev') {
            this.logger.debug('新闻推送定时任务执行了：' + config_1.newsPushSchedulerTask.cron);
            this.schedulerTaskService.executeTask(config_1.newsPushSchedulerTask.taskName, config_1.newsPushSchedulerTask.cron, () => {
                this.logger.debug('执行定时任务 fetchNewsTask');
                this[config_1.newsPushSchedulerTask.service].emit(config_1.newsPushSchedulerTask.func, {});
            });
        }
    }
};
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('testApi'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "testApi", null);
__decorate([
    (0, common_1.Post)('/crawlTodayData'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CrawlTodayDataDto, Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "crawlTodayData", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/crawlBinddingData'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CrawlTodayDataDto, Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "crawlBinddingData", null);
__decorate([
    (0, common_1.Post)('/crawlSpecialStockData'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "crawlSpecialStockData", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Post)('/deleteData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "deleteData", null);
__decorate([
    (0, common_1.Get)('/crawlHotListData'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "crawlHotListData", null);
__decorate([
    (0, common_1.Get)('/crawlShortTermByDate'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlShortTermByDate", null);
__decorate([
    (0, common_1.Get)('/crawlPlateData'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "crawlPlateData", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "findByLimit", null);
__decorate([
    (0, common_1.Get)('fetchEvenBoardData'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "fetchEvenBoardData", null);
__decorate([
    (0, common_1.Get)('fetchHostListData'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "fetchHostListData", null);
__decorate([
    (0, common_1.Get)('fetchReveiwDataByDate'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "fetchReveiwDataByDate", null);
__decorate([
    (0, common_1.Get)('findConceptPlateWithinNDays'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "findConceptPlateWithinNDays", null);
__decorate([
    (0, common_1.Get)('findConceptPlateByLimit'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "findConceptPlateByLimit", null);
__decorate([
    (0, common_1.Get)('findPlateByLimit'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "findPlateByLimit", null);
__decorate([
    (0, common_1.Get)('fetchPlateOrderByDailyLimit'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "fetchPlateOrderByDailyLimit", null);
__decorate([
    (0, common_1.Get)('fetchLatestNews'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "fetchLatestNews", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('saveUserInfo'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "saveUserInfo", null);
__decorate([
    (0, common_1.Get)('/initSchedulerTask'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "initSchedulerTask", null);
PayBackController = PayBackController_1 = __decorate([
    (0, common_1.Controller)('pay-back'),
    __param(15, (0, common_1.Inject)('PUSH_SERVER')),
    __metadata("design:paramtypes", [shortTerm_service_1.ShorTermService,
        specialStock_service_1.SpecialStockService,
        funds_service_1.FundsService,
        hotList_service_1.HotListService,
        review_service_1.ReviewService,
        ths_service_1.ThsService,
        apiTest_service_1.ApiTestService,
        latestConceptPlate_service_1.LatestConceptPlateService,
        users_service_1.UsersService,
        market_service_1.MarketService,
        plate_service_1.PlateService,
        scheduler_task_service_1.SchedulerTaskService,
        qyWechatNotice_service_1.QyWechatNotice,
        systemConfig_service_1.SystemConfigService,
        consul_service_1.ConsulService,
        microservices_1.ClientProxy])
], PayBackController);
exports.PayBackController = PayBackController;
//# sourceMappingURL=pay-back.controller.js.map