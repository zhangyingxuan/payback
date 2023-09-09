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
var ThsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThsService = void 0;
const common_1 = require("@nestjs/common");
const fetchUtil_1 = require("../core/fetchUtil");
const pay_back_core_1 = require("pay-back-core");
const users_service_1 = require("../../users/users.service");
let isSuccess = true;
function atob(a) {
    return Buffer.from(a, 'base64').toString('binary');
}
;
function prepareSelfStock(i, stocks, app, userid, ticket, user) {
    if (stocks) {
        for (let j = 0; j < stocks.length; j++) {
            (0, pay_back_core_1.dailyLimitOptionalStrategy)(stocks[j], i) && app.add(async (ctx, next) => {
                const result = await (0, fetchUtil_1.modifyThsSelfStocksRequest)(stocks[j].code, userid, ticket, user);
                console.log(stocks[j].name, result);
                if (result.errorMsg === '当前用户未登录') {
                    ctx.logger.log('当前用户未登录：https://www.10jqka.com.cn/');
                    isSuccess = false;
                    return;
                }
                next();
            });
        }
    }
}
let ThsService = ThsService_1 = class ThsService {
    constructor(usersService) {
        this.usersService = usersService;
        this.logger = new common_1.Logger(ThsService_1.name);
    }
    async modifyThsSelfStocks(evenBoardData) {
        const userInfo = await this.usersService.getUserByAccount('admin');
        const userid = atob(userInfo.userid);
        const ticket = userInfo.ticket;
        const user = userInfo.user;
        isSuccess = true;
        try {
            let app = new pay_back_core_1.AsynTaskIterator();
            this.logger.log(`同步自选: [高标] ${evenBoardData['gaobiao'] && evenBoardData['gaobiao'].length}；`);
            prepareSelfStock(9, evenBoardData['gaobiao'], app, userid, ticket, user);
            const maxHeight = evenBoardData.maxHeight;
            for (let i = maxHeight; i >= 1; i--) {
                this.logger.log(`同步自选: [${i}板] ${evenBoardData[i + ''] && evenBoardData[i + ''].length}；`);
                const stocks = evenBoardData[i + ''];
                prepareSelfStock(i, stocks, app, userid, ticket, user);
            }
            app.run(this);
        }
        catch (e) {
            isSuccess = false;
            this.logger.log('同步自选 失败了！' + e);
        }
        return {
            code: isSuccess ? 200 : 400,
            data: evenBoardData,
        };
    }
};
ThsService = ThsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], ThsService);
exports.ThsService = ThsService;
//# sourceMappingURL=ths.service.js.map