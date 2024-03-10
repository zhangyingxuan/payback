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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
const cache_manager_1 = require("cache-manager");
const USER_IFNO = 'userInfo';
let UsersService = class UsersService {
    constructor(userRp, cacheManager) {
        this.userRp = userRp;
        this.cacheManager = cacheManager;
    }
    async findOne(user) {
        const result = await this.userRp.find({ where: { account: user.account, password: user.password } });
        return result[0];
    }
    async getUserByAccount(user) {
        let userInfo = await this.cacheManager.get(USER_IFNO);
        if (!userInfo) {
            userInfo = await this.userRp.findOne({ where: { account: user.account } });
            await this.cacheManager.set(USER_IFNO, userInfo, 1000 * 60 * 60 * 24);
        }
        return userInfo;
    }
    async clearUserInfoCache() {
        console.log('清理用户缓存成功');
        return await this.cacheManager.del(USER_IFNO);
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(1, (0, common_1.Inject)(common_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.Repository !== "undefined" && typeorm_1.Repository) === "function" ? _a : Object, typeof (_b = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _b : Object])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map