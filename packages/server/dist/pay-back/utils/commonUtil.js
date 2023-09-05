"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHoliday = exports.getLastTradingDay = exports.getIwencaiData = exports.fundsToFixed = exports.toFixed = void 0;
const dayjs = require("dayjs");
function toFixed(num, floatLen = 2) {
    if (!num)
        return;
    if (typeof (num) == 'string') {
        num = +num;
    }
    return +(num).toFixed(floatLen);
}
exports.toFixed = toFixed;
;
function fundsToFixed(num, floatLen = 2) {
    if (!num)
        return;
    if (typeof (num) == 'string') {
        num = +num;
    }
    return +(num / 100000000).toFixed(floatLen);
}
exports.fundsToFixed = fundsToFixed;
;
function getIwencaiData(responseJson) {
    let data = [];
    try {
        data = responseJson.data.answer[0].txt[0].content.components[0].data.datas;
    }
    catch (e) {
        console.log('[error log] getIwencaiData 数据结构错误！', e);
    }
    return data;
}
exports.getIwencaiData = getIwencaiData;
;
function getLastTradingDay(nowStr) {
    const dayOfWeek = +dayjs(nowStr).format('ddd');
    let subtractNum = 1;
    switch (dayOfWeek) {
        case 1:
            subtractNum = 3;
            break;
        case 6:
            subtractNum = 1;
            break;
        case 7:
            subtractNum = 2;
            break;
        case 2:
        case 3:
        case 4:
        case 5:
        default:
            break;
    }
    const yesterday = dayjs(nowStr).subtract(subtractNum, 'day').format('YYYYMMDD');
    return yesterday;
}
exports.getLastTradingDay = getLastTradingDay;
function isHoliday(date) {
}
exports.isHoliday = isHoliday;
exports.default = {
    getIwencaiData,
    toFixed,
    fundsToFixed,
    getLastTradingDay,
};
//# sourceMappingURL=commonUtil.js.map