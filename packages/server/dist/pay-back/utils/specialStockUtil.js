"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBiddingData = void 0;
const transformDataUtil_1 = require("./transformDataUtil");
const config_1 = require("../core/config");
const fetchUtil_1 = require("../core/fetchUtil");
const dailyLimitNum = 999;
const otherNum = 99;
async function getBiddingData(todayDateStr, yesterdayDateStr) {
    const dailyLimitYesterdayDataRs = await (0, fetchUtil_1.fetchStocksByIwencai)(config_1.params.dailyLimitYesterday, dailyLimitNum);
    const chooseStock1ExpectedRs = await (0, fetchUtil_1.fetchStocksByIwencai)(config_1.params.chooseStock1Expected, dailyLimitNum);
    const newStocksRs = await (0, fetchUtil_1.fetchStocksByIwencai)(config_1.params.chooseStockNewStock, otherNum);
    const dailyLimitYesterdayBidding = (0, transformDataUtil_1.transformBidData)(dailyLimitYesterdayDataRs, todayDateStr, yesterdayDateStr);
    const chooseStock1Expected = (0, transformDataUtil_1.transformStrongStockData)(chooseStock1ExpectedRs, todayDateStr, yesterdayDateStr);
    const newStocks = (0, transformDataUtil_1.transformNewStockData)(newStocksRs, todayDateStr);
    return { dailyLimitYesterdayBidding, newStocks, chooseStock1Expected };
}
exports.getBiddingData = getBiddingData;
//# sourceMappingURL=specialStockUtil.js.map