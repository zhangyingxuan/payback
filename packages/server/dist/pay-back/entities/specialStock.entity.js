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
    (0, typeorm_1.Column)({ comment: '天地板', type: 'varchar' }),
    __metadata("design:type", String)
], specialStock.prototype, "skyFloor", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '地天板', type: 'varchar' }),
    __metadata("design:type", String)
], specialStock.prototype, "florSky", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '反包板', type: 'varchar' }),
    __metadata("design:type", String)
], specialStock.prototype, "turnUpBoard", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '吃面效应/赚钱效应', type: 'varchar' }),
    __metadata("design:type", String)
], specialStock.prototype, "hotEtfs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' }),
    __metadata("design:type", typeorm_1.Timestamp)
], specialStock.prototype, "createTime", void 0);
specialStock = __decorate([
    (0, typeorm_1.Entity)()
], specialStock);
exports.specialStock = specialStock;
//# sourceMappingURL=specialStock.entity.js.map