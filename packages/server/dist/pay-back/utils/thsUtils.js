"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealPlateResult = exports.dealStockResult = exports.dealResultIsLogin = exports.getIwencaiCookie = exports.atob = void 0;
const fetchUtil_1 = require("../core/fetchUtil");
const common_1 = require("@nestjs/common");
function atob(a) {
    return Buffer.from(a, 'base64').toString('binary');
}
exports.atob = atob;
function getIwencaiCookie(user) {
    if (!(user === null || user === void 0 ? void 0 : user.user) || !(user === null || user === void 0 ? void 0 : user.ticket)) {
        throw new common_1.InternalServerErrorException('当前用户缺少爱问财登录信息');
    }
    return `user=${user.user}; ticket=${user.ticket}${user.userid ? `; userid=${atob(user.userid)}` : ''}`;
}
exports.getIwencaiCookie = getIwencaiCookie;
function dealResultIsLogin(result, userServiceCtx, account) {
    if (result.errorMsg === '当前用户未登录') {
        console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
        userServiceCtx.clearUserInfoCache && userServiceCtx.clearUserInfoCache(account);
        return false;
    }
    return true;
}
exports.dealResultIsLogin = dealResultIsLogin;
function dealStockResult(result, userServiceCtx, account) {
    let msg = '';
    if (result.errorCode !== 0) {
        if (result.errorMsg === '当前用户未登录') {
            console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
            userServiceCtx.clearUserInfoCache && userServiceCtx.clearUserInfoCache(account);
        }
        msg = result.errorMsg;
    }
    return msg;
}
exports.dealStockResult = dealStockResult;
function dealPlateResult(result, type = fetchUtil_1.ThsOprate.add, userServiceCtx, account) {
    let msg = '';
    if (result.status_code !== 0) {
        if (result.status_msg === '用户ID缺失') {
            console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
            userServiceCtx.clearUserInfoCache && userServiceCtx.clearUserInfoCache(account);
        }
        msg = result.status_msg;
    }
    else {
        const resultData = result.result;
        if (type === fetchUtil_1.ThsOprate.add) {
            resultData.existNum !== 0 && (msg = '已存在该自选');
        }
        else {
            resultData.removeNum === 0 && (msg = '未找到该自选');
        }
    }
    return msg;
}
exports.dealPlateResult = dealPlateResult;
//# sourceMappingURL=thsUtils.js.map