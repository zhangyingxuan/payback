import fetch from 'node-fetch';

/**
 * 获取新闻消息（同花顺 电报）
 * 通过接口返回的 list 数据取出 rtime 作为下次请求的参数
 * 为了保证时效性，5秒终端请求，相当于5秒超时，提升服务器性能&稳定性
 * @param time
 * @returns
 */
export async function fetchNewsRequest(time = '1725962009', signal) {
  return new Promise(async (resolve, reject) => {
    const params: any = {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'hexin-v':
          'AzrmeXApCAlpfoS5bPTuu6mujWtZ67aQMGkwL0Qz4kKY9NTVLHsO1QD_i0MX',
        'sec-ch-ua':
          '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
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
    };
    if (signal) {
      params.signal = signal;
      // 监听中止信号
      // signal.addEventListener('abort', () => {
      //   console.log('signal.addEventListener === Operation aborted');
      // });
    }

    fetch(
      `https://news.10jqka.com.cn/tapp/news/push/stock/?page=1&tag=&track=website&ctime=${time}`,
      params,
    ).then(async (result) => {
      if (signal && signal.aborted) {
        reject('AbortError');
      } else {
        resolve(await result.json());
      }
    }).catch(ex => {
      // This is how you can determine if the exception was due to abortion
      if (signal && signal.aborted) {
        // This is set by the promise which resolved first
        // and caused the fetch to abort
        const { reason } = signal;
        console.log(`${time}: ${reason}`);
      }
    });
    ;
  });
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
        // 非常重要，可模拟浏览器请求头 获取响应结果
        'sec-ch-ua':
          '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
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
  const result = await fetch(
    'https://xueqiu.com/statuses/livenews/list.json?count=15&max_id=',
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'elastic-apm-traceparent':
          '00-7eda5991b0160215e574b3cd7b0fdae6-4a4588d0577ce5d0-01',
        'sec-ch-ua':
          '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
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
    },
  );
  return await result.json();
}
