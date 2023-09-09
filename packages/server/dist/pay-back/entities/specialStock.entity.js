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
exports.specialStock = void 0;
const typeorm_1 = require("typeorm");
let specialStock = class specialStock {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], specialStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '昨日涨停今日集合竞价情况', type: 'varchar', length: 10240, nullable: true }),
    __metadata("design:type", String)
], specialStock.prototype, "biddingData", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '新股数据', type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], specialStock.prototype, "newStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '策略选股', type: 'varchar', length: 3072, nullable: true }),
    __metadata("design:type", String)
], specialStock.prototype, "chooseStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '主力净流入TOP3个股', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], specialStock.prototype, "fundsLikeStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '近1个月涨幅最高的个股Top3', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], specialStock.prototype, "heightestStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], specialStock.prototype, "createTime", void 0);
specialStock = __decorate([
    (0, typeorm_1.Entity)()
], specialStock);
exports.specialStock = specialStock;
//# sourceMappingURL=specialStock.entity.js.map