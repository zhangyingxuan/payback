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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const public_decorator_1 = require("../decorator/public.decorator");
const svgCaptcha = require("svg-captcha");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async login(body, req) {
        const { code } = body;
        const storedCaptcha = req.session.captcha;
        if (code && storedCaptcha && code.toLowerCase() === storedCaptcha.toLowerCase()) {
            return await this.authService.login(body, req);
        }
        else {
            return {
                code: 200,
                data: {
                    msg: '验证码错误',
                },
            };
        }
    }
    getProfile(req) {
        return req.user;
    }
    getCode(res, req) {
        var _a;
        const captcha = svgCaptcha.create({
            size: 4,
            noise: 2,
            color: true,
            fontSize: 60,
            inverse: false,
            background: '#F5F7FA',
        });
        req.session.captcha = captcha.text;
        const ip = req.ip;
        const host = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.host;
        const headerRealIP = req === null || req === void 0 ? void 0 : req.headers['x-real-ip'];
        const XForwardedFor = req === null || req === void 0 ? void 0 : req.headers['X-Forwarded-For'];
        this.logger.log(`生产 验证码：1234; ${ip} - ${host}; - ${headerRealIP}; - ${XForwardedFor}`);
        res.set('Content-Type', 'image/svg+xml');
        res.send(captcha.data);
    }
};
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('getCode'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getCode", null);
AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map