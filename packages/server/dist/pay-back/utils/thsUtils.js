"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealPlateResult = exports.dealStockResult = exports.dealResultIsLogin = exports.atob = void 0;
const fetchUtil_1 = require("../core/fetchUtil");
function atob(a) {
    return Buffer.from(a, 'base64').toString('binary');
}
exports.atob = atob;
function dealResultIsLogin(result, userServiceCtx) {
    if (result.errorMsg === '当前用户未登录') {
        console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
        userServiceCtx.clearUserInfoCache();
        return false;
    }
    return true;
}
exports.dealResultIsLogin = dealResultIsLogin;
function dealStockResult(result, userServiceCtx) {
    let msg = '';
    if (result.errorCode !== 0) {
        if (result.errorMsg === '当前用户未登录') {
            console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
            userServiceCtx.clearUserInfoCache();
        }
        msg = result.errorMsg;
    }
    return msg;
}
exports.dealStockResult = dealStockResult;
function dealPlateResult(result, type = fetchUtil_1.ThsOprate.add, userServiceCtx) {
    let msg = '';
    if (result.status_code !== 0) {
        if (result.status_msg === '用户ID缺失') {
            console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
            userServiceCtx.clearUserInfoCache();
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