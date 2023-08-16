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
const market_service_1 = require("./service/market.service");
const funds_service_1 = require("./service/funds.service");
const hotList_service_1 = require("./service/hotList.service");
const latestConceptPlate_service_1 = require("./service/latestConceptPlate.service");
const review_service_1 = require("./service/review.service");
const ths_service_1 = require("./service/ths.service");
const apiTest_service_1 = require("./service/apiTest.service");
const public_decorator_1 = require("../decorator/public.decorator");
const dayjs = require("dayjs");
let PayBackController = PayBackController_1 = class PayBackController {
    constructor(ShorTermService, fundsService, hotListService, reviewService, thsService, apiTestService, latestConceptPlateService, marketService) {
        this.ShorTermService = ShorTermService;
        this.fundsService = fundsService;
        this.hotListService = hotListService;
        this.reviewService = reviewService;
        this.thsService = thsService;
        this.apiTestService = apiTestService;
        this.latestConceptPlateService = latestConceptPlateService;
        this.marketService = marketService;
        this.logger = new common_1.Logger(PayBackController_1.name);
    }
    async testApi() {
        return await this.apiTestService.fetchExternalData();
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
    async crawlTodayData(query) {
        const type = +(query.fetchTodayDataType || 0);
        let shortData, fundsData, marketData;
        switch (type) {
            case 0:
                shortData = await this.ShorTermService.crawlShortTermData();
                fundsData = await this.fundsService.crawlfundsData();
                marketData = await this.marketService.crawlMarketData();
                break;
            case 1:
                shortData = await this.ShorTermService.crawlShortTermData();
                break;
            case 2:
                marketData = await this.marketService.crawlMarketData();
                break;
            case 3:
                fundsData = await this.fundsService.crawlfundsData();
                break;
            default:
                break;
        }
        return {
            code: 200,
        };
    }
    crawlHotListData() {
        return this.hotListService.crawlHotListData();
    }
    crawlShortTerm() {
        return this.ShorTermService.crawlShortTermData();
    }
    crawlShortTermDataByDate(query) {
        const date = query.date || new Date();
        return this.ShorTermService.crawlShortTermDataByDate(date);
    }
    crawlMarket() {
        return this.marketService.crawlMarketData();
    }
    crawlFunds() {
        return this.fundsService.crawlfundsData();
    }
    crawlLatestConceptPlate() {
        return this.latestConceptPlateService.crawlLatestConceptPlateData();
    }
    async findByLimit(query) {
        const limit = +(query.limit || 20);
        const shortTermData = (await this.ShorTermService.findByLimit(limit)).reverse();
        const marketData = (await this.marketService.findByLimit(limit)).reverse();
        const fundsData = (await this.fundsService.findByLimit(limit)).reverse();
        return {
            code: 200,
            data: {
                shortTermData,
                marketData,
                fundsData,
            }
        };
    }
    async fetchEvenBoardData(query) {
        const limit = +(query.limit || 20);
        let shortTermData = await this.ShorTermService.findEvenBoardByLimit(limit);
        return {
            code: 200,
            data: shortTermData,
        };
    }
    async fetchHostListData(query) {
        const limit = +(query.limit || 20);
        let hotListData = await this.hotListService.findByLimit(limit);
        return {
            code: 200,
            data: hotListData,
        };
    }
    async fetchReveiwDataByDate(query) {
        const date = query.date || new Date();
        let reviewData = await this.reviewService.findByDate(date);
        return {
            code: 200,
            data: reviewData,
        };
    }
    async findPlateByLimit(query) {
        const limit = +(query.limit || 20);
        let palateData = await this.marketService.findPlateByLimit(limit);
        return {
            code: 200,
            data: palateData,
        };
    }
};
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('testApi'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "testApi", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/crawlTodayData'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "crawlTodayData", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/crawlHotListData'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlHotListData", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/crawlShortTerm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlShortTerm", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/crawlShortTermByDate'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlShortTermDataByDate", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/crawlMarket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlMarket", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/crawlFunds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlFunds", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/crawlLatestConceptPlate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlLatestConceptPlate", null);
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
    (0, common_1.Get)('findPlateByLimit'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "findPlateByLimit", null);
PayBackController = PayBackController_1 = __decorate([
    (0, common_1.Controller)('pay-back'),
    __metadata("design:paramtypes", [shortTerm_service_1.ShorTermService,
        funds_service_1.FundsService,
        hotList_service_1.HotListService,
        review_service_1.ReviewService,
        ths_service_1.ThsService,
        apiTest_service_1.ApiTestService,
        latestConceptPlate_service_1.LatestConceptPlateService,
        market_service_1.MarketService])
], PayBackController);
exports.PayBackController = PayBackController;
//# sourceMappingURL=pay-back.controller.js.map