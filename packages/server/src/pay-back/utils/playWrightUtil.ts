// 开发须知：
// 轻量服务器 1核1G 仅支持1个 browser 1个page 同时打开，否则会阻塞执行
import { chromium, firefox, Browser, Response, Page } from 'playwright';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { CreateHotListDto } from '../dto/create-hot-list.dto';
import commonUtil from './commonUtil';
import fundsUtil from './fundsUtil';
import { marketUrl, iwencaiUrl, params } from './config';
import { Logger } from '@nestjs/common';
import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { transformShortTermSourceData, transformStockData, transformPlateData } from '../utils/transformDataUtil';

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
    logger.log('自动关闭browser ====' + autoCloseTime);
    await browser.close();
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
  logger.log('等待接口返回 start ====', pageUrl);

  let page;
  // fix： 修复爱问财默认50条数据分页 的问题
  if (apiUrl === 'chart/get-robot-data') {
    const browserContext = await browser.newContext({ storageState: undefined });
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
        logger.log('等待接口返回 end ====', pageUrl);
        let responseData;
        if (transfromType == 'json') {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        // 获取数据后，关闭page 节约内存开销
        await page.close();
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
        createMarketDataDto.createTime = new Date();
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
        resolve(createMarketDataDto);
      }
    })
    page.goto(pageUrl, { timeout: commonTimeOut60s });
  });
};

/**
* 
* @param url 准备热榜数据
* @returns 
*/
const waitHostListDataByUrls = async (pageUrl): Promise<CreateHotListDto> => {
  return new Promise(async (resolve, reject) => {
    const browser = await getBrowser();
    console.log('打开浏览器成功！');
    // 打开股票行情页面  
    const page = await browser.newPage();
    console.log('打开热榜页面成功！');
    const maxAmount10 = 10;
    const maxAmount5 = 5;
    const createHotListDto = new CreateHotListDto();
    const state = {
      // 大家都在看，小时榜
      stockNormal: false,
      // 价值投资
      stockValue: false,
      // 概念板块
      plateConcept: false,
      // 行业板块
      plateIndustry: false,
    }
    page.on('response', async response => {
      if (response.url().includes('stock?stock_type=a&type=hour&list_type=normal') && response.status() === 200) {
        state.stockNormal = true;
        const responseData = await response.json();
        const stockList = responseData.data.stock_list.splice(0, maxAmount10);
        createHotListDto.stockNormal = transformStockData(stockList);
      }
      if (response.url().includes('stock?stock_type=a&type=day&list_type=value') && response.status() === 200) {
        state.stockValue = true;
        const responseData = await response.json();
        const stockList = responseData.data.stock_list.splice(0, maxAmount10);
        createHotListDto.stockValue = transformStockData(stockList);
      }
      if (response.url().includes('plate?type=concept') && response.status() === 200) {
        state.plateConcept = true;
        const responseData = await response.json();
        const plateList = responseData.data.plate_list.splice(0, maxAmount5);
        createHotListDto.plateConcept = transformPlateData(plateList);
      }
      if (response.url().includes('plate?type=industry') && response.status() === 200) {
        state.plateIndustry = true;
        const responseData = await response.json();
        const plateList = responseData.data.plate_list.splice(0, maxAmount5);
        createHotListDto.plateIndustry = transformPlateData(plateList);
      }

      // 所有数据都返回了，则resolve
      if (state['stockNormal'] && state['stockValue'] && state['plateConcept'] && state['plateIndustry']) {
        resolve(createHotListDto);

        setTimeout(async () => {
          await browser.close();
        }, 5000)
      }
    })
    page.goto(pageUrl, { timeout: commonTimeOut60s });
  });
};

const getTodayData = async function (pageUrl, apiUrl, browser) {
  const responseJson: any = await waitOriginalDataByUrl(pageUrl, apiUrl, 'json', browser);
  return commonUtil.getIwencaiData(responseJson);
}

export default {
  async getShortTermData(todayDateStr): Promise<CreatePayBackDto> {
    let createPayBackDto: CreatePayBackDto = new CreatePayBackDto();
    const browser = await getBrowser();
    // 准备涨停数据
    const dailyLimitData: Object[] = await getTodayData(iwencaiUrl + params.dailyLimitMoreThan1, 'chart/get-robot-data', browser);
    // 跌停数据
    const downLimitData: Object[] = await getTodayData(iwencaiUrl + params.downLimit, 'chart/get-robot-data', browser);
    // console.log(dailyLimitData);
    // console.log(downLimitData);
    let { SZAmount = 0, SHAmount = 0, board1 = 0, evenBoardData } = transformShortTermSourceData(dailyLimitData, todayDateStr);

    createPayBackDto.createTime = new Date();
    createPayBackDto.downLimitQuantity = downLimitData.length;
    createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
    createPayBackDto.marketHeight = evenBoardData.maxHeight;
    createPayBackDto.board1 = board1;
    createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
    createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
    createPayBackDto.SZAmount = SZAmount;
    createPayBackDto.SHAmount = SHAmount;

    setTimeout(async () => {
      await browser.close();
    }, 5000);
    return createPayBackDto;
  },
  /**
   * 获取 市场数据
   */
  async getMarketData(dateStr): Promise<CreateMarketDataDto> {
    const browser = await getBrowser(browserCloseTimeOut * 5);
    const response: CreateMarketDataDto = await waitMarketDataByUrls(marketUrl, '/api.php', browser);

    const gainianRiseFloat = await waitOriginalDataByUrl(iwencaiUrl + params.gainianRiseFloat, 'chart/get-robot-data', 'json', browser);
    const gainianFallFloat = await waitOriginalDataByUrl(iwencaiUrl + params.gainianFallFloat, 'chart/get-robot-data', 'json', browser);
    const hangyeRiseFloat = await waitOriginalDataByUrl(iwencaiUrl + params.hangyeRiseFloat, 'chart/get-robot-data', 'json', browser);
    const hangyeFallFloat = await waitOriginalDataByUrl(iwencaiUrl + params.hangyeFallFloat, 'chart/get-robot-data', 'json', browser);
    const gainianRiseFloatTop3 = fundsUtil.getPlateTop(gainianRiseFloat, dateStr, 5);
    const gainianFallFloatTop3 = fundsUtil.getPlateTop(gainianFallFloat, dateStr, 5);
    const hangyeRiseFloatTop3 = fundsUtil.getPlateTop(hangyeRiseFloat, dateStr, 5);
    const hangyeFallFloatTop3 = fundsUtil.getPlateTop(hangyeFallFloat, dateStr, 5);
    response.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop3);
    response.gainianFallFloat = JSON.stringify(gainianFallFloatTop3);
    response.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop3);
    response.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop3);
    setTimeout(async () => {
      await browser.close();
    }, 5000);
    return response;
  },
  /**
   * 获取 资金数据
   */
  async getFundsData(dateStr) {
    const browser = await getBrowser(browserCloseTimeOut * 5);
    // TODO 轻量服务器，无法同时打开多个page ，所以待优化，promise.all 方案实施失败
    // 北向资金、南向资金 获取
    const responseForeignFunds = await waitOriginalDataByUrl('https://data.eastmoney.com/hsgt/index.html', 'reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE', 'text', browser);
    const responseMarketTurnover = await waitOriginalDataByUrl('https://data.eastmoney.com/zjlx/dpzjlx.html', 'fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5', 'text', browser);

    const hangyeFundsInflow = await waitOriginalDataByUrl(iwencaiUrl + params.hangyeFundsInflow, 'chart/get-robot-data', 'json', browser);
    const hangyeFundsOutflow = await waitOriginalDataByUrl(iwencaiUrl + params.hangyeFundsOutflow, 'chart/get-robot-data', 'json', browser);
    const gaiNianFundsInflow = await waitOriginalDataByUrl(iwencaiUrl + params.gainianFundsInflow, 'chart/get-robot-data', 'json', browser);
    const gaiNianFundsOutflow = await waitOriginalDataByUrl(iwencaiUrl + params.gainianFundsOutflow, 'chart/get-robot-data', 'json', browser);

    const foreignFunds: any = fundsUtil.transformForeignFunds(responseForeignFunds);
    const marketTurnover: any = fundsUtil.getMarketTurnover(responseMarketTurnover);
    // 获取行业板块流入 Top3
    const hangyeFundsInflowTop3 = fundsUtil.getPlateTop(hangyeFundsInflow, dateStr);
    const hangyeFundsOutflowTop3 = fundsUtil.getPlateTop(hangyeFundsOutflow, dateStr);
    const gainianFundsInflowTop3 = fundsUtil.getPlateTop(gaiNianFundsInflow, dateStr);
    const gainianFundsOutflowTop3 = fundsUtil.getPlateTop(gaiNianFundsOutflow, dateStr);

    const createFundsDataDto = new CreateFundsDataDto();
    createFundsDataDto.createTime = new Date();

    createFundsDataDto.northFundsAmtIn = +(foreignFunds.northFundsAmtIn / 10000).toFixed(2);
    createFundsDataDto.northFundsBuyAmt = +(foreignFunds.northFundsBuyAmt / 10000).toFixed(2);
    createFundsDataDto.southFundsAmtIn = +(foreignFunds.southFundsAmtIn / 10000).toFixed(2);
    createFundsDataDto.southFundsBuyAmt = +(foreignFunds.southFundsBuyAmt / 10000).toFixed(2);
    createFundsDataDto.marketTurnover = +(marketTurnover / 10000 / 10000 / 10000).toFixed(2);
    createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
    createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
    // console.log(createFundsDataDto);
    setTimeout(async () => {
      await browser.close();
    }, 5000);
    return createFundsDataDto;
  },
  /**
   * 通过页面获取 热门数据（耗费资源） - 已废弃
   * @returns 
   */
  async getHotListData() {
    const response = waitHostListDataByUrls('https://eq.10jqka.com.cn/frontend/thsTopRank/index.html');
    return response;
  }
}