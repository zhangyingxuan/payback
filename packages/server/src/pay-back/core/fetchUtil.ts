import { createV } from 'pay-back-core';
import fetch from 'node-fetch';
import { getIwencaiData, getStocksDataByIwencai, getStocksPagingDataByIwencai } from '../utils/commonUtil';
import { stringify } from 'qs';
import { createFetch } from '@/utils/abortFetch';

// 爱问财最大分页码为100
const maxPageSize = 100;

// 爱问财会对同一 IP 的瞬时并发请求返回 403。更新全部数据时多个服务会同时
// 请求该接口，因此在请求层统一串行化，并在请求之间留出短暂间隔。
const iwencaiRequestInterval = 1200;
const iwencaiMaxAttempts = 6;
const iwencaiBrowserHeaders = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  origin: 'https://www.iwencai.com',
  referer: 'https://www.iwencai.com/',
};
let iwencaiRequestQueue: Promise<void> = Promise.resolve();

const delay = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));

function enqueueIwencaiRequest<T>(request: () => Promise<T>): Promise<T> {
  const result = iwencaiRequestQueue.then(request, request);
  iwencaiRequestQueue = result.then(
    () => delay(iwencaiRequestInterval),
    () => delay(iwencaiRequestInterval),
  );
  return result;
}

async function fetchIwencaiJson(
  resource: string,
  options: any,
  isValidResponse: (data: any) => boolean,
): Promise<any> {
  return enqueueIwencaiRequest(async () => {
    let lastError: Error;

    for (let attempt = 1; attempt <= iwencaiMaxAttempts; attempt++) {
      try {
        const response = await createFetch()(resource, options);
        const data = await response.json();
        if (response.ok && isValidResponse(data)) {
          return data;
        }

        const status = data?.status_code ?? response.status;
        const message = data?.status_msg || data?.message || response.statusText || '响应结构异常';
        lastError = new Error(`爱问财接口请求失败(${status}): ${message}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (attempt < iwencaiMaxAttempts) {
        await delay(iwencaiRequestInterval * attempt);
      }
    }

    throw lastError;
  });
}

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
  compId: number;
  uuid: number;
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
      result = await fetchStockPagingDataList(
        question,
        maxPageSize,
        ++pageNum,
        iwencaiStockResult.condition,
        iwencaiStockResult.compId,
        iwencaiStockResult.uuid,
      );
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
  return fetchIwencaiJson('https://www.iwencai.com/customized/chart/get-robot-data', {
    headers: {
      ...iwencaiBrowserHeaders,
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
  }, data => data?.status_code === 0 && Array.isArray(data?.data?.answer));
}

/**
 * 获取爱问财数据 分页数据
 * @param question
 * @param pageSize
 * @param isPlate
 * @returns
 */
export async function fetchStockPagingDataList(question, pageSize = 5, pageNum = 1, condition, compId, uuid) {
  const body = {
    urp_sort_way: 'desc',
    query: question,
    query_type: 'stock',
    source: 'Ths_iwencai_Xuangu',
    perpage: pageSize,
    page: pageNum,
    // 组件Id 必须
    comp_id: compId,
    // 组件Id 必须
    uuid,
    condition,
  };
  return fetchIwencaiJson('https://www.iwencai.com/gateway/urp/v7/landing/getDataList', {
    headers: {
      ...iwencaiBrowserHeaders,
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
  }, data => Array.isArray(data?.answer?.components));
}

/**
 * 获取市场核心数据
 * @returns
 */
export async function fetchMarketData() {
  const abortFetch = createFetch();
  const result = await abortFetch('http://q.10jqka.com.cn/api.php?t=indexflash&', {
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

  const abortFetch = createFetch();
  try {
    const result = await abortFetch(
      `https://push2.eastmoney.com/api/qt/clist/get?cb=jQuery112402821055891936557_${dateTime}&pn=1&pz=6&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&wbp2u=|0|0|0|web&fid=&fs=b:MK0010&fields=f2,f3,f12,f14&_=${dateTime}`,
      {
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
      },
    );
    const responseData = await result.text();
    const start = responseData.indexOf('(');
    const end = responseData.lastIndexOf(')');
    const dataJSON = JSON.parse(start >= 0 ? responseData.substring(start + 1, end) : responseData).data?.diff;
    if (!Array.isArray(dataJSON) || dataJSON.length < 4) throw new Error('东方财富指数数据不完整');
    return dataJSON;
  } catch (error) {
    return fetchMarketSnapshotFromTencent().then(data => data.indexes);
  }
}

export async function fetchMarketSnapshotFromTencent() {
  const response = await createFetch()('https://qt.gtimg.cn/q=sh000001,sz399001,bj899050,sz399006', {
    headers: { referer: 'https://finance.qq.com/' },
  });
  const text = await response.text();
  const quotes = text
    .split(';')
    .map(line => line.substring(line.indexOf('"') + 1, line.lastIndexOf('"')).split('~'))
    .filter(fields => fields.length > 37);

  if (quotes.length < 4) throw new Error('腾讯行情指数数据不完整');

  return {
    indexes: quotes.map(fields => ({ f2: +fields[3], f3: +fields[32], f12: fields[2] })),
    // 腾讯成交额字段单位为万元，转换为元后供现有逻辑统一计算。
    turnover: (+quotes[0][37] + +quotes[1][37]) * 10000,
  };
}
/**
 * 获取市场指数 点数 - 同花顺
 * @param user
 * @returns
 */
export async function fetchMarketPoint(apiUrl, key) {
  const abortFetch = createFetch();
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

  const abortFetch = createFetch();
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
