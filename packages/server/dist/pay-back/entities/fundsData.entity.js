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
exports.fundsData = void 0;
const typeorm_1 = require("typeorm");
let fundsData = class fundsData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], fundsData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '北向资金（聪明资金）净流入', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], fundsData.prototype, "northFundsAmtIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '北向资金（聪明资金）净买入', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], fundsData.prototype, "northFundsBuyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '南向资金（到港资金）净流入', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], fundsData.prototype, "southFundsAmtIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '南向资金（到港资金）净买入', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], fundsData.prototype, "southFundsBuyAmt", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '行业板块主力资金Top', type: 'varchar', length: 1024, default: '' }),
    __metadata("design:type", String)
], fundsData.prototype, "hangyeFundsTop", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '概念板块主力资金Top', type: 'varchar', length: 1024, default: '' }),
    __metadata("design:type", String)
], fundsData.prototype, "gainianFundsTop", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '市场成交总额', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], fundsData.prototype, "marketTurnover", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], fundsData.prototype, "createTime", void 0);
fundsData = __decorate([
    (0, typeorm_1.Entity)()
], fundsData);
exports.fundsData = fundsData;
//# sourceMappingURL=fundsData.entity.js.map