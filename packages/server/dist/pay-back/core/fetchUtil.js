"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseLimit = exports.modifyThsSelfRequest = exports.modifyThsSelfStocksRequest = exports.ThsOprate = exports.fetchNorhFunds = exports.fetchMarketPoint = exports.fetchMarketSnapshotFromTencent = exports.fetchMarketPointFromEastmoney = exports.clearThsSelfStocks = exports.fetchMarketData = exports.fetchStockPagingDataList = exports.fetchIwencai = exports.fetchAllStocksByIwencai = exports.fetchIwencaiApi = void 0;
const pay_back_core_1 = require("pay-back-core");
const node_fetch_1 = require("node-fetch");
const commonUtil_1 = require("../utils/commonUtil");
const qs_1 = require("qs");
const abortFetch_1 = require("../../utils/abortFetch");
const common_1 = require("@nestjs/common");
const maxPageSize = 100;
const iwencaiRequestInterval = 1200;
const iwencaiMaxAttempts = 6;
const iwencaiBrowserHeaders = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    origin: 'https://www.iwencai.com',
    referer: 'https://www.iwencai.com/',
};
let iwencaiRequestQueue = Promise.resolve();
const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
function enqueueIwencaiRequest(request) {
    const result = iwencaiRequestQueue.then(request, request);
    iwencaiRequestQueue = result.then(() => delay(iwencaiRequestInterval), () => delay(iwencaiRequestInterval));
    return result;
}
async function fetchIwencaiJson(resource, options, isValidResponse) {
    return enqueueIwencaiRequest(async () => {
        var _a;
        let lastError;
        for (let attempt = 1; attempt <= iwencaiMaxAttempts; attempt++) {
            try {
                const response = await (0, abortFetch_1.createFetch)()(resource, options);
                if (response.status === 401 || response.status === 403) {
                    throw new common_1.InternalServerErrorException('爱问财登录已失效，请重新登录');
                }
                const data = await response.json();
                if (response.ok && isValidResponse(data)) {
                    return data;
                }
                const status = (_a = data === null || data === void 0 ? void 0 : data.status_code) !== null && _a !== void 0 ? _a : response.status;
                const message = (data === null || data === void 0 ? void 0 : data.status_msg) || (data === null || data === void 0 ? void 0 : data.message) || response.statusText || '响应结构异常';
                if (status === -1935 || /未登[录陆]|登录.*失效/.test(message)) {
                    throw new common_1.InternalServerErrorException('爱问财登录已失效，请重新登录');
                }
                lastError = new Error(`爱问财接口请求失败(${status}): ${message}`);
            }
            catch (error) {
                if (error instanceof common_1.InternalServerErrorException)
                    throw error;
                lastError = error instanceof Error ? error : new Error(String(error));
            }
            if (attempt < iwencaiMaxAttempts) {
                await delay(iwencaiRequestInterval * attempt);
            }
        }
        throw lastError;
    });
}
async function fetchIwencaiApi(question, pageSize = 5, cookie = '') {
    const result = await fetchIwencai(question, pageSize, true, cookie);
    return (0, commonUtil_1.getIwencaiData)(result);
}
exports.fetchIwencaiApi = fetchIwencaiApi;
async function fetchAllStocksByIwencai(question, limit = null, cookie = '') {
    let pageNum = 1;
    const maxRequestTimes = 20;
    let data;
    let result = await fetchIwencai(question, limit ? limit : maxPageSize, false, cookie);
    const iwencaiStockResult = (0, commonUtil_1.getStocksDataByIwencai)(result);
    if (iwencaiStockResult.length > iwencaiStockResult.data.length && !limit) {
        while (true) {
            result = await fetchStockPagingDataList(question, maxPageSize, ++pageNum, iwencaiStockResult.condition, iwencaiStockResult.compId, iwencaiStockResult.uuid, cookie);
            data = (0, commonUtil_1.getStocksPagingDataByIwencai)(result);
            iwencaiStockResult.data.push(...data);
            if (data.length === 0 ||
                iwencaiStockResult.data.length >= iwencaiStockResult.length ||
                data.length < maxPageSize ||
                pageNum >= maxRequestTimes) {
                break;
            }
        }
    }
    return iwencaiStockResult;
}
exports.fetchAllStocksByIwencai = fetchAllStocksByIwencai;
async function fetchIwencai(question, pageSize = 5, isPlate = false, cookie = '') {
    const body = {
        source: 'Ths_iwencai_Xuangu',
        version: '2.0',
        question: question,
        perpage: pageSize,
        page: 1,
        secondary_intent: isPlate ? 'zhishu' : 'stock',
        add_info: '{"urp":{"scene":1,"company":1,"business":1},"contentType":"json","searchInfo":true}',
    };
    return fetchIwencaiJson('https://www.iwencai.com/customized/chart/get-robot-data', {
        headers: Object.assign(Object.assign(Object.assign({}, iwencaiBrowserHeaders), { accept: 'application/json, text/plain, */*', 'accept-language': 'zh-CN,zh;q=0.9', 'cache-control': 'no-cache', 'content-type': 'application/json', 'hexin-v': (0, pay_back_core_1.createV)(), pragma: 'no-cache' }), (cookie && { cookie })),
        body: JSON.stringify(body),
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
    }, data => { var _a; return (data === null || data === void 0 ? void 0 : data.status_code) === 0 && Array.isArray((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.answer); });
}
exports.fetchIwencai = fetchIwencai;
async function fetchStockPagingDataList(question, pageSize = 5, pageNum = 1, condition, compId, uuid, cookie = '') {
    const body = {
        urp_sort_way: 'desc',
        query: question,
        query_type: 'stock',
        source: 'Ths_iwencai_Xuangu',
        perpage: pageSize,
        page: pageNum,
        comp_id: compId,
        uuid,
        condition,
    };
    return fetchIwencaiJson('https://www.iwencai.com/gateway/urp/v7/landing/getDataList', {
        headers: Object.assign(Object.assign(Object.assign({}, iwencaiBrowserHeaders), { accept: 'application/json, text/plain, */*', 'accept-language': 'zh-CN,zh;q=0.9', 'cache-control': 'no-cache', 'content-type': 'application/x-www-form-urlencoded', 'hexin-v': (0, pay_back_core_1.createV)(), pragma: 'no-cache' }), (cookie && { cookie })),
        body: (0, qs_1.stringify)(body),
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
    }, data => { var _a; return Array.isArray((_a = data === null || data === void 0 ? void 0 : data.answer) === null || _a === void 0 ? void 0 : _a.components); });
}
exports.fetchStockPagingDataList = fetchStockPagingDataList;
async function fetchMarketData() {
    const abortFetch = (0, abortFetch_1.createFetch)();
    const result = await abortFetch('http://q.10jqka.com.cn/api.php?t=indexflash&', {
        headers: {
            accept: '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            'hexin-v': (0, pay_back_core_1.createV)(),
            pragma: 'no-cache',
            'x-requested-with': 'XMLHttpRequest',
        },
        referrer: 'http://q.10jqka.com.cn/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
    return await result.json();
}
exports.fetchMarketData = fetchMarketData;
async function clearThsSelfStocks(user) {
    const result = await (0, node_fetch_1.default)('http://stock.10jqka.com.cn/self.php', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0',
            'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            Referer: 'http://stock.10jqka.com.cn/my/zixuan.shtml',
            Cookie: user,
            DNT: '1',
        },
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
    return result;
}
exports.clearThsSelfStocks = clearThsSelfStocks;
async function fetchMarketPointFromEastmoney() {
    var _a;
    const dateTime = new Date().getTime();
    const abortFetch = (0, abortFetch_1.createFetch)();
    try {
        const result = await abortFetch(`https://push2.eastmoney.com/api/qt/clist/get?cb=jQuery112402821055891936557_${dateTime}&pn=1&pz=6&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&wbp2u=|0|0|0|web&fid=&fs=b:MK0010&fields=f2,f3,f12,f14&_=${dateTime}`, {
            headers: {
                accept: '*/*',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
                pragma: 'no-cache',
            },
            referrer: 'https://quote.eastmoney.com/center/hszs.html',
            referrerPolicy: 'unsafe-url',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        });
        const responseData = await result.text();
        const start = responseData.indexOf('(');
        const end = responseData.lastIndexOf(')');
        const dataJSON = (_a = JSON.parse(start >= 0 ? responseData.substring(start + 1, end) : responseData).data) === null || _a === void 0 ? void 0 : _a.diff;
        if (!Array.isArray(dataJSON) || dataJSON.length < 4)
            throw new Error('东方财富指数数据不完整');
        return dataJSON;
    }
    catch (error) {
        return fetchMarketSnapshotFromTencent().then(data => data.indexes);
    }
}
exports.fetchMarketPointFromEastmoney = fetchMarketPointFromEastmoney;
async function fetchMarketSnapshotFromTencent() {
    const response = await (0, abortFetch_1.createFetch)()('https://qt.gtimg.cn/q=sh000001,sz399001,bj899050,sz399006', {
        headers: { referer: 'https://finance.qq.com/' },
    });
    const text = await response.text();
    const quotes = text
        .split(';')
        .map(line => line.substring(line.indexOf('"') + 1, line.lastIndexOf('"')).split('~'))
        .filter(fields => fields.length > 37);
    if (quotes.length < 4)
        throw new Error('腾讯行情指数数据不完整');
    return {
        indexes: quotes.map(fields => ({ f2: +fields[3], f3: +fields[32], f12: fields[2] })),
        turnover: (+quotes[0][37] + +quotes[1][37]) * 10000,
    };
}
exports.fetchMarketSnapshotFromTencent = fetchMarketSnapshotFromTencent;
async function fetchMarketPoint(apiUrl, key) {
    const abortFetch = (0, abortFetch_1.createFetch)();
    const result = await abortFetch(apiUrl, {
        headers: {
            accept: '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            pragma: 'no-cache',
        },
        referrer: 'http://q.10jqka.com.cn/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
    const responseData = await result.text();
    const dataStr = responseData.substring(responseData.indexOf('(') + 1, responseData.length - 1);
    const dataJSON = JSON.parse(dataStr);
    return +dataJSON[key][11];
}
exports.fetchMarketPoint = fetchMarketPoint;
async function fetchNorhFunds() {
    const dateTime = new Date().getTime();
    const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112304542900785353563_${dateTime}&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=${dateTime}`;
    const abortFetch = (0, abortFetch_1.createFetch)();
    const result = await abortFetch(url, {
        headers: {
            accept: '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            pragma: 'no-cache',
            'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'script',
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-site',
        },
        referrer: 'https://data.eastmoney.com/hsgt/index.html',
        referrerPolicy: 'unsafe-url',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
    return result.text();
}
exports.fetchNorhFunds = fetchNorhFunds;
var ThsOprate;
(function (ThsOprate) {
    ThsOprate["add"] = "add";
    ThsOprate["del"] = "remove";
    ThsOprate["exc"] = "exc";
})(ThsOprate = exports.ThsOprate || (exports.ThsOprate = {}));
async function modifyThsSelfStocksRequest(code, userid, ticket, user, type = ThsOprate.add) {
    const pos = '1';
    const payload = {
        add: { stockcode: code, op: 'add' },
        remove: { stockcode: code, op: 'del' },
        exc: { stockcode: code, op: 'exc', pos: pos, callback: 'callbacknew' },
    };
    const result = await (0, node_fetch_1.default)('https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?' + (0, qs_1.stringify)(payload[type]), {
        headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            pragma: 'no-cache',
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            Cookie: `user=${user}; userid=${userid}; u_name=mo_${userid}; escapename=mo_${userid}; ticket=${ticket};`,
        },
        referrer: 'https://t.10jqka.com.cn/newcircle/user/userPersonal/?from=circle',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
    return await result.json();
}
exports.modifyThsSelfStocksRequest = modifyThsSelfStocksRequest;
function getCodeSuffix(code, isPlate) {
    if (isPlate) {
        return '_48';
    }
    if (code.startsWith('6')) {
        return '_17';
    }
    else if (code.startsWith('3') || code.startsWith('0')) {
        return '_33';
    }
    else {
        return '_151';
    }
}
async function modifyThsSelfRequest(code, userid, ticket, user, type = ThsOprate.add, isPlate = false) {
    const codeSuffix = getCodeSuffix(code, isPlate);
    const result = await (0, node_fetch_1.default)('https://www.iwencai.com/iwencai/userinfo/iwc/userinfo/self-stock/index/' + type, {
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Hexin-V': 'A0FxrGogwHjAQCxMgvkBCLc5VoZebrX63-JZdKOWPcinim_4677FMG8yaV0w',
            Cookie: `userid=${userid}; u_name=mo_${userid}; escapename=mo_${userid}; user=${user}; ticket=${ticket};`,
        },
        body: JSON.stringify({
            codes: code + codeSuffix,
            type: 2,
        }),
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
    });
    return await result.json();
}
exports.modifyThsSelfRequest = modifyThsSelfRequest;
function promiseLimit(promises, limit) {
    return new Promise(resolve => {
        let resolvedCount = 0;
        let count = 0;
        const res = [];
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