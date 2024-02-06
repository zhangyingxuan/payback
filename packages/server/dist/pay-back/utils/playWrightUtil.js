"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const create_market_data_dto_1 = require("../dto/create-market-data.dto");
const create_funds_data_dto_1 = require("../dto/create-funds-data.dto");
const commonUtil_1 = require("./commonUtil");
const fundsUtil_1 = require("./fundsUtil");
const config_1 = require("../core/config");
const common_1 = require("@nestjs/common");
const node_fetch_1 = require("node-fetch");
const fetchUtil_1 = require("../core/fetchUtil");
const logger = new common_1.Logger('playWrightUtil');
const browserOpenTimeOut = 60000;
const browserCloseTimeOut = 30000;
const commonTimeOut60s = 60000;
const getBrowser = async (autoCloseTime = browserCloseTimeOut) => {
    const browser = await playwright_1.firefox.launch({
        timeout: browserOpenTimeOut,
    });
    setTimeout(async () => {
        await browser.close();
        logger.log('自动关闭browser ====' + autoCloseTime);
    }, autoCloseTime);
    return browser;
};
const waitOriginalDataByUrl = async (pageUrl, apiUrl, transfromType, baseBrowser) => {
    const browser = baseBrowser ? baseBrowser : await getBrowser();
    logger.log('等待接口返回 start ====' + pageUrl);
    const page = await browser.newPage();
    return new Promise(resolve => {
        page.on('response', async (response) => {
            if (response.url().includes(apiUrl) && response.status() === 200) {
                logger.log('等待接口返回 end ====' + pageUrl);
                let responseData;
                if (transfromType == 'json') {
                    responseData = await response.json();
                }
                else {
                    responseData = await response.text();
                }
                setTimeout(() => {
                    resolve(responseData);
                }, 2000);
            }
        });
        page.goto(pageUrl, { timeout: commonTimeOut60s, waitUntil: 'domcontentloaded' });
    });
};
function getPoint(data) {
    const dataLen = data.length;
    const index = data.indexOf(';1500,', dataLen / 2);
    const point = data.substring(index, dataLen - 2).split(',')[1];
    return point;
}
async function getRealDataJson(response, replaceStr) {
    let dataStr = await response.text();
    dataStr = dataStr.replace(replaceStr, '');
    dataStr = dataStr.replace(')', '');
    return JSON.parse(dataStr);
}
const waitMarketDataByUrls = async (pageUrl, apiUrl, browser) => {
    logger.log('等待接口返回 start ====' + pageUrl);
    const page = await browser.newPage();
    return new Promise(async (resolve) => {
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
                createMarketDataDto.dailyLimitIncome = dataJson.jrbx_data.last_zdf;
                createMarketDataDto.fallAmount = dataJson.zdfb_data.dnum;
                createMarketDataDto.riseAmount = dataJson.zdfb_data.znum;
                createMarketDataDto.marketScore = dataJson.dppj_data;
                state.apiUrl = true;
            }
            if (response.url().includes('time/hs_399001/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_399001_last(');
                createMarketDataDto.shenzhengPoint = getPoint(dataJson.hs_399001.data);
                state.hs_399001 = true;
            }
            if (response.url().includes('time/hs_1A0001/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_1A0001_last(');
                createMarketDataDto.shangzhengPoint = getPoint(dataJson.hs_1A0001.data);
                state.hs_1A0001 = true;
            }
            if (response.url().includes('time/hs_399006/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_hs_399006_last(');
                createMarketDataDto.chuangyePoint = getPoint(dataJson.hs_399006.data);
                state.hs_399006 = true;
            }
            if (response.url().includes('time/151_899050/last.js') && response.status() === 200) {
                const dataJson = await getRealDataJson(response, 'quotebridge_v6_time_151_899050_last(');
                createMarketDataDto.beizheng50Point = getPoint(dataJson['151_899050'].data);
                state['151_899050'] = true;
            }
            if (state['151_899050'] && state['hs_399006'] && state['hs_1A0001'] && state['hs_399001'] && state['apiUrl']) {
                await page.close();
                logger.log('接口返回数据【成功】 ====' + pageUrl);
                setTimeout(() => {
                    resolve(createMarketDataDto);
                }, 1000);
            }
        });
        page.goto(pageUrl, { timeout: commonTimeOut60s, waitUntil: 'domcontentloaded' });
    });
};
exports.default = {
    async getMarketData(dateStr) {
        const browser = await getBrowser(browserCloseTimeOut);
        const response = await waitMarketDataByUrls(config_1.marketUrl, '/api.php', browser);
        const gainianRiseFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianRiseFloat);
        const gainianFallFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianFallFloat);
        const hangyeRiseFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeRiseFloat);
        const hangyeFallFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeFallFloat);
        const gainianRiseFloatTop3 = fundsUtil_1.default.getPlateTop(gainianRiseFloat, dateStr);
        const gainianFallFloatTop3 = fundsUtil_1.default.getPlateTop(gainianFallFloat, dateStr);
        const hangyeRiseFloatTop3 = fundsUtil_1.default.getPlateTop(hangyeRiseFloat, dateStr);
        const hangyeFallFloatTop3 = fundsUtil_1.default.getPlateTop(hangyeFallFloat, dateStr);
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
    async getFundsData(dateStr) {
        const browser = await getBrowser(browserCloseTimeOut * 2);
        const responseForeignFunds = await waitOriginalDataByUrl('https://data.eastmoney.com/hsgt/index.html', 'reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE', 'text', browser);
        const responseMarketTurnover = await (await (0, node_fetch_1.default)('https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=1688383194362')).text();
        const hangyeFundsInflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.iwencaiUrl + config_1.params.hangyeFundsInflow);
        const hangyeFundsOutflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.iwencaiUrl + config_1.params.hangyeFundsOutflow);
        const gaiNianFundsInflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.iwencaiUrl + config_1.params.gainianFundsInflow);
        const gaiNianFundsOutflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.iwencaiUrl + config_1.params.gainianFundsOutflow);
        const foreignFunds = fundsUtil_1.default.transformForeignFunds(responseForeignFunds);
        const marketTurnover = fundsUtil_1.default.getMarketTurnover(responseMarketTurnover);
        const hangyeFundsInflowTop3 = fundsUtil_1.default.getPlateTop(hangyeFundsInflow, dateStr, 3);
        const hangyeFundsOutflowTop3 = fundsUtil_1.default.getPlateTop(hangyeFundsOutflow, dateStr, 3);
        const gainianFundsInflowTop3 = fundsUtil_1.default.getPlateTop(gaiNianFundsInflow, dateStr, 3);
        const gainianFundsOutflowTop3 = fundsUtil_1.default.getPlateTop(gaiNianFundsOutflow, dateStr, 3);
        const createFundsDataDto = new create_funds_data_dto_1.CreateFundsDataDto();
        createFundsDataDto.northFundsAmtIn = commonUtil_1.default.toFixed(foreignFunds.northFundsAmtIn / 10000);
        createFundsDataDto.northFundsBuyAmt = commonUtil_1.default.toFixed(foreignFunds.northFundsBuyAmt / 10000);
        createFundsDataDto.southFundsAmtIn = commonUtil_1.default.toFixed(foreignFunds.southFundsAmtIn / 10000);
        createFundsDataDto.southFundsBuyAmt = commonUtil_1.default.toFixed(foreignFunds.southFundsBuyAmt / 10000);
        createFundsDataDto.marketTurnover = commonUtil_1.default.toFixed(marketTurnover / 10000 / 10000 / 10000);
        createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
        createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
        createFundsDataDto.createTime = new Date();
        setTimeout(async () => {
            await browser.close();
        }, 2000);
        return createFundsDataDto;
    },
};
//# sourceMappingURL=playWrightUtil.js.map