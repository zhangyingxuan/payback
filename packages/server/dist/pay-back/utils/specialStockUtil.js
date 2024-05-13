"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSpecialStockBinddingData = exports.fetchLastdayDailyLimitBinddingData = void 0;
const transformDataUtil_1 = require("./transformDataUtil");
const config_1 = require("../core/config");
const fetchUtil_1 = require("../core/fetchUtil");
async function fetchLastdayDailyLimitBinddingData(todayDateStr, yesterdayDateStr) {
    const dailyLimitYesterdayDataRs = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.dailyLimitYesterday);
    const dailyLimitYesterdayBidding = (0, transformDataUtil_1.transformBidData)(dailyLimitYesterdayDataRs.data, todayDateStr, yesterdayDateStr);
    return dailyLimitYesterdayBidding;
}
exports.fetchLastdayDailyLimitBinddingData = fetchLastdayDailyLimitBinddingData;
async function fetchSpecialStockBinddingData(todayDateStr, yesterdayDateStr) {
    const chooseStock1ExpectedRs = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.chooseStock1Expected);
    const newStocksRs = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.chooseStockNewStock);
    const chooseStock1Expected = (0, transformDataUtil_1.transformStrongStockData)(chooseStock1ExpectedRs.data, todayDateStr, yesterdayDateStr);
    const newStocks = (0, transformDataUtil_1.transformNewStockData)(newStocksRs.data, todayDateStr);
    return { newStocks, chooseStock1Expected };
}
exports.fetchSpecialStockBinddingData = fetchSpecialStockBinddingData;
//# sourceMappingURL=specialStockUtil.js.map