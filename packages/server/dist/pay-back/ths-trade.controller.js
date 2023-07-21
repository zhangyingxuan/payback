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
exports.ThsTradeController = void 0;
const common_1 = require("@nestjs/common");
const shortTerm_service_1 = require("./service/shortTerm.service");
const ths_service_1 = require("./service/ths.service");
const apiTest_service_1 = require("./service/apiTest.service");
const public_decorator_1 = require("../decorator/public.decorator");
let ThsTradeController = class ThsTradeController {
    constructor(thsService, shorTermService, apiTestService) {
        this.thsService = thsService;
        this.shorTermService = shorTermService;
        this.apiTestService = apiTestService;
    }
    async modifyThsSelfStocks() {
        const result = (await this.shorTermService.findEvenBoardByLimit(1))[0];
        return this.thsService.modifyThsSelfStocks(JSON.parse(result.evenBoardData));
    }
};
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/modifyThsSelfStocks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "modifyThsSelfStocks", null);
ThsTradeController = __decorate([
    (0, common_1.Controller)('ths-trade'),
    __metadata("design:paramtypes", [ths_service_1.ThsService,
        shortTerm_service_1.ShorTermService,
        apiTest_service_1.ApiTestService])
], ThsTradeController);
exports.ThsTradeController = ThsTradeController;
//# sourceMappingURL=ths-trade.controller.js.map