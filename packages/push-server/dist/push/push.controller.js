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
exports.PushController = void 0;
const common_1 = require("@nestjs/common");
const push_service_1 = require("./push.service");
const microservices_1 = require("@nestjs/microservices");
let PushController = class PushController {
    constructor(pushService) {
        this.pushService = pushService;
    }
    noticeNews(newsTitle, msgContent = '哎哟，不错哦', newsUrl, news) {
        return this.pushService.noticeNews(newsTitle, msgContent, newsUrl, news);
    }
    notice(serviceName, msgContent) {
        return this.pushService.notice(serviceName, msgContent);
    }
};
__decorate([
    (0, microservices_1.EventPattern)('noticeNews'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Object)
], PushController.prototype, "noticeNews", null);
__decorate([
    (0, microservices_1.EventPattern)('notice'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Object)
], PushController.prototype, "notice", null);
PushController = __decorate([
    (0, common_1.Controller)('push'),
    __metadata("design:paramtypes", [push_service_1.PushService])
], PushController);
exports.PushController = PushController;
//# sourceMappingURL=push.controller.js.map