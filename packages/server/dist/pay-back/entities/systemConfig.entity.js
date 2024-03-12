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
exports.systemConfig = void 0;
const typeorm_1 = require("typeorm");
let systemConfig = class systemConfig {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], systemConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '每日收盘是否自动添加自选个股 0不添加 1添加', type: 'tinyint', width: 1 }),
    __metadata("design:type", Boolean)
], systemConfig.prototype, "isAutoAddSelf", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '自选连板 0不添加 1添加', type: 'tinyint', width: 1 }),
    __metadata("design:type", Boolean)
], systemConfig.prototype, "isAutoAddSelfEvenBoard", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '自选首板 0不添加 1添加', type: 'tinyint', width: 1 }),
    __metadata("design:type", Boolean)
], systemConfig.prototype, "isAutoAddSelfFirstBoard", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '基础配置', type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], systemConfig.prototype, "baseConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '竞价相关配置', type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], systemConfig.prototype, "biddingConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '是否竞价删除 连板', type: 'tinyint', width: 1 }),
    __metadata("design:type", Boolean)
], systemConfig.prototype, "isBinddingDelEventBoard", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '是否竞价删除 首板', type: 'tinyint', width: 1 }),
    __metadata("design:type", Boolean)
], systemConfig.prototype, "isBinddingDelFirstBoard", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], systemConfig.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '更新时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], systemConfig.prototype, "updatedTime", void 0);
systemConfig = __decorate([
    (0, typeorm_1.Entity)()
], systemConfig);
exports.systemConfig = systemConfig;
//# sourceMappingURL=systemConfig.entity.js.map