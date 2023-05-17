import { chromium, firefox, Browser, Response } from 'playwright';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import commonUtil from './commonUtil';
import fundsUtil from './fundsUtil';
import { iwencaiUrl, params } from './config';

const getBrowser = async () => {
  return await firefox.launch({
    // headless: false // setting this to true will not run the UI
  });;
};
/**
* 
* @param url
* @returns 
*/
const waitOriginalDataByUrl = async (pageUrl, apiUrl, baseBrowser?: Browser): Promise<Response> => {
  const browser = baseBrowser ? baseBrowser : await getBrowser();
  // 打开股票行情页面  
  const page = await browser.newPage();
  return new Promise(async (resolve, reject) => {
    page.on('response', async (response: Response) => {
      // console.log(response.url())

      if (response.url().includes(apiUrl) && response.status() === 200) {
        // 方法自创建的 baseBrowser 需要自动关闭
        !baseBrowser && setTimeout(() => {
          browser.close();
        }, 60000)
        resolve(response);
      }
    })
    await page.goto(pageUrl, { timeout: 60000 });
  });
};

function getPoint(data) {
  const dataLen = data.length;
  const index = data.indexOf(';1500,', dataLen / 2);
  const point = data.substring(index, dataLen - 2).split(',')[1];
  // console.log(index, data.substring(index, dataLen - 1));
  return point;
}

function getFloat(currentPoint, pre) {
  return +((currentPoint - pre) / currentPoint * 100).toFixed(2);
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
const waitMarketDataByUrls = async (pageUrl, apiUrl): Promise<CreateMarketDataDto> => {
  const browser = await getBrowser();
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
        createMarketDataDto.shenzhengFloat = getFloat(createMarketDataDto.shenzhengPoint, pre);
        state.hs_399001 = true;
      }
      // "上证指数" time/hs_1A0001/last.js
      if (response.url().includes('time/hs_1A0001/last.js') && response.status() === 200) {
        const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_1A0001_last(');
        // 昨收盘点数
        const pre = dataJson.hs_1A0001.pre;
        createMarketDataDto.shangzhengPoint = getPoint(dataJson.hs_1A0001.data);
        createMarketDataDto.shangzhengFloat = getFloat(createMarketDataDto.shangzhengPoint, pre);
        state.hs_1A0001 = true;
      }
      // "创业板指" time/hs_399006/last.js
      if (response.url().includes('time/hs_399006/last.js') && response.status() === 200) {
        const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_399006_last(');
        // 昨收盘点数
        const pre = dataJson.hs_399006.pre;
        createMarketDataDto.chuangyePoint = getPoint(dataJson.hs_399006.data);
        createMarketDataDto.chuangyeFloat = getFloat(createMarketDataDto.chuangyePoint, pre);
        state.hs_399006 = true;
      }
      // "北证50"   time/151_899050/last.js
      if (response.url().includes('time/151_899050/last.js') && response.status() === 200) {
        const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_151_899050_last(');
        // 昨收盘点数
        const pre = dataJson['151_899050'].pre;
        createMarketDataDto.beizheng50Point = getPoint(dataJson['151_899050'].data);
        createMarketDataDto.beizheng50Float = getFloat(createMarketDataDto.beizheng50Point, pre);
        state['151_899050'] = true;
      }

      // 所有数据都返回了，则resolve
      if (state['151_899050'] && state['hs_399006'] && state['hs_1A0001'] && state['hs_399001'] && state['apiUrl']) {
        resolve(createMarketDataDto);
      }

      setTimeout(() => {
        browser.close();
      }, 15000)
    })
    await page.goto(pageUrl, { timeout: 60000 });
  });
};

export default {
  async getShortTermData(pageUrl, apiUrl) {
    const response: Response = await waitOriginalDataByUrl(pageUrl, apiUrl);
    const responseJson: any = await response.json();
    const todayData = commonUtil.getIwencaiData(responseJson);
    return todayData;
  },
  /**
   * 获取 市场数据
   */
  async getMarketData(pageUrl, apiUrls): Promise<CreateMarketDataDto> {
    const response: CreateMarketDataDto = await waitMarketDataByUrls(pageUrl, apiUrls);

    return response;
  },
  /**
   * 获取 资金数据
   */
  async getFundsData(dateStr) {
    const browser = await getBrowser();
    // 北向资金、南向资金 获取
    const foreignFundsPromise = waitOriginalDataByUrl('https://data.eastmoney.com/hsgt/index.html', 'reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE', browser);
    const marketTurnoverPromise = waitOriginalDataByUrl('https://data.eastmoney.com/zjlx/dpzjlx.html', 'fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5', browser);
    const hangyeFundsInflowPromise = waitOriginalDataByUrl(iwencaiUrl + params.hangyeFundsInflow, 'chart/get-robot-data', browser);
    const hangyeFundsOutflowPromise = waitOriginalDataByUrl(iwencaiUrl + params.hangyeFundsOutflow, 'chart/get-robot-data', browser);
    const gaiNianFundsInflowPromise = waitOriginalDataByUrl(iwencaiUrl + params.gailianFundsInflow, 'chart/get-robot-data', browser);
    const gaiNianFundsOutflowPromise = waitOriginalDataByUrl(iwencaiUrl + params.gailianFundsOutflow, 'chart/get-robot-data', browser);
    const [responseForeignFunds, responseMarketTurnover, hangyeFundsInflow, hangyeFundsOutflow, gaiNianFundsInflow, gaiNianFundsOutflow] =
      await Promise.all([foreignFundsPromise, marketTurnoverPromise, hangyeFundsInflowPromise, hangyeFundsOutflowPromise, gaiNianFundsInflowPromise, gaiNianFundsOutflowPromise]);

    const foreignFunds: any = await fundsUtil.transformForeignFunds(responseForeignFunds);
    const marketTurnover: any = await fundsUtil.getMarketTurnover(responseMarketTurnover);
    // 获取行业板块流入 Top3
    const hangyeFundsInflowTop3 = await fundsUtil.getPlateTop3(hangyeFundsInflow, dateStr);
    const hangyeFundsOutflowTop3 = await fundsUtil.getPlateTop3(hangyeFundsOutflow, dateStr);
    const gainianFundsInflowTop3 = await fundsUtil.getPlateTop3(gaiNianFundsInflow, dateStr);
    const gainianFundsOutflowTop3 = await fundsUtil.getPlateTop3(gaiNianFundsOutflow, dateStr);

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

    setTimeout(() => {
      browser.close();
    }, 5000);

    return createFundsDataDto;
  }
}