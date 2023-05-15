"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
};
//# sourceMappingURL=commonUtil.js.map