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
exports.longhuList = void 0;
const typeorm_1 = require("typeorm");
let longhuList = class longhuList {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], longhuList.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '总榜成交', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], longhuList.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '总榜净买', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], longhuList.prototype, "totalBuyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '机构成交', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], longhuList.prototype, "organizationAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '机构净买', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], longhuList.prototype, "organizationBuyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '游资成交', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], longhuList.prototype, "hotMoneyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '游资净买', type: 'decimal', default: 0, precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], longhuList.prototype, "hotMoneyBuyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], longhuList.prototype, "createTime", void 0);
longhuList = __decorate([
    (0, typeorm_1.Entity)()
], longhuList);
exports.longhuList = longhuList;
//# sourceMappingURL=longhuList.entity.js.map