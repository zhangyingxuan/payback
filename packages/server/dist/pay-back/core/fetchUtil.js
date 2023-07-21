"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseLimit = exports.modifyThsSelfStocks = exports.fetchIwencaiApi = void 0;
const hexin_v_js_1 = require("./hexin-v.js");
const node_fetch_1 = require("node-fetch");
const commonUtil_1 = require("../utils/commonUtil");
const qs_1 = require("qs");
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
    return (0, commonUtil_1.getIwencaiData)(result);
}
exports.fetchIwencaiApi = fetchIwencaiApi;
async function modifyThsSelfStocks(code, userid, ticket, user) {
    const pos = '1';
    const payload = {
        'add': { 'stockcode': code, 'op': 'add' },
        'del': { 'stockcode': code, 'op': 'del' },
        'exc': { 'stockcode': code, 'op': 'exc', 'pos': pos, 'callback': 'callbacknew' }
    };
    let result = await (0, node_fetch_1.default)("https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?" + (0, qs_1.stringify)(payload.add), {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "Cookie": `userid=${userid}; u_name=mo_${userid}; escapename=mo_${userid}; user=${user}; ticket=${ticket};`,
        },
        "referrer": "https://t.10jqka.com.cn/newcircle/user/userPersonal/?from=circle",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return await result.json();
    ;
}
exports.modifyThsSelfStocks = modifyThsSelfStocks;
function promiseLimit(promises, limit) {
    return new Promise(resolve => {
        let resolvedCount = 0;
        let count = 0;
        let res = [];
        const len = promises.length;
        function next(p, index) {
            p().then(r => {
                res[index] = r;
                resolvedCount++;
                if (promises.length) {
                    const p = promises.shift();
                    next(p, count);
                    count++;
                }
                else if (resolvedCount === len) {
                    resolve(res);
                }
            });
        }
        while (count < limit && promises.length) {
            const p = promises.shift();
            next(p, count);
            count++;
        }
    });
}
exports.promiseLimit = promiseLimit;
//# sourceMappingURL=fetchUtil.js.map