import { createV } from './hexin-v';
import fetch from 'node-fetch';
import { getIwencaiData, getStocksDataByIwencai } from '../utils/commonUtil';
import { stringify } from 'qs';

/**
 * 获取爱问财数据
 * @param question
 * @param pageSize
 * @param isPlate
 * @returns
 */
export async function fetchIwencaiApi(question, pageSize = 5) {
  const result = await fetchIwencai(question, pageSize, true);

  // const text = await result.text();
  // return getIwencaiData(JSON.parse(text));
  return getIwencaiData(result);
}

/**
 * 获取个股数据 通过 爱问财数据
 * @param question
 * @param pageSize
 * @param isPlate
 * @returns
 */
export async function fetchStocksByIwencai(question, pageSize = 50) {
  const result = await fetchIwencai(question, pageSize, false);

  // const text = await result.text();
  // return getIwencaiData(JSON.parse(text));
  return getStocksDataByIwencai(result);
}

/**
 * 获取爱问财数据
 * @param question
 * @param pageSize
 * @param isPlate
 * @returns
 */
export async function fetchIwencai(question, pageSize = 5, isPlate = false) {
  const body = {
    source: 'Ths_iwencai_Xuangu',
    version: '2.0',
    question: question,
    perpage: pageSize,
    page: 1,
    secondary_intent: isPlate ? 'zhishu' : 'stock',
    add_info: '{"urp":{"scene":1,"company":1,"business":1},"contentType":"json","searchInfo":true}',
  };

  const result = await fetch('http://www.iwencai.com/customized/chart/get-robot-data', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'hexin-v': createV(),
      pragma: 'no-cache',
    },
    body: JSON.stringify(body),
    referrerPolicy: 'strict-origin-when-cross-origin',
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });

  // const text = await result.text();
  // return getIwencaiData(JSON.parse(text));
  return await result.json();
}

/**
 * 获取市场核心数据
 * @returns
 */
export async function fetchMarketData() {
  const result = await fetch('http://q.10jqka.com.cn/api.php?t=indexflash&', {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'hexin-v': createV(),
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

export async function clearThsSelfStocks(user) {
  // # 更改同花顺自选股列表
  // # method: add 添加, del 删除, exc 排序
  // # pos: 排序用的序号, 从1开始
  const result = await fetch('http://stock.10jqka.com.cn/self.php', {
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

/**
 * 获取市场指数 点数
 * @param user
 * @returns
 */
export async function fetchMarketPointFromEastmoney() {
  const dateTime = new Date().getTime();
  // 从这个界面的表格接口获取 http://quote.eastmoney.com/center/hszs.html
  const result = await fetch(
    `http://57.push2.eastmoney.com/api/qt/clist/get?cb=jQuery112402821055891936557_${dateTime}&pn=1&pz=6&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&wbp2u=|0|0|0|web&fid=&fs=b:MK0010&fields=f2,f3,f12,f14&_=${dateTime}`,
    {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
      },
      referrer: 'http://quote.eastmoney.com/center/hszs.html',
      referrerPolicy: 'unsafe-url',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    },
  );
  const responseData = await result.text();
  const dataStr = responseData.substring(responseData.indexOf('(') + 1, responseData.length - 2);
  const dataJSON = JSON.parse(dataStr).data?.diff;
  return dataJSON;
}
/**
 * 获取市场指数 点数 - 同花顺
 * @param user
 * @returns
 */
export async function fetchMarketPoint(apiUrl, key) {
  const result = await fetch(apiUrl, {
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
  // console.log(dataJSON[key]);
  return +dataJSON[key][11];
}

/**
 * 东方财富 获取北向、南向资金数据
 * @returns
 */
export async function fetchNorhFunds() {
  const dateTime = new Date().getTime();
  const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112304542900785353563_${dateTime}&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=${dateTime}`;
  const result = await fetch(url, {
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

export enum ThsOprate {
  add = 'add',
  del = 'del',
  exc = 'exc',
}

export async function modifyThsSelfStocksRequest(code, userid, ticket, user, type = ThsOprate.add) {
  // # 更改同花顺自选股列表
  // # method: add 添加, del 删除, exc 排序
  // # pos: 排序用的序号, 从1开始
  const pos = '1';
  const payload = {
    add: { stockcode: code, op: 'add' },
    del: { stockcode: code, op: 'del' },
    exc: { stockcode: code, op: 'exc', pos: pos, callback: 'callbacknew' },
  };
  // https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=add&stockcode=000551_33
  // https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=add&stockcode=000980
  // console.log("http://stock.10jqka.com.cn/self.php?" + stringify(payload.add));

  const result = await fetch('https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?' + stringify(payload[type]), {
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
      Cookie: `userid=${userid}; u_name=mo_${userid}; escapename=mo_${userid}; user=${user}; ticket=${ticket};`,
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

/**
 * 并发限制
 * @param promises
 * @param limit
 * @returns
 */
export function promiseLimit(promises, limit) {
  return new Promise(resolve => {
    let resolvedCount = 0;
    let count = 0;
    const res = [];
    const len = promises.length;

    function next(p, index) {
      p().then(r => {
        res[index] = r;
        // 记录请求成功的数量
        resolvedCount++;
        // 数组还存在为执行的promise
        if (promises.length) {
          const p = promises.shift();
          next(p, count);
          count++;
        } else if (resolvedCount === len) {
          resolve(res);
        }
      });
    }
    // 1. 设置最开始的并发请求为最大值或全部promise数组
    while (count < limit && promises.length) {
      const p = promises.shift();
      next(p, count);
      count++;
    }
  });
}
