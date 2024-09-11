import { createV } from 'pay-back-core';
import fetch from 'node-fetch';
import { getIwencaiData, getStocksDataByIwencai, getStocksPagingDataByIwencai } from '../utils/commonUtil';
import { stringify } from 'qs';

// 爱问财最大分页码为100
const maxPageSize = 100;

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

interface IwencaiStockResult {
  data: any;
  length: number;
  condition: Array<any>;
}
/**
 * 获取个股数据 通过 爱问财数据
 * @param question
 * @param limit 如果传了 limit 则 不需要查询所有数据
 * @param isPlate
 * @returns
 */
export async function fetchAllStocksByIwencai(question, limit = null) {
  // 设置强制 终止死循环次数，最多20页，意味着 2000条数据 2024-02-20 15:08:36
  let pageNum = 1;
  const maxRequestTimes = 20;
  let data;

  let result = await fetchIwencai(question, limit ? limit : maxPageSize, false);
  const iwencaiStockResult: IwencaiStockResult = getStocksDataByIwencai(result);
  // 需要分页：还有多余数据未查出，且需要查更多
  if (iwencaiStockResult.length > iwencaiStockResult.data.length && !limit) {
    while (true) {
      result = await fetchStockPagingDataList(question, maxPageSize, ++pageNum, iwencaiStockResult.condition);
      // 分页数据 第二页开始，临时数据
      data = getStocksPagingDataByIwencai(result);
      iwencaiStockResult.data.push(...data);
      // 4种情况需终止：
      // 1、异常 累计数据长度大于查询结果获取的数据长度
      // 2、异常 获取到的数据为空
      // 3、返回数据的真实长度小于分页数
      // 4、已查询20次，强制查询分页数据
      if (
        data.length === 0 ||
        iwencaiStockResult.data.length >= iwencaiStockResult.length ||
        data.length < maxPageSize ||
        pageNum >= maxRequestTimes
      ) {
        break;
      }
    }
  }

  return iwencaiStockResult;
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
    // 已验证，爱问财接口 无法执行分页 2024-02-21 12:12:10
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

  return await result.json();
}

/**
 * 获取爱问财数据 分页数据
 * @param question
 * @param pageSize
 * @param isPlate
 * @returns
 */
export async function fetchStockPagingDataList(question, pageSize = 5, pageNum = 1, condition) {
  const body = {
    urp_sort_way: 'desc',
    query: question,
    query_type: 'stock',
    source: 'Ths_iwencai_Xuangu',
    perpage: pageSize,
    page: pageNum,
    // 组件Id 必须
    comp_id: 6836372,
    // 组件Id 必须
    uuid: 24087,
    condition,
  };

  const result = await fetch('https://www.iwencai.com/gateway/urp/v7/landing/getDataList', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded',
      'hexin-v': createV(),
      pragma: 'no-cache',
    },
    body: stringify(body),
    referrerPolicy: 'strict-origin-when-cross-origin',
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });

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
  del = 'remove',
  exc = 'exc',
}

/**
 * 老的 更新自选个股 的接口，仅支持更新个股，不能更新板块
 * @param code
 * @param userid
 * @param ticket
 * @param user
 * @param type
 * @returns
 */
export async function modifyThsSelfStocksRequest(code, userid, ticket, user, type = ThsOprate.add) {
  // # 更改同花顺自选股列表
  // # method: add 添加, del 删除, exc 排序
  // # pos: 排序用的序号, 从1开始
  const pos = '1';
  const payload = {
    add: { stockcode: code, op: 'add' },
    remove: { stockcode: code, op: 'del' },
    exc: { stockcode: code, op: 'exc', pos: pos, callback: 'callbacknew' },
  };

  // console.log(userid, ticket, user);
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
      Cookie: `user=${user}; userid=${userid}; u_name=mo_${userid}; escapename=mo_${userid}; ticket=${ticket};`,
    },
    referrer: 'https://t.10jqka.com.cn/newcircle/user/userPersonal/?from=circle',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  });
  // console.log(await result.json());
  return await result.json();
}

/**
 *
 * @param code
 * @param isPlate
 * @returns
 */
function getCodeSuffix(code, isPlate) {
  if (isPlate) {
    return '_48';
  }

  // 深交所 6 688
  if (code.startsWith('6')) {
    return '_17';
    // 上交所 30 0
  } else if (code.startsWith('3') || code.startsWith('0')) {
    return '_33';
  } else {
    // 北证 4 8
    return '_151';
  }
}

/**
 * 修改 同花顺 自选板块 2024-02-27
 * @param code
 * @param userid
 * @param ticket
 * @param user
 * @param type
 * @returns
 */
export async function modifyThsSelfRequest(code, userid, ticket, user, type = ThsOprate.add, isPlate = false) {
  const codeSuffix = getCodeSuffix(code, isPlate);

  const result = await fetch('https://www.iwencai.com/iwencai/userinfo/iwc/userinfo/self-stock/index/' + type, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Hexin-V': 'A0FxrGogwHjAQCxMgvkBCLc5VoZebrX63-JZdKOWPcinim_4677FMG8yaV0w',
      Cookie: `userid=${userid}; u_name=mo_${userid}; escapename=mo_${userid}; user=${user}; ticket=${ticket};`,
    },
    // referrer: `https://www.iwencai.com/unifiedwap/result?w=${code}%20&querytype=${isPlate ? 'zhishu' : 'stock'}`,
    // referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify({
      // 个股：6、688开头 _17；43、8开头 _151；3、0开头 _33
      // 板块_48
      codes: code + codeSuffix,
      type: 2,
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  });
  return await result.json();
}

/**
 * 获取新闻消息（财联社 电报）
 * 通过接口返回的 list 数据取出 rtime 作为下次请求的参数
 * @param time
 * @returns
 */
export async function fetchNewsRequest(time = '1725962009') {
  const result = await fetch(
    `https://news.10jqka.com.cn/tapp/news/push/stock/?page=1&tag=&track=website&ctime=${time}`,
    {
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
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
      referrer: 'https://news.10jqka.com.cn/realtimenews.html',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    },
  );
  return await result.json();
}

/**
 * 获取新闻消息（财联社 电报）
 * 通过接口返回的 list 数据取出 rtime 作为下次请求的参数
 * @param time
 * @returns
 */
export async function fetchNewsRequestByCls() {
  const result = await fetch(
    'https://www.cls.cn/nodeapi/refreshTelegraphList?app=CailianpressWeb&lastTime=1725957867&os=web',
    {
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
        // Referer: 'https://www.cls.cn/telegraph',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        Host: 'http://127.0.0.1:8080',
      },
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    },
  );

  return await result.text();
}

/**
 * 雪球电报
 */
export async function fetchNewsRequestByXueqiu() {
  const result = await fetch('https://xueqiu.com/statuses/livenews/list.json?count=15&max_id=', {
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
      // cookie:
      //   'cookiesu=531701873068490; device_id=61d5cbc3e036c49433b21c0bbcd435af; smidV2=202404070941589b6b064e51b5bf42f15a0ed01dc61d3800cd254400e816f40; s=ba1295pw6b; acw_tc=2760825f17259598956085223ede7a59be95edd67e75c86f163461d9f629b2; xq_a_token=49c5e355d2fc1b871fde601c659cf9ae1457a889; xqat=49c5e355d2fc1b871fde601c659cf9ae1457a889; xq_r_token=250d5a132310b89c6cf1193e084989736506a297; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOi0xLCJpc3MiOiJ1YyIsImV4cCI6MTcyNzkxNjc3OCwiY3RtIjoxNzI1OTU5ODU5MjgzLCJjaWQiOiJkOWQwbjRBWnVwIn0.RYsycDBvYSGVKYRXkJ2wtg0Ba5O2GbMtt_rQNrfwrKmZLdi7Le_S-Losk-scXhE2uVJf_m0bNIu1KojMrJLxZG8RwPyMWZTWaJcSHj8CEWIbomXHL1UomOTk7YhODryEiBeRStn-iU5uqnh1ieOMpmiKNj5zX6MYQ4xr-DIrzndEbfabECMdMJ-kQxHTV2hEM8qWvMjgJdZXpq9yPs6rDRAsmapO8auswbXHxWen2wqGj1WXmADbivz3TlsE68k54STnghvl1FPe53G83vlBUIPPQH9DKybSX4a4FQTHBKyVBwmPDJH0ya-sb5sjuZ3igfoDbn7_i7xuWxNuhCT5Cg; u=531701873068490; Hm_lvt_1db88642e346389874251b5a1eded6e3=1725959899; HMACCOUNT=9AB2AA8CEE2CBB6C; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1725960966; .thumbcache_f24b8bbe5a5934237bbc0eda20c1b6e7=WreTwU1PPQYzuIy9uPGtYGl+9w0TocmCUjlTnM7PKnrXIJVgxvkNepHUmDcwS4jxayQr0/mXSAM1IdMFI0VDiQ%3D%3D; ssxmod_itna=eqIx9D0DciQYqY5GHtGdAfTtDyBWiohDnDxhYrijx0yG+eGzDAxn40iDtoaN4Gq35Y/jixdPYFc2hNHqSBRTT4/K2+3dWqmDAoDhx7QDox0=DnxAQDj6xPGGRxBYDQxAYDGDDPyDGwX8nDGpMGwtlB4=ulb6MDi3nYqDRiqDgfeD1YnNDXwLxUqDAAeGyKeGfYqGgBq=0DY=DQuan+ltDjfRW11WRDYPF+knrxBQtdqj3nLXViLyWiB3W4R5oQfGxlx+rbRGr9DkYm4x6E7YhlixsGOd6mDxioYA=eD=; ssxmod_itna2=eqIx9D0DciQYqY5GHtGdAfTtDyBWiohDnDxhYriDn9SBdDsieDL7CbVt4qnRDDtnKe+9hzwAZdAxa0W7GKXYP1DkGwGlBDhfj8lWejoxtrVWmGaU/WnPoX8=dL6MGxrg9j=ZIyp9PhAUwGfzdUnKYi/f32AGbXA+L3PXkmsbu58CAYeSoU+9xt=x6vM9mi7AmKtK03xrucQoqIX+uG75m2Hk30D=0GaD7jNQGqL4CmeFchDo97MRrON4CDqWDGcDiQeeD===',
      Referer: 'https://xueqiu.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: null,
    method: 'GET',
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
