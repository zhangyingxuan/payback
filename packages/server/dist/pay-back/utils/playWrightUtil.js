"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const create_market_data_dto_1 = require("../dto/create-market-data.dto");
const create_funds_data_dto_1 = require("../dto/create-funds-data.dto");
const create_hot_list_dto_1 = require("../dto/create-hot-list.dto");
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
    logger.log('等待接口返回 start ====', pageUrl);
    const page = await browser.newPage();
    !baseBrowser && setTimeout(() => {
        logger.log('接口返回超时，自动关闭browser ====');
        browser.close();
    }, commonTimeOut60s);
    return new Promise((resolve, reject) => {
        page.on('response', async (response) => {
            if (response.url().includes(apiUrl) && response.status() === 200) {
                logger.log('等待接口返回 end ====', pageUrl);
                let responseData;
                if (transfromType == 'json') {
                    responseData = await response.json();
                }
                else {
                    responseData = await response.text();
                }
                await page.close();
                setTimeout(() => {
                    resolve(responseData);
                }, 2000);
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
function transformStockData(stockList) {
    return JSON.stringify(stockList.map(item => {
        var _a;
        return {
            code: item.code,
            name: item.name,
            rise_and_fall: item.rise_and_fall,
            tag: (_a = item.tag) === null || _a === void 0 ? void 0 : _a.concept_tag,
        };
    }));
}
function transformPlateData(plateList) {
    return JSON.stringify(plateList.map(item => {
        return {
            code: item.code,
            name: item.name,
            rise_and_fall: item.rise_and_fall,
            hot_tag: item.hot_tag,
            tag: item.tag,
        };
    }));
}
const waitHostListDataByUrls = async (pageUrl) => {
    const browser = await getBrowser();
    const page = await browser.newPage();
    return new Promise(async (resolve, reject) => {
        const maxAmount10 = 10;
        const maxAmount5 = 5;
        const createHotListDto = new create_hot_list_dto_1.CreateHotListDto();
        const state = {
            stockNormal: false,
            stockValue: false,
            plateConcept: false,
            plateIndustry: false,
        };
        page.on('response', async (response) => {
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
            if (state['stockNormal'] && state['stockValue'] && state['plateConcept'] && state['plateIndustry']) {
                resolve(createHotListDto);
            }
            setTimeout(() => {
                browser.close();
            }, 15000);
        });
        await page.goto(pageUrl, { timeout: commonTimeOut60s });
    });
};
const getTodayData = async function (pageUrl, apiUrl, browser) {
    const responseJson = await waitOriginalDataByUrl(pageUrl, apiUrl, 'json', browser);
    return commonUtil_1.default.getIwencaiData(responseJson);
};
exports.default = {
    async getShortTermData(todayDateStr) {
        let createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
        const browser = await getBrowser();
        const dailyLimitData = await getTodayData(config_1.iwencaiUrl + config_1.params.dailyLimitMoreThan1, 'chart/get-robot-data', browser);
        const downLimitData = await getTodayData(config_1.iwencaiUrl + config_1.params.downLimit, 'chart/get-robot-data', browser);
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
        setTimeout(async () => {
            await browser.close();
        }, 5000);
        return createPayBackDto;
    },
    async getMarketData(pageUrl, apiUrls) {
        const response = await waitMarketDataByUrls(pageUrl, apiUrls);
        return response;
    },
    async getFundsData(dateStr) {
        const browser = await getBrowser();
        const responseForeignFunds = await waitOriginalDataByUrl('https://data.eastmoney.com/hsgt/index.html', 'reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE', 'text', browser);
        const responseMarketTurnover = await waitOriginalDataByUrl('https://data.eastmoney.com/zjlx/dpzjlx.html', 'fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5', 'text', browser);
        const hangyeFundsInflow = await waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.hangyeFundsInflow, 'chart/get-robot-data', 'json', browser);
        const hangyeFundsOutflow = await waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.hangyeFundsOutflow, 'chart/get-robot-data', 'json', browser);
        const gaiNianFundsInflow = await waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.gailianFundsInflow, 'chart/get-robot-data', 'json', browser);
        const gaiNianFundsOutflow = await waitOriginalDataByUrl(config_1.iwencaiUrl + config_1.params.gailianFundsOutflow, 'chart/get-robot-data', 'json', browser);
        const foreignFunds = fundsUtil_1.default.transformForeignFunds(responseForeignFunds);
        const marketTurnover = fundsUtil_1.default.getMarketTurnover(responseMarketTurnover);
        const hangyeFundsInflowTop3 = fundsUtil_1.default.getPlateTop3(hangyeFundsInflow, dateStr);
        const hangyeFundsOutflowTop3 = fundsUtil_1.default.getPlateTop3(hangyeFundsOutflow, dateStr);
        const gainianFundsInflowTop3 = fundsUtil_1.default.getPlateTop3(gaiNianFundsInflow, dateStr);
        const gainianFundsOutflowTop3 = fundsUtil_1.default.getPlateTop3(gaiNianFundsOutflow, dateStr);
        const createFundsDataDto = new create_funds_data_dto_1.CreateFundsDataDto();
        createFundsDataDto.createTime = new Date();
        createFundsDataDto.northFundsAmtIn = +(foreignFunds.northFundsAmtIn / 10000).toFixed(2);
        createFundsDataDto.northFundsBuyAmt = +(foreignFunds.northFundsBuyAmt / 10000).toFixed(2);
        createFundsDataDto.southFundsAmtIn = +(foreignFunds.southFundsAmtIn / 10000).toFixed(2);
        createFundsDataDto.southFundsBuyAmt = +(foreignFunds.southFundsBuyAmt / 10000).toFixed(2);
        createFundsDataDto.marketTurnover = +(marketTurnover / 10000 / 10000 / 10000).toFixed(2);
        createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
        createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
        setTimeout(async () => {
            await browser.close();
        }, 5000);
        return createFundsDataDto;
    },
    getHotListData(dateStr) {
        const response = waitHostListDataByUrls('https://eq.10jqka.com.cn/frontend/thsTopRank/index.html');
        return response;
    }
};
//# sourceMappingURL=playWrightUtil.js.map