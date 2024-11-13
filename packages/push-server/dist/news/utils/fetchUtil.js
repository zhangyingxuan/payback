"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewsRequestByXueqiu = exports.fetchNewsRequestByCls = exports.fetchNewsRequest = void 0;
const node_fetch_1 = require("node-fetch");
async function fetchNewsRequest(time = '1725962009', signal) {
    return new Promise(async (resolve, reject) => {
        const params = {
            headers: {
                accept: '*/*',
                'accept-language': 'zh-CN,zh;q=0.9',
                'hexin-v': 'AzrmeXApCAlpfoS5bPTuu6mujWtZ67aQMGkwL0Qz4kKY9NTVLHsO1QD_i0MX',
                'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            },
            referrer: 'https://news.10jqka.com.cn/realtimenews.html',
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        };
        if (signal) {
            params.signal = signal;
        }
        (0, node_fetch_1.default)(`https://news.10jqka.com.cn/tapp/news/push/stock/?page=1&tag=&track=website&ctime=${time}`, params).then(async (result) => {
            if (signal && signal.aborted) {
                reject('AbortError');
            }
            else {
                resolve(await result.json());
            }
        }).catch(ex => {
            if (signal && signal.aborted) {
                const { reason } = signal;
                console.log(`Fetch aborted with reason: ${reason}`);
            }
        });
        ;
    });
}
exports.fetchNewsRequest = fetchNewsRequest;
async function fetchNewsRequestByCls() {
    const result = await (0, node_fetch_1.default)('https://www.cls.cn/nodeapi/refreshTelegraphList?app=CailianpressWeb&lastTime=1725957867&os=web', {
        headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'content-type': 'application/json;charset=utf-8',
            'if-none-match': 'W/"1e0a-Xq4hbt5jfKwqH0x33aLvcF3xWiU"',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            Host: 'http://127.0.0.1:8080',
        },
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
    });
    return await result.text();
}
exports.fetchNewsRequestByCls = fetchNewsRequestByCls;
async function fetchNewsRequestByXueqiu() {
    const result = await (0, node_fetch_1.default)('https://xueqiu.com/statuses/livenews/list.json?count=15&max_id=', {
        headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'elastic-apm-traceparent': '00-7eda5991b0160215e574b3cd7b0fdae6-4a4588d0577ce5d0-01',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            cookie: 'xq_a_token=49c5e355d2fc1b871fde601c659cf9ae1457a889;',
            Referer: 'https://xueqiu.com/',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        body: null,
        method: 'GET',
    });
    return await result.json();
}
exports.fetchNewsRequestByXueqiu = fetchNewsRequestByXueqiu;
//# sourceMappingURL=fetchUtil.js.map