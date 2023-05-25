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
const update_pay_back_dto_1 = require("./dto/update-pay-back.dto");
let PayBackController = class PayBackController {
    constructor(payBackService, fundsService, marketService) {
        this.payBackService = payBackService;
        this.fundsService = fundsService;
        this.marketService = marketService;
    }
    crawlShortTerm() {
        return this.payBackService.crawlShortTermData();
    }
    crawlMarket() {
        return this.marketService.crawlMarketData();
    }
    crawlFunds() {
        return this.fundsService.crawlfundsData();
    }
    async findByLimit(query) {
        const limit = +(query.limit || 20);
        const shortTermData = (await this.payBackService.findByLimit(limit)).reverse();
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
    findAll() {
        return this.payBackService.findAll();
    }
    findOne(id) {
        return this.payBackService.findOne(+id);
    }
    update(id, updatePayBackDto) {
        return this.payBackService.update(+id, updatePayBackDto);
    }
    remove(id) {
        return this.payBackService.remove(+id);
    }
};
__decorate([
    (0, common_1.Get)('/crawlShortTerm'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlShortTerm", null);
__decorate([
    (0, common_1.Get)('/crawlMarket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlMarket", null);
__decorate([
    (0, common_1.Get)('/crawlFunds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "crawlFunds", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayBackController.prototype, "findByLimit", null);
__decorate([
    (0, common_1.Get)('queryAll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pay_back_dto_1.UpdatePayBackDto]),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayBackController.prototype, "remove", null);
PayBackController = __decorate([
    (0, common_1.Controller)('pay-back'),
    __metadata("design:paramtypes", [shortTerm_service_1.PayBackService,
        funds_service_1.FundsService,
        market_service_1.MarketService])
], PayBackController);
exports.PayBackController = PayBackController;
//# sourceMappingURL=pay-back.controller.js.map