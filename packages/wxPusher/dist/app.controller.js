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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const public_decorator_1 = require("./decorator/public.decorator");
const ding_dong_bot_1 = require("./utils/ding-dong-bot");
let AppController = class AppController {
    constructor(appService, botInstance) {
        this.appService = appService;
        this.botInstance = botInstance;
    }
    async pushMessage(query) {
        const msg = query.msg;
        const room = await this.botInstance.Contact.find({ name: '太阳' });
        const contactList = await this.botInstance.Contact.findAll();
        if (room) {
            await room.say(msg || '抓到你了');
            return {
                code: 0,
            };
        }
        else {
            console.log('登录错误');
            console.log(contactList.length);
            const bot = (0, ding_dong_bot_1.getRobotInstance)();
            return {
                code: 500,
                msg: '登录错误',
            };
        }
    }
};
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('/pushMessage'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "pushMessage", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)('BotInstance')),
    __metadata("design:paramtypes", [app_service_1.AppService, Object])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map