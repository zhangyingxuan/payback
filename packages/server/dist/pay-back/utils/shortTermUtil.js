"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeExtra2ShortTermData = exports.getShortTermDataByDate = exports.getShortTermData = void 0;
const create_pay_back_dto_1 = require("../dto/create-pay-back.dto");
const transformDataUtil_1 = require("./transformDataUtil");
const config_1 = require("../core/config");
const fetchUtil_1 = require("../core/fetchUtil");
const pay_back_core_1 = require("pay-back-core");
const dayjs = require("dayjs");
const abortFetch_1 = require("../../utils/abortFetch");
const downLimitNum = 50;
const otherNum = 50;
function isBefore930() {
    const currentTime = dayjs();
    return currentTime.hour() < 9 || (currentTime.hour() === 9 && currentTime.minute() < 30);
}
async function fetchDailyLimitGroupByGainian(todayDateStr) {
    const url = `https://data.10jqka.com.cn/dataapi/limit_up/block_top?filter=HS,GEM2STAR&date=${dayjs(todayDateStr).format('YYYYMMDD')}`;
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await (0, abortFetch_1.createFetch)()(url);
            if (!response.ok)
                throw new Error(`题材聚合接口请求失败: HTTP ${response.status}`);
            return await response.json();
        }
        catch (error) {
            lastError = error;
            if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            }
        }
    }
    throw lastError;
}
async function getShortTermData(todayDateStr, lastTradingDayData, cookie = '') {
    const dailyLimit = (0, fetchUtil_1.fetchAllStocksByIwencai)(isBefore930() ? '今日涨停；非st；非退市；行业' : config_1.params.dailyLimitMoreThan1, null, cookie);
    const downLimit = (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.downLimit, downLimitNum, cookie);
    const dailyLimitOpen = (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.dailyLimitOpen, null, cookie);
    const hugeFall = (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.hugeFall, otherNum, cookie);
    const dailyLimitGroupByGainain = fetchDailyLimitGroupByGainian(todayDateStr);
    const [dailyLimitData, downLimitData, dailyLimitOpenData, hugeFallData, dailyLimitGroupByGainainD] = await Promise.all([dailyLimit, downLimit, dailyLimitOpen, hugeFall, dailyLimitGroupByGainain]);
    const dailyLimitGroupByGainainData = dailyLimitGroupByGainainD;
    return prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, lastTradingDayData, dailyLimitGroupByGainainData, todayDateStr);
}
exports.getShortTermData = getShortTermData;
async function getShortTermDataByDate(todayDateStr, lastTradingDayData, cookie = '') {
    const dailyLimit = (0, fetchUtil_1.fetchAllStocksByIwencai)((isBefore930() ? config_1.params.binddingDailyLimitMoreThan1ByDate : config_1.params.dailyLimitMoreThan1ByDate).replace('${date}', todayDateStr), null, cookie);
    const downLimit = (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.downLimitByDate.replace('${date}', todayDateStr), downLimitNum, cookie);
    const dailyLimitOpen = (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.dailyLimitOpenByDate.replace('${date}', todayDateStr), null, cookie);
    const hugeFall = (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.hugeFallByDate.replace('${date}', todayDateStr), otherNum, cookie);
    const dailyLimitGroupByGainain = fetchDailyLimitGroupByGainian(todayDateStr);
    const [dailyLimitData, downLimitData, dailyLimitOpenData, hugeFallData, dailyLimitGroupByGainainD] = await Promise.all([dailyLimit, downLimit, dailyLimitOpen, hugeFall, dailyLimitGroupByGainain]);
    const dailyLimitGroupByGainainData = dailyLimitGroupByGainainD;
    return prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, lastTradingDayData, dailyLimitGroupByGainainData, todayDateStr);
}
exports.getShortTermDataByDate = getShortTermDataByDate;
function prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, lastTradingDayData, dailyLimitGroupByGainainData, todayDateStr) {
    const createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
    const { board1 = 0, evenBoardData, downLimitDataArr, hugeFallDataArr, dailyLimitReturnSealQuantity, } = (0, transformDataUtil_1.transformShortTermSourceData)(dailyLimitData.data, downLimitData.data, hugeFallData.data, dailyLimitGroupByGainainData.data, todayDateStr);
    createPayBackDto.downLimitQuantity = downLimitData.length;
    createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
    createPayBackDto.dailyLimitOpenQuantity = dailyLimitOpenData.length;
    createPayBackDto.hugeFallQuantity = hugeFallData.length;
    createPayBackDto.sealingRate =
        dailyLimitData.length === 0
            ? 100
            : Math.round((dailyLimitData.length / (dailyLimitData.length + dailyLimitOpenData.length)) * 100);
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
    for (let i = 0; i < shortTermDataLen; i++) {
        const currentDate = dayjs(shortTermData[i].createTime).format(pay_back_core_1.iWencaiDateFormat);
        const currentSpecialStock = findBiddingDataByCreateTime(specialStocks, currentDate);
        if (i < shortTermDataLen - 1 && (currentSpecialStock === null || currentSpecialStock === void 0 ? void 0 : currentSpecialStock.biddingData)) {
            const evenBoardData = prepareEvenBoardData(JSON.parse(shortTermData[i + 1].evenBoardData), JSON.parse(currentSpecialStock.biddingData));
            shortTermData[i + 1].evenBoardData = JSON.stringify(evenBoardData);
        }
        if (currentSpecialStock) {
            shortTermData[i].newStock = currentSpecialStock.newStock;
            shortTermData[i].chooseStock = currentSpecialStock.chooseStock;
            shortTermData[i].biddingDataUpdateTime = currentSpecialStock.updatedTime;
        }
    }
    return shortTermData;
}
exports.mergeExtra2ShortTermData = mergeExtra2ShortTermData;
function findBiddingDataByCreateTime(biddingDatas, createDate) {
    return biddingDatas.find(item => {
        return dayjs(item.tradeDate || item.createTime).format(pay_back_core_1.iWencaiDateFormat) === createDate;
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