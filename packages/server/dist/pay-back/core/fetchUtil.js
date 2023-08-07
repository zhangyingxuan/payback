"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseLimit = exports.modifyThsSelfStocks = exports.fetchNorhFunds = exports.fetchMarketPoint = exports.fetchMarketPointFromEastmoney = exports.clearThsSelfStocks = exports.fetchMarketData = exports.fetchIwencaiApi = void 0;
const hexin_v_1 = require("./hexin-v");
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
    let result = await (0, node_fetch_1.default)("http://www.iwencai.com/customized/chart/get-robot-data", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "hexin-v": (0, hexin_v_1.createV)(),
            "pragma": "no-cache"
        },
        "body": JSON.stringify(body),
        "referrerPolicy": "strict-origin-when-cross-origin",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    return (0, commonUtil_1.getIwencaiData)(await result.json());
}
exports.fetchIwencaiApi = fetchIwencaiApi;
async function fetchMarketData() {
    let result = await (0, node_fetch_1.default)("http://q.10jqka.com.cn/api.php?t=indexflash&", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "hexin-v": (0, hexin_v_1.createV)(),
            "pragma": "no-cache",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "http://q.10jqka.com.cn/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return await result.json();
}
exports.fetchMarketData = fetchMarketData;
async function clearThsSelfStocks(user) {
    let result = await (0, node_fetch_1.default)("http://stock.10jqka.com.cn/self.php", {
        "headers": {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0',
            'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Referer': 'http://stock.10jqka.com.cn/my/zixuan.shtml',
            'Cookie': user,
            'DNT': '1'
        },
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return result;
}
exports.clearThsSelfStocks = clearThsSelfStocks;
async function fetchMarketPointFromEastmoney() {
    var _a;
    const dateTime = new Date().getTime();
    let result = await (0, node_fetch_1.default)(`http://57.push2.eastmoney.com/api/qt/clist/get?cb=jQuery112402821055891936557_${dateTime}&pn=1&pz=6&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&wbp2u=|0|0|0|web&fid=&fs=b:MK0010&fields=f2,f3,f12,f14&_=${dateTime}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache"
        },
        "referrer": "http://quote.eastmoney.com/center/hszs.html",
        "referrerPolicy": "unsafe-url",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    const responseData = await result.text();
    const dataStr = responseData.substring(responseData.indexOf('(') + 1, responseData.length - 2);
    const dataJSON = (_a = JSON.parse(dataStr).data) === null || _a === void 0 ? void 0 : _a.diff;
    return dataJSON;
}
exports.fetchMarketPointFromEastmoney = fetchMarketPointFromEastmoney;
async function fetchMarketPoint(apiUrl, key) {
    let result = await (0, node_fetch_1.default)(apiUrl, {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
        },
        "referrer": "http://q.10jqka.com.cn/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    console.log(key);
    const responseData = await result.text();
    const dataStr = responseData.substring(responseData.indexOf('(') + 1, responseData.length - 1);
    const dataJSON = JSON.parse(dataStr);
    return +dataJSON[key][11];
}
exports.fetchMarketPoint = fetchMarketPoint;
async function fetchNorhFunds() {
    const dateTime = new Date().getTime();
    const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112304542900785353563_${dateTime}&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=${dateTime}`;
    const result = await (0, node_fetch_1.default)(url, {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "script",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://data.eastmoney.com/hsgt/index.html",
        "referrerPolicy": "unsafe-url",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    return result.text();
}
exports.fetchNorhFunds = fetchNorhFunds;
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