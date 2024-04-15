"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeExtra2ShortTermData = exports.getShortTermDataByDate = exports.getShortTermData = void 0;
const create_pay_back_dto_1 = require("../dto/create-pay-back.dto");
const transformDataUtil_1 = require("../utils/transformDataUtil");
const config_1 = require("../core/config");
const fetchUtil_1 = require("../core/fetchUtil");
const pay_back_core_1 = require("pay-back-core");
const dayjs = require("dayjs");
const downLimitNum = 50;
const otherNum = 50;
async function getShortTermData(todayDateStr, lastTradingDayData) {
    const dailyLimitData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.dailyLimitMoreThan1);
    const downLimitData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.downLimit, downLimitNum);
    const dailyLimitOpenData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.dailyLimitOpen);
    const hugeFallData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.hugeFall, otherNum);
    return prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr, lastTradingDayData);
}
exports.getShortTermData = getShortTermData;
async function getShortTermDataByDate(todayDateStr, lastTradingDayData) {
    const dailyLimitData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr));
    const downLimitData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.downLimitByDate.replace('${date}', todayDateStr), downLimitNum);
    const dailyLimitOpenData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.dailyLimitOpenByDate.replace('${date}', todayDateStr));
    const hugeFallData = await (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.hugeFallByDate.replace('${date}', todayDateStr), otherNum);
    return prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr, lastTradingDayData);
}
exports.getShortTermDataByDate = getShortTermDataByDate;
function prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr, lastTradingDayData) {
    const createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
    const { board1 = 0, evenBoardData, downLimitDataArr, hugeFallDataArr, dailyLimitReturnSealQuantity, } = (0, transformDataUtil_1.transformShortTermSourceData)(dailyLimitData.data, downLimitData.data, hugeFallData.data, todayDateStr);
    createPayBackDto.downLimitQuantity = downLimitData.length;
    createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
    createPayBackDto.dailyLimitOpenQuantity = dailyLimitOpenData.length;
    createPayBackDto.sealingRate = Math.round((dailyLimitData.length / (dailyLimitData.length + dailyLimitOpenData.length)) * 100);
    createPayBackDto.dailyLimitReturnSealQuantity = dailyLimitReturnSealQuantity;
    createPayBackDto.marketHeight = evenBoardData.maxHeight;
    createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
    createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
    createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
    createPayBackDto.hugeFallData = JSON.stringify(hugeFallDataArr);
    createPayBackDto.createTime = new Date();
    createPayBackDto.cycle = (0, pay_back_core_1.getCurrentCycle)(Object.assign(Object.assign({}, createPayBackDto), { hugeFallData: hugeFallDataArr }), lastTradingDayData);
    return createPayBackDto;
}
function mergeExtra2ShortTermData(shortTermData, specialStocks) {
    if (shortTermData.length === 0 || specialStocks.length === 0)
        return shortTermData;
    const shortTermDataLen = shortTermData.length;
    for (let i = 0; i < shortTermDataLen - 1; i++) {
        const currentDate = dayjs(shortTermData[i].createTime).format(pay_back_core_1.iWencaiDateFormat);
        const currentSpecialStock = findBiddingDataByCreateTime(specialStocks, currentDate);
        if (currentSpecialStock && currentSpecialStock.biddingData) {
            const evenBoardData = prepareEvenBoardData(JSON.parse(shortTermData[i + 1].evenBoardData), JSON.parse(currentSpecialStock.biddingData));
            shortTermData[i + 1].evenBoardData = JSON.stringify(evenBoardData);
        }
        if (specialStocks[i]) {
            shortTermData[i].newStock = specialStocks[i].newStock;
            shortTermData[i].chooseStock = specialStocks[i].chooseStock;
            shortTermData[i].biddingDataUpdateTime = specialStocks[i].updatedTime;
        }
    }
    return shortTermData;
}
exports.mergeExtra2ShortTermData = mergeExtra2ShortTermData;
function findBiddingDataByCreateTime(biddingDatas, createDate) {
    return biddingDatas.find(item => {
        return dayjs(item.createTime).format(pay_back_core_1.iWencaiDateFormat) === createDate;
    });
}
function prepareEvenBoardData(evenBoardData, currentBiddingData) {
    const maxHeight = evenBoardData.maxHeight;
    for (let currentHeight = 1; currentHeight <= maxHeight; currentHeight++) {
        evenBoardData[currentHeight] &&
            (evenBoardData[currentHeight] = evenBoardData[currentHeight].map(item => {
                const biddingData = currentBiddingData.find(biddingItem => {
                    return biddingItem.code === item.code;
                }) || {};
                item.biddingData = biddingData;
                return item;
            }));
    }
    return evenBoardData;
}
//# sourceMappingURL=shortTermUtil.js.map