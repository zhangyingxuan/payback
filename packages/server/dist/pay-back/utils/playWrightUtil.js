"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const create_market_data_dto_1 = require("../dto/create-market-data.dto");
const create_funds_data_dto_1 = require("../dto/create-funds-data.dto");
const getBrowser = async () => {
    return await playwright_1.firefox.launch({});
    ;
};
const waitOriginalDataByUrl = async (pageUrl, apiUrl) => {
    const browser = await getBrowser();
    const page = await browser.newPage();
    return new Promise(async (resolve, reject) => {
        page.on('response', async (response) => {
            if (response.url().includes(apiUrl) && response.status() === 200) {
                setTimeout(() => {
                    browser.close();
                }, 60000);
                resolve(response);
            }
        });
        await page.goto(pageUrl, { timeout: 60000 });
    });
};
function getPoint(data) {
    const dataLen = data.length;
    const index = data.indexOf(';1500,', dataLen / 2);
    const point = data.substring(index, dataLen - 2).split(',')[1];
    return point;
}
function getFloat(currentPoint, pre) {
    return +((currentPoint - pre) / currentPoint * 100).toFixed(2);
}
async function getRealDataJson(response, replaceStr) {
    let dataStr = await response.text();
    dataStr = dataStr.replace(replaceStr, '');
    dataStr = dataStr.replace(')', '');
    return JSON.parse(dataStr);
}
const waitMarketDataByUrls = async (pageUrl, apiUrl) => {
    const browser = await getBrowser();
    const page = await browser.newPage();
    return new Promise(async (resolve, reject) => {
        const createMarketDataDto = new create_market_data_dto_1.CreateMarketDataDto();
        const state = {
            apiUrl: false,
            hs_399001: false,
            hs_1A0001: false,
            hs_399006: false,
            151899050: false,
        };
        page.on('response', async (response) => {
            if (response.url().includes(apiUrl) && response.status() === 200) {
                const dataJson = await response.json();
                createMarketDataDto.createTime = new Date();
                createMarketDataDto.dailyLimitIncome = dataJson.jrbx_data.last_zdf;
                createMarketDataDto.fallAmount = dataJson.zdfb_data.dnum;
                createMarketDataDto.riseAmount = dataJson.zdfb_data.znum;
                createMarketDataDto.marketScore = dataJson.dppj_data;
                state.apiUrl = true;
            }
            if (response.url().includes('time/hs_399001/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_399001_last(');
                const pre = dataJson.hs_399001.pre;
                createMarketDataDto.shenzhengPoint = getPoint(dataJson.hs_399001.data);
                createMarketDataDto.shenzhengFloat = getFloat(createMarketDataDto.shenzhengPoint, pre);
                state.hs_399001 = true;
            }
            if (response.url().includes('time/hs_1A0001/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_1A0001_last(');
                const pre = dataJson.hs_1A0001.pre;
                createMarketDataDto.shangzhengPoint = getPoint(dataJson.hs_1A0001.data);
                createMarketDataDto.shangzhengFloat = getFloat(createMarketDataDto.shangzhengPoint, pre);
                state.hs_1A0001 = true;
            }
            if (response.url().includes('time/hs_399006/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_399006_last(');
                const pre = dataJson.hs_399006.pre;
                createMarketDataDto.chuangyePoint = getPoint(dataJson.hs_399006.data);
                createMarketDataDto.chuangyeFloat = getFloat(createMarketDataDto.chuangyePoint, pre);
                state.hs_399006 = true;
            }
            if (response.url().includes('time/151_899050/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_151_899050_last(');
                const pre = dataJson['151_899050'].pre;
                createMarketDataDto.beizheng50Point = getPoint(dataJson['151_899050'].data);
                createMarketDataDto.beizheng50Float = getFloat(createMarketDataDto.beizheng50Point, pre);
                state['151_899050'] = true;
            }
            if (state['151_899050'] && state['hs_399006'] && state['hs_1A0001'] && state['hs_399001'] && state['apiUrl']) {
                resolve(createMarketDataDto);
            }
            setTimeout(() => {
                browser.close();
            }, 15000);
        });
        await page.goto(pageUrl, { timeout: 60000 });
    });
};
exports.default = {
    async getShortTermData(pageUrl, apiUrl) {
        const response = await waitOriginalDataByUrl(pageUrl, apiUrl);
        const responseJson = await response.json();
        const todayData = responseJson.data.answer[0].txt[0].content.components[0].data.datas;
        return todayData;
    },
    async getMarketData(pageUrl, apiUrls) {
        const response = await waitMarketDataByUrls(pageUrl, apiUrls);
        return response;
    },
    async getFundsData() {
        const response = await waitOriginalDataByUrl('https://data.eastmoney.com/hsgt/index.html', 'reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE');
        let dataStr = await response.text();
        let northFundsAmtIn = 0;
        let southFundsAmtIn = 0;
        let northFundsBuyAmt = 0;
        let southFundsBuyAmt = 0;
        let marketTurnover = 0;
        try {
            dataStr = dataStr.substring(dataStr.indexOf('(') + 1, dataStr.length - 2);
            const dataJson = JSON.parse(dataStr);
            const data = dataJson.result.data;
            data.forEach(item => {
                if (item.FUNDS_DIRECTION === '北向') {
                    northFundsAmtIn += item.dayNetAmtIn;
                    northFundsBuyAmt += item.netBuyAmt;
                }
                else {
                    southFundsAmtIn += item.dayNetAmtIn;
                    southFundsBuyAmt += item.netBuyAmt;
                }
            });
        }
        catch (e) {
            console.log(e);
        }
        const responseMarketTurnover = await waitOriginalDataByUrl('https://data.eastmoney.com/zjlx/dpzjlx.html', 'fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5');
        let responseMarketTurnoverStr = await responseMarketTurnover.text();
        const marketTurnoverStr = responseMarketTurnoverStr.substring(responseMarketTurnoverStr.indexOf('(') + 1, responseMarketTurnoverStr.length - 2);
        const responseMarketTurnoverJson = JSON.parse(marketTurnoverStr).data.diff;
        marketTurnover = responseMarketTurnoverJson[0].f6 + responseMarketTurnoverJson[1].f6;
        const createFundsDataDto = new create_funds_data_dto_1.CreateFundsDataDto();
        createFundsDataDto.createTime = new Date();
        createFundsDataDto.northFundsAmtIn = +(northFundsAmtIn / 10000).toFixed(2);
        createFundsDataDto.northFundsBuyAmt = +(northFundsBuyAmt / 10000).toFixed(2);
        createFundsDataDto.southFundsAmtIn = +(southFundsAmtIn / 10000).toFixed(2);
        createFundsDataDto.southFundsBuyAmt = +(southFundsBuyAmt / 10000).toFixed(2);
        createFundsDataDto.marketTurnover = +(marketTurnover / 10000 / 10000 / 10000).toFixed(2);
        return createFundsDataDto;
    }
};
//# sourceMappingURL=playWrightUtil.js.map