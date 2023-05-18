"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const create_market_data_dto_1 = require("../dto/create-market-data.dto");
const create_funds_data_dto_1 = require("../dto/create-funds-data.dto");
const commonUtil_1 = require("./commonUtil");
const fundsUtil_1 = require("./fundsUtil");
const config_1 = require("./config");
const common_1 = require("@nestjs/common");
const create_pay_back_dto_1 = require("../dto/create-pay-back.dto");
const transformDataUtil_1 = require("../utils/transformDataUtil");
const logger = new common_1.Logger('playWrightUtil');
const browserOpenTimeOut = 60000;
const commonTimeOut60s = 60000;
const getBrowser = async () => {
    return await playwright_1.firefox.launch({
        timeout: browserOpenTimeOut,
    });
    ;
};
const waitOriginalDataByUrl = async (pageUrl, apiUrl, transfromType, baseBrowser) => {
    const browser = baseBrowser ? baseBrowser : await getBrowser();
    logger.log('等待接口返回 start ====', apiUrl);
    const page = await browser.newPage();
    return new Promise((resolve, reject) => {
        !baseBrowser && setTimeout(() => {
            logger.log('接口返回超时，自动关闭browser ====');
            browser.close();
        }, commonTimeOut60s);
        page.on('response', async (response) => {
            if (response.url().includes(apiUrl) && response.status() === 200) {
                logger.log('等待接口返回 end ====', apiUrl);
                let responseData;
                if (transfromType == 'json') {
                    responseData = await response.json();
                }
                else {
                    responseData = await response.text();
                }
                await page.close();
                resolve(responseData);
            }
        });
        page.goto(pageUrl, { timeout: commonTimeOut60s, waitUntil: "domcontentloaded" });
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
        await page.goto(pageUrl, { timeout: commonTimeOut60s });
    });
};
const getTodayData = async function (pageUrl, apiUrl) {
    const responseJson = await waitOriginalDataByUrl(pageUrl, apiUrl, 'json');
    return commonUtil_1.default.getIwencaiData(responseJson);
};
exports.default = {
    async getShortTermData(todayDateStr) {
        let createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
        const dailyLimitData = await getTodayData(config_1.iwencaiUrl + config_1.params.dailyLimitMoreThan1, 'chart/get-robot-data');
        const downLimitData = await getTodayData(config_1.iwencaiUrl + config_1.params.downLimit, 'chart/get-robot-data');
        let { SZAmount = 0, SHAmount = 0, board1 = 0, evenBoardData } = transformDataUtil_1.default.transformShortTermSourceData(dailyLimitData, todayDateStr);
        createPayBackDto.createTime = new Date();
        createPayBackDto.downLimitQuantity = downLimitData.length;
        createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
        createPayBackDto.marketHeight = evenBoardData.maxHeight;
        createPayBackDto.board1 = board1;
        createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
        createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
        createPayBackDto.SZAmount = SZAmount;
        createPayBackDto.SHAmount = SHAmount;
        return createPayBackDto;
    },
    async getMarketData(pageUrl, apiUrls) {
        const response = await waitMarketDataByUrls(pageUrl, apiUrls);
        return response;
    },
    async getFundsData(dateStr) {
        const browser = await getBrowser();
        const foreignFundsPromise = waitOriginalDataByUrl('https://data.eastmoney.com/hsgt/index.html', 'reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE', 'text', browser);
        const marketTurnoverPromise = waitOriginalDataByUrl('https://data.eastmoney.com/zjlx/dpzjlx.html', 'fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5', 'text', browser);
        const hangyeFundsInflowPromise = waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.hangyeFundsInflow, 'chart/get-robot-data', 'text', browser);
        const [responseForeignFunds, responseMarketTurnover, hangyeFundsInflow] = await Promise.all([foreignFundsPromise, marketTurnoverPromise, hangyeFundsInflowPromise]);
        const hangyeFundsOutflowPromise = waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.hangyeFundsOutflow, 'chart/get-robot-data', 'text', browser);
        const gaiNianFundsInflowPromise = waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.gailianFundsInflow, 'chart/get-robot-data', 'text', browser);
        const gaiNianFundsOutflowPromise = waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.gailianFundsOutflow, 'chart/get-robot-data', 'text', browser);
        const [hangyeFundsOutflow, gaiNianFundsInflow, gaiNianFundsOutflow] = await Promise.all([hangyeFundsOutflowPromise, gaiNianFundsInflowPromise, gaiNianFundsOutflowPromise]);
        const foreignFunds = await fundsUtil_1.default.transformForeignFunds(responseForeignFunds);
        const marketTurnover = await fundsUtil_1.default.getMarketTurnover(responseMarketTurnover);
        const hangyeFundsInflowTop3 = await fundsUtil_1.default.getPlateTop3(hangyeFundsInflow, dateStr);
        const hangyeFundsOutflowTop3 = await fundsUtil_1.default.getPlateTop3(hangyeFundsOutflow, dateStr);
        const gainianFundsInflowTop3 = await fundsUtil_1.default.getPlateTop3(gaiNianFundsInflow, dateStr);
        const gainianFundsOutflowTop3 = await fundsUtil_1.default.getPlateTop3(gaiNianFundsOutflow, dateStr);
        const createFundsDataDto = new create_funds_data_dto_1.CreateFundsDataDto();
        createFundsDataDto.createTime = new Date();
        createFundsDataDto.northFundsAmtIn = +(foreignFunds.northFundsAmtIn / 10000).toFixed(2);
        createFundsDataDto.northFundsBuyAmt = +(foreignFunds.northFundsBuyAmt / 10000).toFixed(2);
        createFundsDataDto.southFundsAmtIn = +(foreignFunds.southFundsAmtIn / 10000).toFixed(2);
        createFundsDataDto.southFundsBuyAmt = +(foreignFunds.southFundsBuyAmt / 10000).toFixed(2);
        createFundsDataDto.marketTurnover = +(marketTurnover / 10000 / 10000 / 10000).toFixed(2);
        createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
        createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
        setTimeout(() => {
            browser.close();
        }, 5000);
        return createFundsDataDto;
    }
};
//# sourceMappingURL=playWrightUtil.js.map