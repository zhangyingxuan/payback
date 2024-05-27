"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForwardedForMiddleware = void 0;
const common_1 = require("@nestjs/common");
let ForwardedForMiddleware = class ForwardedForMiddleware {
    use(req, res, next) {
        req.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log(req.headers['x-forwarded-for'], req.socket.remoteAddress);
        next();
    }
};
ForwardedForMiddleware = __decorate([
    (0, common_1.Injectable)()
], ForwardedForMiddleware);
exports.ForwardedForMiddleware = ForwardedForMiddleware;
//# sourceMappingURL=forward.middleware.js.map