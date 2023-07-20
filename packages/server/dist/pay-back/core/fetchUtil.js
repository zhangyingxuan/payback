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
async function modifyThsSelfStocks(code) {
    const pos = '1';
    const payload = {
        'add': { 'stockcode': code, 'op': 'add' },
        'del': { 'stockcode': code, 'op': 'del' },
        'exc': { 'stockcode': code, 'op': 'exc', 'pos': pos, 'callback': 'callbacknew' }
    };
    const userid = '631410317';
    const ticket = 'e64f54692d843e69da6dbb579e220e30';
    const user = 'MDptb182MzE0MTAzMTc6Ok5vbmU6NTAwOjY0MTQxMDMxNzo3LDExMTExMTExMTExLDQwOzQ0LDExLDQwOzYsMSw0MDs1LDEsNDA7MSwxMDEsNDA7MiwxLDQwOzMsMSw0MDs1LDEsNDA7OCwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSw0MDsxMDIsMSw0MDoyNzo6OjYzMTQxMDMxNzoxNjg5ODIzNzE4Ojo6MTY1MDk4ODUwMDo4NjQwMDowOjE2Y2M0ZWIzOGNhZjUzNjU5MjU2MTNiYzdhM2JlNTAzOTpkZWZhdWx0XzQ6MQ%3D%3D';
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
    result = await result.json();
    return result;
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