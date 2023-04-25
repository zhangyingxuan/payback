import { chromium, firefox, Page } from 'playwright';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';

interface Response {
  data?: any,
}

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
const waitOriginalDataByUrl = async (pageUrl, apiUrl): Promise<Response> => {
  // apiUrl 如果是数组，则需要 获取相等数量的数据后 才能返回成功

  const browser = await getBrowser();
  // 打开股票行情页面  
  const page = await browser.newPage();
  return new Promise(async (resolve, reject) => {
    page.on('response', async response => {
      // console.log(response.url())
      if (response.url().includes(apiUrl) && response.status() === 200) {
        const dataJson = await response.json();
        setTimeout(() => {
          browser.close();
        }, 15000)
        resolve(dataJson);
      }
    })
    await page.goto(pageUrl);
  });
};

function getPoint(data) {
  const dataLen = data.length;
  const index = data.lastIndexOf(';', dataLen - 100);
  const point = data.substring(index, dataLen).split(',')[1];
  console.log(point);
  return point;
}

/**
* 
* @param url 准备涨停数据
* @returns 
*/
const waitMarketDataByUrls = async (pageUrl, apiUrl): Promise<CreateMarketDataDto> => {
  // apiUrl 如果是数组，则需要 获取相等数量的数据后 才能返回成功

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
        let dataStr = await response.text();
        dataStr = dataStr.replace('quotebridge_v6_time_hs_399001_last(', '')
        dataStr = dataStr.replace(')', '')
        const dataJson = JSON.parse(dataStr);
        // 昨收盘点数
        const pre = dataJson.hs_399001.pre;
        createMarketDataDto.shenzhengPoint = getPoint(dataJson.hs_399001.data);
        createMarketDataDto.chuangyeFloat = (createMarketDataDto.shenzhengPoint - pre) / createMarketDataDto.shenzhengPoint;

        state.hs_399001 = true;
      }
      // "上证指数" time/hs_1A0001/last.js
      if (response.url().includes('time/hs_1A0001/last.js') && response.status() === 200) {
        let dataStr = await response.text();
        dataStr = dataStr.replace('quotebridge_v6_time_hs_1A0001_last(', '')
        dataStr = dataStr.replace(')', '')
        const dataJson = JSON.parse(dataStr);
        // 昨收盘点数
        const pre = dataJson.hs_1A0001.pre;
        createMarketDataDto.shangzhengPoint = getPoint(dataJson.hs_1A0001.data);
        createMarketDataDto.shangzhengFloat = (createMarketDataDto.shangzhengPoint - pre) / createMarketDataDto.shangzhengPoint;
        state.hs_1A0001 = true;
      }
      // "创业板指" time/hs_399006/last.js
      if (response.url().includes('time/hs_399006/last.js') && response.status() === 200) {
        let dataStr = await response.text();
        dataStr = dataStr.replace('quotebridge_v6_time_hs_399006_last(', '')
        dataStr = dataStr.replace(')', '')
        const dataJson = JSON.parse(dataStr);
        // 昨收盘点数
        const pre = dataJson.hs_399006.pre;
        createMarketDataDto.chuangyePoint = getPoint(dataJson.hs_399006.data);
        createMarketDataDto.chuangyeFloat = (createMarketDataDto.chuangyePoint - pre) / createMarketDataDto.chuangyePoint;
        state.hs_399006 = true;
      }
      // "北证50"   time/151_899050/last.js
      if (response.url().includes('time/151_899050/last.js') && response.status() === 200) {
        let dataStr = await response.text();
        dataStr = dataStr.replace('quotebridge_v6_time_151_899050_last(', '')
        dataStr = dataStr.replace(')', '')
        const dataJson = JSON.parse(dataStr);
        // 昨收盘点数
        const pre = dataJson['151_899050'].pre;
        createMarketDataDto.beizheng50Point = getPoint(dataJson['151_899050'].data);
        createMarketDataDto.beizheng50Float = (createMarketDataDto.beizheng50Point - pre) / createMarketDataDto.beizheng50Point;
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
    await page.goto(pageUrl);
  });
};

export default {
  async getShortTermData(pageUrl, apiUrl) {
    const response = await waitOriginalDataByUrl(pageUrl, apiUrl);
    const todayData = response.data.answer[0].txt[0].content.components[0].data.datas;
    return todayData;
  },
  /**
   * 获取 市场数据
   */
  async getMarketData(pageUrl, apiUrls) {
    const response: CreateMarketDataDto = await waitMarketDataByUrls(pageUrl, apiUrls);

    // createMarketDataDto.marketPoint = response.dppj_data;
    return response;
  }
}