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
const systemConfig_service_1 = require("./systemConfig.service");
const thsUtils_1 = require("../utils/thsUtils");
const qyWechatNotice_service_1 = require("./qyWechatNotice.service");
let isSuccess = true;
function prepareSelfStock(i, stocks, app, userid, ticket, user, account) {
    if (stocks) {
        for (let j = 0; j < stocks.length; j++) {
            (0, pay_back_core_1.dailyLimitOptionalStrategy)(stocks[j], i) &&
                app.add(async (ctx, next) => {
                    const result = await (0, fetchUtil_1.modifyThsSelfStocksRequest)(stocks[j].code, userid, ticket, user);
                    isSuccess = (0, thsUtils_1.dealResultIsLogin)(result, ctx, account);
                    isSuccess && next();
                });
        }
    }
}
let ThsService = ThsService_1 = class ThsService {
    constructor(usersService, systemConfigService, qyWechatNotice) {
        this.usersService = usersService;
        this.systemConfigService = systemConfigService;
        this.qyWechatNotice = qyWechatNotice;
        this.logger = new common_1.Logger(ThsService_1.name);
        this.latestTime = Math.round(new Date().getTime() / 1000).toString();
    }
    async autoModifyThsSelfStocks(evenBoardData, account) {
        const sysTemconfig = await this.systemConfigService.findLatestOne();
        const isAutoAddSelf = sysTemconfig.isAutoAddSelf;
        if (!isAutoAddSelf) {
            return;
        }
        const userInfo = await this.usersService.getUserByAccount(account);
        const isAutoAddSelfEvenBoard = sysTemconfig ? sysTemconfig.isAutoAddSelfEvenBoard : true;
        const isAutoAddSelfFirstBoard = sysTemconfig ? sysTemconfig.isAutoAddSelfFirstBoard : true;
        const userid = (0, thsUtils_1.atob)(userInfo.userid);
        const ticket = userInfo.ticket;
        const user = userInfo.user;
        isSuccess = true;
        try {
            const app = new pay_back_core_1.AsynTaskIterator();
            this.logger.log(`同步自选: [高标] ${evenBoardData['gaobiao'] && evenBoardData['gaobiao'].length}；`);
            isAutoAddSelfEvenBoard && prepareSelfStock(9, evenBoardData['gaobiao'], app, userid, ticket, user, account);
            const maxHeight = evenBoardData.maxHeight;
            for (let i = maxHeight; i >= 1; i--) {
                this.logger.log(`同步自选: [${i}板] ${evenBoardData[i + ''] && evenBoardData[i + ''].length}；`);
                const stocks = evenBoardData[i + ''];
                if (i === 1) {
                    isAutoAddSelfFirstBoard && prepareSelfStock(i, stocks, app, userid, ticket, user, account);
                }
                else {
                    isAutoAddSelfEvenBoard && prepareSelfStock(i, stocks, app, userid, ticket, user, account);
                }
            }
            app.run(this);
        }
        catch (e) {
            isSuccess = false;
            this.logger.log('同步自选 失败了！' + e);
        }
        return {
            code: isSuccess ? 0 : 400,
        };
    }
    async batchUpdateThsSelfStock(stocks = [], type, account) {
        const sysTemconfig = await this.systemConfigService.findLatestOne();
        const isBinddingDelEventBoard = sysTemconfig.isBinddingDelEventBoard;
        const isBinddingDelFirstBoard = sysTemconfig.isBinddingDelFirstBoard;
        const app = new pay_back_core_1.AsynTaskIterator();
        const userInfo = await this.usersService.getUserByAccount(account);
        const userid = (0, thsUtils_1.atob)(userInfo.userid);
        const ticket = userInfo.ticket;
        const user = userInfo.user;
        isSuccess = true;
        try {
            stocks.forEach(stock => {
                app.add(async (ctx, next) => {
                    let result = {};
                    if (!stock.evenDays) {
                        isBinddingDelEventBoard &&
                            (result = await (0, fetchUtil_1.modifyThsSelfStocksRequest)(stock.code, userid, ticket, user, type));
                    }
                    else {
                        isBinddingDelFirstBoard &&
                            (result = await (0, fetchUtil_1.modifyThsSelfStocksRequest)(stock.code, userid, ticket, user, type));
                    }
                    isSuccess = (0, thsUtils_1.dealResultIsLogin)(result, ctx, account);
                    isSuccess && next();
                });
            });
            app.run(this);
        }
        catch (e) {
            isSuccess = false;
            this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
        }
        return {
            code: isSuccess ? 0 : 400,
        };
    }
    async updateThsSelfStock(code, type, account) {
        const userInfo = await this.usersService.getUserByAccount(account);
        this.logger.log('[updateThsSelfPlate] 加入自选个股' + code);
        const userid = (0, thsUtils_1.atob)(userInfo.userid);
        const ticket = userInfo.ticket;
        const user = userInfo.user;
        let msg = '';
        try {
            const result = await (0, fetchUtil_1.modifyThsSelfRequest)(code, userid, ticket, user, type);
            msg = (0, thsUtils_1.dealPlateResult)(result, type, this.usersService, account);
        }
        catch (e) {
            msg = e;
            this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
        }
        return {
            code: msg ? 400 : 0,
            data: msg,
        };
    }
    async updateThsSelfPlate(code, type, account) {
        const userInfo = await this.usersService.getUserByAccount(account);
        this.logger.log('[updateThsSelfPlate] 加入自选板块' + code);
        const userid = (0, thsUtils_1.atob)(userInfo.userid);
        const ticket = userInfo.ticket;
        const user = userInfo.user;
        let msg = '';
        try {
            const result = await (0, fetchUtil_1.modifyThsSelfRequest)(code, userid, ticket, user, type, true);
            msg = (0, thsUtils_1.dealPlateResult)(result, type, this.usersService, account);
        }
        catch (e) {
            msg = e;
            this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
        }
        return {
            code: msg ? 400 : 0,
            data: msg,
        };
    }
    async fetchNewsTask() {
        var _a;
        const result = await (0, fetchUtil_1.fetchNewsRequest)(this.latestTime);
        const list = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.list;
        this.logger.log('[fetchNewsTask] 获取新闻数据: ' + this.latestTime + '，条数：' + (list === null || list === void 0 ? void 0 : list.length));
        const oldTime = this.latestTime;
        list &&
            list.forEach((news, i) => {
                if (i === 0) {
                    this.latestTime = news.ctime;
                }
                if (news.color === '2') {
                    try {
                        this.qyWechatNotice.noticeNews(news.title, news.digest, news.url, news);
                    }
                    catch (e) {
                        this.logger.log('[fetchNewsTask] 推送消息失败：' + e);
                        this.latestTime = oldTime;
                    }
                }
            });
    }
};
ThsService = ThsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        systemConfig_service_1.SystemConfigService,
        qyWechatNotice_service_1.QyWechatNotice])
], ThsService);
exports.ThsService = ThsService;
//# sourceMappingURL=ths.service.js.map