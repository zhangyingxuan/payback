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
exports.hotList = void 0;
const typeorm_1 = require("typeorm");
let hotList = class hotList {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], hotList.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '热门个股大家都在看Top10', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], hotList.prototype, "stockNormal", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '热门个股价值投资Top10', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], hotList.prototype, "stockValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '热门概念板块Top5', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], hotList.prototype, "plateConcept", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '热门行业板块Top5', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], hotList.prototype, "plateIndustry", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '热门Etf top5', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], hotList.prototype, "hotEtfs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', comment: '创建时间' }),
    __metadata("design:type", typeorm_1.Timestamp)
], hotList.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamp", comment: '更新时间' }),
    __metadata("design:type", typeorm_1.Timestamp)
], hotList.prototype, "updatedTime", void 0);
hotList = __decorate([
    (0, typeorm_1.Entity)()
], hotList);
exports.hotList = hotList;
const test = {
    name: '',
    code: '',
    hotTag: '',
    tag: '',
    rise_and_fall: '',
};
//# sourceMappingURL=hotList.entity.js.map