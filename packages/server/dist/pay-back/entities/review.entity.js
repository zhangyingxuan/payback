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
exports.reviewData = void 0;
const typeorm_1 = require("typeorm");
let reviewData = class reviewData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], reviewData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '短线周期', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", Number)
], reviewData.prototype, "marketScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上涨家数', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], reviewData.prototype, "riseAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上证点数', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], reviewData.prototype, "shangzhengPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '深圳点数', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], reviewData.prototype, "shenzhengPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '上涨幅度最大的行业板块TOP5', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "hangyeRiseFloat", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '下跌幅度最大的行业板块TOP5', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "hangyeFallFloat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], reviewData.prototype, "createTime", void 0);
reviewData = __decorate([
    (0, typeorm_1.Entity)()
], reviewData);
exports.reviewData = reviewData;
//# sourceMappingURL=review.entity.js.map