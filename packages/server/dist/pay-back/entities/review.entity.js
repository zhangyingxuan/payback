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
    __metadata("design:type", String)
], reviewData.prototype, "cycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '时间周期', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "dateCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '市场评分', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], reviewData.prototype, "marketScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '大盘情绪', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "marketMood", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停数量', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], reviewData.prototype, "dailyLimitQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '短线跌停', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], reviewData.prototype, "downLimitQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '总龙头', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "totalLeader", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '板块龙头', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "plateLeader", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '最强板块', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "strongestPlate", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '最强题材', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "strongestTopic", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '人气股（热榜TOP10除涨停外个股）', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "hotStocks", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '资金青睐个股(资金净流入top3 + 板块)', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], reviewData.prototype, "fundsLikeStocks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], reviewData.prototype, "createTime", void 0);
reviewData = __decorate([
    (0, typeorm_1.Entity)()
], reviewData);
exports.reviewData = reviewData;
//# sourceMappingURL=review.entity.js.map