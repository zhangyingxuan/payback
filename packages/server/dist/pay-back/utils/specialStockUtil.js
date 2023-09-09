"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBiddingData = void 0;
const transformDataUtil_1 = require("./transformDataUtil");
const config_1 = require("../core/config");
const fetchUtil_1 = require("../core/fetchUtil");
async function getBiddingData(todayDateStr, yesterdayDateStr) {
    const dailyLimitYesterdayData = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.dailyLimitYesterday, 100, false);
    const chooseStock1to2 = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.chooseStock1to2, 100, false);
    const newStocks = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.chooseStockNewStock, 100, false);
    const dailyLimitYesterdayBiddingDtos = (0, transformDataUtil_1.transformBidData)(dailyLimitYesterdayData, todayDateStr, yesterdayDateStr, true);
    const chooseStock1to2Pds = (0, transformDataUtil_1.transformBidData)(chooseStock1to2, todayDateStr, yesterdayDateStr, true);
    const chooseStock1to2Dtos = chooseStock1to2Pds.filter(stock => {
        return stock.bidVolumeRatio >= 10 && (stock.expected != 0);
    });
    const newStocksDtos = (0, transformDataUtil_1.transformBidData)(newStocks, todayDateStr, yesterdayDateStr);
    return { dailyLimitYesterdayBiddingDtos, newStocksDtos, chooseStock1to2Dtos };
}
exports.getBiddingData = getBiddingData;
//# sourceMappingURL=specialStockUtil.js.map