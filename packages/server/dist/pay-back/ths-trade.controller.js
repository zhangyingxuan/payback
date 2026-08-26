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
exports.ThsTradeController = void 0;
const common_1 = require("@nestjs/common");
const shortTerm_service_1 = require("./service/shortTerm.service");
const ths_service_1 = require("./service/ths.service");
const fetchUtil_1 = require("./core/fetchUtil");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ThsTradeController = class ThsTradeController {
    constructor(thsService, shorTermService) {
        this.thsService = thsService;
        this.shorTermService = shorTermService;
    }
    async modifyThsSelfStocks(req) {
        var _a;
        const result = (await this.shorTermService.findEvenBoardByLimit(1))[0];
        return await this.thsService.autoModifyThsSelfStocks(JSON.parse(result.evenBoardData), (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
    }
    async addThsSelfStock(code, req) {
        var _a;
        return this.thsService.updateThsSelfStock(code, fetchUtil_1.ThsOprate.add, (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
    }
    async delThsSelfStock(code, req) {
        var _a;
        return this.thsService.updateThsSelfStock(code, fetchUtil_1.ThsOprate.del, (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
    }
    async addThsSelfPlate(code, req) {
        var _a;
        return this.thsService.updateThsSelfPlate(code, fetchUtil_1.ThsOprate.add, (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
    }
    async delThsSelfPlate(code, req) {
        var _a;
        return this.thsService.updateThsSelfPlate(code, fetchUtil_1.ThsOprate.del, (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
    }
    async addThsSelfPlateByNameCn(plateNameCn, req) {
        var _a;
        return this.thsService.updateThsSelfPlateByNameCn(plateNameCn, fetchUtil_1.ThsOprate.add, (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
    }
    async delThsSelfPlateByNameCn(plateNameCn, req) {
        var _a;
        return this.thsService.updateThsSelfPlateByNameCn(plateNameCn, fetchUtil_1.ThsOprate.del, (_a = req.user) === null || _a === void 0 ? void 0 : _a.account);
    }
};
__decorate([
    (0, common_1.Get)('modifyThsSelfStocks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "modifyThsSelfStocks", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('addThsSelfStock'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "addThsSelfStock", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('delThsSelfStock'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "delThsSelfStock", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('addThsSelfPlate'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "addThsSelfPlate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('delThsSelfPlate'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "delThsSelfPlate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('addThsSelfPlateByNameCn'),
    __param(0, (0, common_1.Body)('plateNameCn')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "addThsSelfPlateByNameCn", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('delThsSelfPlateByNameCn'),
    __param(0, (0, common_1.Body)('plateNameCn')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ThsTradeController.prototype, "delThsSelfPlateByNameCn", null);
ThsTradeController = __decorate([
    (0, common_1.Controller)('ths-trade'),
    __metadata("design:paramtypes", [ths_service_1.ThsService, shortTerm_service_1.ShorTermService])
], ThsTradeController);
exports.ThsTradeController = ThsTradeController;
//# sourceMappingURL=ths-trade.controller.js.map