import { createV } from './hexin-v.js';
import fetch from 'node-fetch';
import { getIwencaiData } from '../utils/commonUtil';
import { stringify } from 'qs';

export async function fetchIwencaiApi(question, pageSize = 5, isPlate = true) {
  const body = {
    "source": "Ths_iwencai_Xuangu",
    "version": "2.0",
    "question": question,
    "perpage": pageSize,
    "page": 1,
    "secondary_intent": isPlate ? 'zhishu' : "stock",
  }

  let result = await fetch("https://www.iwencai.com/customized/chart/get-robot-data", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "hexin-v": createV(),
      "pragma": "no-cache"
    },
    "body": JSON.stringify(body),
    "method": "POST",
  });

  result = await result.json();

  return getIwencaiData(result);
}

export async function modifyThsSelfStocks(code, userid, ticket, user) {
  // # 更改同花顺自选股列表
  // # method: add 添加, del 删除, exc 排序
  // # pos: 排序用的序号, 从1开始
  const pos = '1';
  const payload = {
    'add': { 'stockcode': code, 'op': 'add' },
    'del': { 'stockcode': code, 'op': 'del' },
    'exc': { 'stockcode': code, 'op': 'exc', 'pos': pos, 'callback': 'callbacknew' }
  }
  // https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=add&stockcode=000551_33
  // https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=add&stockcode=000980
  // console.log("http://stock.10jqka.com.cn/self.php?" + stringify(payload.add));

  let result = await fetch("https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?" + stringify(payload.add), {
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
  return await result.json();;
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
    let res = [];
    const len = promises.length;

    function next(p, index) {
      p().then(r => {
        res[index] = r;
        // 记录请求成功的数量
        resolvedCount++
        // 数组还存在为执行的promise
        if (promises.length) {
          const p = promises.shift()
          next(p, count)
          count++
        } else if (resolvedCount === len) {
          resolve(res)
        }
      })
    }
    // 1. 设置最开始的并发请求为最大值或全部promise数组
    while (count < limit && promises.length) {
      const p = promises.shift()
      next(p, count)
      count++
    }
  })
}