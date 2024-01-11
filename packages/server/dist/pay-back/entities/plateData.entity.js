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
exports.plateData = void 0;
const typeorm_1 = require("typeorm");
let plateData = class plateData {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], plateData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停家数最多的概念板块个数', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], plateData.prototype, "gainianDailyLimitNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停家数最多的概念板块', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], plateData.prototype, "gainianDailyLimitData", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停家数最多的概念板块个数', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], plateData.prototype, "hangyeDailyLimitNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '涨停家数最多的概念板块', type: 'varchar', length: 512, default: '' }),
    __metadata("design:type", String)
], plateData.prototype, "hangyeDailyLimitData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], plateData.prototype, "createTime", void 0);
plateData = __decorate([
    (0, typeorm_1.Entity)()
], plateData);
exports.plateData = plateData;
//# sourceMappingURL=plateData.entity.js.map