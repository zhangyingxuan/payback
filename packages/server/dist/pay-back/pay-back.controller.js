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
const update_pay_back_dto_1 = require("./dto/update-pay-back.dto");
const public_decorator_1 = require("../decorator/public.decorator");
let PayBackController = class PayBackController {
    constructor(ShorTermService, fundsService, hotListService, reviewService, thsService, apiTestService, latestConceptPlateService, marketService) {
        this.ShorTermService = ShorTermService;
        this.fundsService = fundsService;
        this.hotListService = hotListService;
        this.reviewService = reviewService;
        this.thsService = thsService;
        this.apiTestService = apiTestService;
        this.latestConceptPlateService = latestConceptPlateService;
        this.marketService = marketService;
    }
    async testApi() {
        return await this.apiTestService.datacenterWeb();
    }
    async crawlTodayData() {
        const shortData = await this.ShorTermService.crawlShortTermData();
        const marketData = await this.marketService.crawlMarketData();
        const fundsData = await this.fundsService.crawlfundsData();
        return {
            shortData,
            fundsData,
            marketData
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
    findAll() {
        return this.ShorTermService.findAll();
    }
    update(id, updatePayBackDto) {
        return this.ShorTermService.update(+id, updatePayBackDto);
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
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
__decorate([
    (0, common_1.Get)('queryAll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pay_back_dto_1.UpdatePayBackDto]),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "update", null);
PayBackController = __decorate([
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