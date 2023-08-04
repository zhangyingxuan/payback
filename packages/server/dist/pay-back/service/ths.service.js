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
const fetchRequestIterator_1 = require("../core/fetchRequestIterator");
const users_service_1 = require("../../users/users.service");
let isSuccess = true;
function atob(a) {
    return Buffer.from(a, 'base64').toString('binary');
}
;
function isAddSelf(stock, currentLevel) {
    if (stock.type != 0)
        return false;
    if (currentLevel != 1)
        return true;
    return stock.price <= 30 && (stock.circulationValue >= 20 && stock.circulationValue <= 120);
}
function prepareSelfStock(i, stocks, app, userid, ticket, user) {
    if (stocks) {
        for (let j = 0; j < stocks.length; j++) {
            isAddSelf(stocks[j], i) && app.add(async (ctx, next) => {
                const result = await (0, fetchUtil_1.modifyThsSelfStocks)(stocks[j].code, userid, ticket, user);
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
        this.logger.log('同步自选');
        const userInfo = await this.usersService.getUserByAccount('admin');
        const userid = atob(userInfo.userid);
        const ticket = userInfo.ticket;
        const user = userInfo.user;
        try {
            let app = new fetchRequestIterator_1.FetchRequestIterator();
            prepareSelfStock(9, evenBoardData['gaobiao'], app, userid, ticket, user);
            const maxHeight = evenBoardData.maxHeight;
            for (let i = maxHeight; i >= 1; i--) {
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