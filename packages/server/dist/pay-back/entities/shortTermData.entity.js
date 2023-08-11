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
exports.shortTermData = void 0;
const typeorm_1 = require("typeorm");
let shortTermData = class shortTermData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], shortTermData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停数量', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "dailyLimitQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停打开数量', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "dailyLimitOpenQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停回封数量', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "dailyLimitReturnSealQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停封板率', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "sealingRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '跌停数量', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "downLimitQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '最高连板，市场高度', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "marketHeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '连板数量', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "evenBoardAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '连板原始数据', type: 'text' }),
    __metadata("design:type", String)
], shortTermData.prototype, "evenBoardData", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '跌停数据', type: 'varchar', length: 3072, default: '' }),
    __metadata("design:type", String)
], shortTermData.prototype, "downLimitData", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '跌幅大于等于15的个股', type: 'varchar', length: 1024, default: '' }),
    __metadata("design:type", String)
], shortTermData.prototype, "hugeFallData", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '1板数量', type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], shortTermData.prototype, "board1", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '短线周期', type: 'varchar', length: 30, default: '' }),
    __metadata("design:type", String)
], shortTermData.prototype, "cycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], shortTermData.prototype, "createTime", void 0);
shortTermData = __decorate([
    (0, typeorm_1.Entity)()
], shortTermData);
exports.shortTermData = shortTermData;
//# sourceMappingURL=shortTermData.entity.js.map