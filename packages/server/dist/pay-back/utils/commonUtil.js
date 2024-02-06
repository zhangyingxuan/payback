"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastTradingDay = exports.getStocksDataByIwencai = exports.getIwencaiData = exports.fundsToFixed = exports.toFixed = exports.ignoreGainianPlateStr = exports.ignoreGainianPlates = void 0;
const dayjs = require("dayjs");
exports.ignoreGainianPlates = ['融资融券', '深股通', '沪股通', '标普道琼斯A股', 'MSCI概念'];
exports.ignoreGainianPlateStr = (function prepareConditionStr() {
    return exports.ignoreGainianPlates
        .map(item => {
        return `指数简称不包含${item};`;
    })
        .join(',');
})();
function toFixed(num, floatLen = 2) {
    if (!num)
        return;
    if (typeof num == 'string') {
        num = +num;
    }
    return +num.toFixed(floatLen);
}
exports.toFixed = toFixed;
function fundsToFixed(num, floatLen = 2) {
    if (!num)
        return;
    if (typeof num == 'string') {
        num = +num;
    }
    return +(num / 100000000).toFixed(floatLen);
}
exports.fundsToFixed = fundsToFixed;
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
function getStocksDataByIwencai(responseJson) {
    let data = [];
    let length = 0;
    try {
        const result = responseJson.data.answer[0].txt[0].content.components[0].data;
        data = result.datas;
        length = result.meta.extra.row_count;
    }
    catch (e) {
        console.log('[error log] getIwencaiData 数据结构错误！', e);
    }
    return {
        data,
        length,
    };
}
exports.getStocksDataByIwencai = getStocksDataByIwencai;
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
exports.default = {
    ignoreGainianPlates: exports.ignoreGainianPlates,
    ignoreGainianPlateStr: exports.ignoreGainianPlateStr,
    getIwencaiData,
    toFixed,
    fundsToFixed,
    getLastTradingDay,
};
//# sourceMappingURL=commonUtil.js.map