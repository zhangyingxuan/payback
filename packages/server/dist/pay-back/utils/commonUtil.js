"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIwencaiData = exports.fundsToFixed = exports.toFixed = void 0;
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
exports.default = {
    getIwencaiData,
    toFixed,
    fundsToFixed,
};
//# sourceMappingURL=commonUtil.js.map