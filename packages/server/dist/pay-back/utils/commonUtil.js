"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundsToFixed = exports.toFixed = void 0;
function toFixed(num, floatLen = 2) {
    if (!num)
        return;
    return +(num).toFixed(floatLen);
}
exports.toFixed = toFixed;
function fundsToFixed(num, floatLen = 2) {
    if (!num)
        return;
    return +(num / 100000000).toFixed(floatLen);
}
exports.fundsToFixed = fundsToFixed;
exports.default = {
    getIwencaiData(responseJson) {
        let data = [];
        try {
            data = responseJson.data.answer[0].txt[0].content.components[0].data.datas;
        }
        catch (e) {
            console.log('[error log] getIwencaiData 数据结构错误！');
        }
        return data;
    },
    toFixed,
    fundsToFixed,
};
//# sourceMappingURL=commonUtil.js.map