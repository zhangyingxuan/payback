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
exports.marketData = void 0;
const typeorm_1 = require("typeorm");
let marketData = class marketData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], marketData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '大盘评级', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], marketData.prototype, "marketScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上涨家数', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], marketData.prototype, "riseAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '下跌家数', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], marketData.prototype, "fallAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '昨日涨停今日收益', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], marketData.prototype, "dailyLimitIncome", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上证点数', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], marketData.prototype, "shangzhengPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '深圳点数', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], marketData.prototype, "shenzhengPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '创业板点数', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], marketData.prototype, "chuangyePoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '北证50点数', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], marketData.prototype, "beizheng50Point", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上涨>=5%家数', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], marketData.prototype, "riseMore5", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '下跌>=5%家数', type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], marketData.prototype, "fallMore5", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上涨幅度最大的概念板块TOP5', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], marketData.prototype, "gainianRiseFloat", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '下跌幅度最大的概念板块TOP5', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], marketData.prototype, "gainianFallFloat", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上涨幅度最大的行业板块TOP5', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], marketData.prototype, "hangyeRiseFloat", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '下跌幅度最大的行业板块TOP5', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], marketData.prototype, "hangyeFallFloat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], marketData.prototype, "createTime", void 0);
marketData = __decorate([
    (0, typeorm_1.Entity)()
], marketData);
exports.marketData = marketData;
//# sourceMappingURL=marketData.entity.js.map