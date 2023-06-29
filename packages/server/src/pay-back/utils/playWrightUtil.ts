// 开发须知：
// 轻量服务器 1核1G 仅支持1个 browser 1个page 同时打开，否则会阻塞执行
import { firefox, Browser, Response } from 'playwright';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import commonUtil from './commonUtil';
import fundsUtil from './fundsUtil';
import { marketUrl, iwencaiUrl, params } from '../core/config';
import { Logger } from '@nestjs/common';
import { fetchIwencaiApi } from '../core/fetchUtil';

const logger = new Logger('playWrightUtil');

const browserOpenTimeOut = 60000;
const browserCloseTimeOut = 30000;
const commonTimeOut60s = 60000;

const getBrowser = async (autoCloseTime: number = browserCloseTimeOut) => {
  const browser = await firefox.launch({
    timeout: browserOpenTimeOut,
    // headless: false // setting this to true will not run the UI
  });
  // 默认 15s 后强制释放浏览器
  setTimeout(async () => {
    await browser.close();
    logger.log('自动关闭browser ====' + autoCloseTime);
  }, autoCloseTime);
  return browser;
};
/**
* 
* @param url
* @returns 
*/
const waitOriginalDataByUrl = async (pageUrl, apiUrl, transfromType: 'text' | 'json', baseBrowser?: Browser): Promise<String> => {
  const browser = baseBrowser ? baseBrowser : await getBrowser();
  // 日志开始
  logger.log('等待接口返回 start ====' + pageUrl);

  let page = await browser.newPage(), browserContext;
  // fix： 修复爱问财默认50条数据分页 的问题；仅 涨停进入，1核1g无法执行
  if (apiUrl === 'chart/get-robot-data') {
    browserContext = await browser.newContext({ storageState: undefined });
    // 只有 涨停数据 需要100/ 页；其他页面只需要 10条即可
    const pageNumber = pageUrl.includes(params.dailyLimitMoreThan1) ? '100' : '10';
    await browserContext.addInitScript((pageNumber) => {
      window.localStorage.setItem('PAGE_NUMBER', pageNumber);
    }, pageNumber);
    page = await browserContext.newPage();
  } else {
    page = await browser.newPage();
  }


  return new Promise((resolve, reject) => {
    page.on('response', async (response: Response) => {
      // console.log(response.url())
      if (response.url().includes(apiUrl) && response.status() === 200) {
        logger.log('等待接口返回 end ====' + pageUrl);
        let responseData;
        if (transfromType == 'json') {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        // 获取数据后，关闭page 节约内存开销
        // browserContext && (browserContext.close())
        page.close();
        setTimeout(() => {
          resolve(responseData);
        }, 2000)
      }
    });
    page.goto(pageUrl, { timeout: commonTimeOut60s, waitUntil: "domcontentloaded" });
    // logger.log('打开页面成功 ====', pageUrl);
  });
};

function getPoint(data) {
  const dataLen = data.length;
  const index = data.indexOf(';1500,', dataLen / 2);
  const point = data.substring(index, dataLen - 2).split(',')[1];
  // console.log(index, data.substring(index, dataLen - 1));
  return point;
}

async function getRealDataJson(response: Response, replaceStr) {
  let dataStr = await response.text();
  dataStr = dataStr.replace(replaceStr, '')
  dataStr = dataStr.replace(')', '')
  return JSON.parse(dataStr);
}

/**
* 
* @param url 准备市场 指数数据
* @returns 
*/
const waitMarketDataByUrls = async (pageUrl, apiUrl, browser): Promise<CreateMarketDataDto> => {
  logger.log('等待接口返回 start ====' + pageUrl);
  // 打开股票行情页面  
  const page = await browser.newPage();
  return new Promise(async (resolve, reject) => {
    const createMarketDataDto = new CreateMarketDataDto();
    const state = {
      apiUrl: false,
      hs_399001: false,
      hs_1A0001: false,
      hs_399006: false,
      151_899050: false,
    }
    page.on('response', async response => {
      // console.log(response.url())
      if (response.url().includes(apiUrl) && response.status() === 200) {
        const dataJson = await response.json();
        createMarketDataDto.dailyLimitIncome = dataJson.jrbx_data.last_zdf;
        createMarketDataDto.fallAmount = dataJson.zdfb_data.dnum;
        createMarketDataDto.riseAmount = dataJson.zdfb_data.znum;
        createMarketDataDto.marketScore = dataJson.dppj_data;
        state.apiUrl = true;
      }
      // "深证成指" time/hs_399001/last.js
      if (response.url().includes('time/hs_399001/last.js') && response.status() === 200) {
        const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_399001_last(');
        // 昨收盘点数
        const pre = dataJson.hs_399001.pre;
        createMarketDataDto.shenzhengPoint = getPoint(dataJson.hs_399001.data);
        state.hs_399001 = true;
      }
      // "上证指数" time/hs_1A0001/last.js
      if (response.url().includes('time/hs_1A0001/last.js') && response.status() === 200) {
        const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_1A0001_last(');
        // 昨收盘点数
        const pre = dataJson.hs_1A0001.pre;
        createMarketDataDto.shangzhengPoint = getPoint(dataJson.hs_1A0001.data);
        state.hs_1A0001 = true;
      }
      // "创业板指" time/hs_399006/last.js
      if (response.url().includes('time/hs_399006/last.js') && response.status() === 200) {
        const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_399006_last(');
        // 昨收盘点数
        const pre = dataJson.hs_399006.pre;
        createMarketDataDto.chuangyePoint = getPoint(dataJson.hs_399006.data);
        state.hs_399006 = true;
      }
      // "北证50"   time/151_899050/last.js
      if (response.url().includes('time/151_899050/last.js') && response.status() === 200) {
        const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_151_899050_last(');
        // 昨收盘点数
        const pre = dataJson['151_899050'].pre;
        createMarketDataDto.beizheng50Point = getPoint(dataJson['151_899050'].data);
        state['151_899050'] = true;
      }

      // 所有数据都返回了，则resolve
      if (state['151_899050'] && state['hs_399006'] && state['hs_1A0001'] && state['hs_399001'] && state['apiUrl']) {
        // 日志开始
        await page.close();
        logger.log('接口返回数据【成功】 ====' + pageUrl);
        setTimeout(() => {
          resolve(createMarketDataDto);
        }, 1000);
      }
    })
    page.goto(pageUrl, { timeout: commonTimeOut60s, waitUntil: "domcontentloaded" });
  });
};

export default {
  /**
   * 获取 市场数据
   */
  async getMarketData(dateStr): Promise<CreateMarketDataDto> {
    const browser = await getBrowser(browserCloseTimeOut);
    const response: CreateMarketDataDto = await waitMarketDataByUrls(marketUrl, '/api.php', browser);

    const gainianRiseFloat = await fetchIwencaiApi(params.gainianRiseFloat);
    const gainianFallFloat = await fetchIwencaiApi(params.gainianFallFloat);
    const hangyeRiseFloat = await fetchIwencaiApi(params.hangyeRiseFloat);
    const hangyeFallFloat = await fetchIwencaiApi(params.hangyeFallFloat);

    const gainianRiseFloatTop3 = fundsUtil.getPlateTop(gainianRiseFloat, dateStr, 5);
    const gainianFallFloatTop3 = fundsUtil.getPlateTop(gainianFallFloat, dateStr, 5);
    const hangyeRiseFloatTop3 = fundsUtil.getPlateTop(hangyeRiseFloat, dateStr, 5);
    const hangyeFallFloatTop3 = fundsUtil.getPlateTop(hangyeFallFloat, dateStr, 5);
    response.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop3);
    response.gainianFallFloat = JSON.stringify(gainianFallFloatTop3);
    response.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop3);
    response.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop3);
    response.createTime = new Date();
    setTimeout(async () => {
      await browser.close();
    }, 2000);
    return response;
  },
  /**
   * 获取 资金数据
   */
  async getFundsData(dateStr) {
    const browser = await getBrowser(browserCloseTimeOut * 2);
    // TODO 轻量服务器，无法同时打开多个page ，所以待优化，promise.all 方案实施失败
    // 北向资金、南向资金 获取
    const responseForeignFunds = await waitOriginalDataByUrl('https://data.eastmoney.com/hsgt/index.html', 'reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE', 'text', browser);
    const responseMarketTurnover = await waitOriginalDataByUrl('https://data.eastmoney.com/zjlx/dpzjlx.html', 'fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5', 'text', browser);

    const hangyeFundsInflow = await fetchIwencaiApi(iwencaiUrl + params.hangyeFundsInflow);
    const hangyeFundsOutflow = await fetchIwencaiApi(iwencaiUrl + params.hangyeFundsOutflow);
    const gaiNianFundsInflow = await fetchIwencaiApi(iwencaiUrl + params.gainianFundsInflow);
    const gaiNianFundsOutflow = await fetchIwencaiApi(iwencaiUrl + params.gainianFundsOutflow);

    const foreignFunds: any = fundsUtil.transformForeignFunds(responseForeignFunds);
    const marketTurnover: any = fundsUtil.getMarketTurnover(responseMarketTurnover);
    // 获取行业板块流入 Top3
    const hangyeFundsInflowTop3 = fundsUtil.getPlateTop(hangyeFundsInflow, dateStr);
    const hangyeFundsOutflowTop3 = fundsUtil.getPlateTop(hangyeFundsOutflow, dateStr);
    const gainianFundsInflowTop3 = fundsUtil.getPlateTop(gaiNianFundsInflow, dateStr);
    const gainianFundsOutflowTop3 = fundsUtil.getPlateTop(gaiNianFundsOutflow, dateStr);

    const createFundsDataDto = new CreateFundsDataDto();
    // 万亿
    createFundsDataDto.northFundsAmtIn = commonUtil.toFixed(foreignFunds.northFundsAmtIn / 10000);
    createFundsDataDto.northFundsBuyAmt = commonUtil.toFixed(foreignFunds.northFundsBuyAmt / 10000);
    createFundsDataDto.southFundsAmtIn = commonUtil.toFixed(foreignFunds.southFundsAmtIn / 10000);
    createFundsDataDto.southFundsBuyAmt = commonUtil.toFixed(foreignFunds.southFundsBuyAmt / 10000);
    createFundsDataDto.marketTurnover = commonUtil.toFixed(marketTurnover / 10000 / 10000 / 10000);
    createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
    createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
    createFundsDataDto.createTime = new Date();

    setTimeout(async () => {
      await browser.close();
    }, 2000);
    return createFundsDataDto;
  }
}