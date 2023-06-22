"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchIwencaiApi = void 0;
const hexin_v_js_1 = require("./hexin-v.js");
const node_fetch_1 = require("node-fetch");
const commonUtil_1 = require("../utils/commonUtil");
async function fetchIwencaiApi(question, pageSize = 5, isPlate = true) {
    const body = {
        "source": "Ths_iwencai_Xuangu",
        "version": "2.0",
        "question": question,
        "perpage": pageSize,
        "page": 1,
        "secondary_intent": isPlate ? 'zhishu' : "stock",
    };
    let result = await (0, node_fetch_1.default)("https://www.iwencai.com/customized/chart/get-robot-data", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "hexin-v": (0, hexin_v_js_1.createV)(),
            "pragma": "no-cache"
        },
        "body": JSON.stringify(body),
        "method": "POST",
    });
    result = await result.json();
    return isPlate ? result : (0, commonUtil_1.getIwencaiData)(result);
}
exports.fetchIwencaiApi = fetchIwencaiApi;
//# sourceMappingURL=fetchUtil.js.map