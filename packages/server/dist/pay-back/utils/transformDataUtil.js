"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformShortTermSourceData = exports.transformStrongStockData = exports.transformNewStockData = exports.transformBidData = exports.transformPlateData = exports.transformStockData = exports.ExpectEnum = void 0;
const daily_limit_stock_dto_1 = require("../dto/daily-limit-stock.dto");
const down_limit_stock_dto_1 = require("../dto/down-limit-stock.dto");
const strong_stock_dto_1 = require("../dto/strong-stock.dto");
const daily_limit_yesterday_bidding_dto_1 = require("../dto/daily-limit-yesterday-bidding.dto");
const new_stock_dto_1 = require("../dto/new-stock.dto");
const commonUtil_1 = require("./commonUtil");
const dayjs = require("dayjs");
const pay_back_core_1 = require("pay-back-core");
const turnoverTypeArr = ['放量涨停', '缩量涨停', '一字涨停', 'T字涨停'];
var ExpectEnum;
(function (ExpectEnum) {
    ExpectEnum[ExpectEnum["conformTo"] = 1] = "conformTo";
    ExpectEnum[ExpectEnum["exceed"] = 2] = "exceed";
    ExpectEnum[ExpectEnum["incompatible"] = 0] = "incompatible";
})(ExpectEnum = exports.ExpectEnum || (exports.ExpectEnum = {}));
function transformStockData(stockList) {
    return stockList.map(item => {
        var _a, _b;
        return {
            code: item.code,
            name: item.name,
            rise_and_fall: (0, commonUtil_1.toFixed)(item.rise_and_fall),
            tag: (_a = item.tag) === null || _a === void 0 ? void 0 : _a.concept_tag,
            hot_tag: (_b = item.tag) === null || _b === void 0 ? void 0 : _b.popularity_tag,
        };
    });
}
exports.transformStockData = transformStockData;
function transformPlateData(plateList) {
    return plateList.map(item => {
        return {
            code: item.code,
            name: item.name,
            rise_and_fall: (0, commonUtil_1.toFixed)(item.rise_and_fall),
            hot_tag: item.hot_tag,
            tag: item.tag,
        };
    });
}
exports.transformPlateData = transformPlateData;
function transformHugeFallData(hugeFallData) {
    const hugeFallDataArr = [];
    hugeFallData.forEach(item => {
        const downLimitStockDto = new down_limit_stock_dto_1.DownLimitStockDto();
        loadStockBaseData(downLimitStockDto, item);
        hugeFallDataArr.push(downLimitStockDto);
    });
    return {
        hugeFallDataArr,
    };
}
;
function transformDownLimitData(dailyLimitData, currentDate) {
    const downLimitDataArr = [];
    let downLimitQuantity = 0;
    dailyLimitData.forEach(item => {
        const downLimitStockDto = new down_limit_stock_dto_1.DownLimitStockDto();
        loadStockBaseData(downLimitStockDto, item);
        if (item[`跌停原因类型[${currentDate}]`] && item[`跌停原因类型[${currentDate}]`] !== '资金出逃') {
            downLimitStockDto.reason = item[`跌停原因类型[${currentDate}]`];
        }
        else {
            downLimitQuantity++;
        }
        downLimitStockDto.closingFunds = (0, commonUtil_1.fundsToFixed)(item[`跌停封单额[${currentDate}]`]);
        downLimitDataArr.push(downLimitStockDto);
    });
    return {
        downLimitDataArr,
        downLimitQuantity,
    };
}
;
function transformDailyLimitData(dailyLimitData, currentDate) {
    let board1 = 0, maxHeight = 1, currentLevel = 0, dailyLimitReturnSealQuantity = 0;
    let evenBoardData = { maxHeight: 1, gaobiao: [], yizi: 0 };
    const evenBoardLabel = `连续涨停天数[${currentDate}]`;
    dailyLimitData.forEach(item => {
        const dailyLimitStockDto = new daily_limit_stock_dto_1.DailyLimitStockDto();
        currentLevel = item[evenBoardLabel];
        if (currentLevel > maxHeight) {
            maxHeight = currentLevel;
        }
        if (currentLevel === 1) {
            board1++;
        }
        loadStockBaseData(dailyLimitStockDto, item, currentDate);
        dailyLimitStockDto.closingFunds = (0, commonUtil_1.fundsToFixed)(item[`涨停封单额[${currentDate}]`]);
        dailyLimitStockDto.reason = item[`涨停原因类别[${currentDate}]`];
        dailyLimitStockDto.turnoverRate = (0, commonUtil_1.toFixed)(item[`换手率[${currentDate}]`], 1);
        if (item[`涨停类型[${currentDate}]`] !== turnoverTypeArr[0]) {
            dailyLimitStockDto.turnoverType = item[`涨停类型[${currentDate}]`];
            dailyLimitStockDto.turnoverType && dailyLimitStockDto.turnoverType.indexOf(turnoverTypeArr[2]) > -1 && (evenBoardData.yizi++);
        }
        if (item[`涨停开板次数[${currentDate}]`] != 0) {
            dailyLimitStockDto.openTimes = item[`涨停开板次数[${currentDate}]`];
            dailyLimitReturnSealQuantity++;
        }
        dailyLimitStockDto.dailyTime = item[`首次涨停时间[${currentDate}]`] ? item[`首次涨停时间[${currentDate}]`].trim() : '-';
        if (dailyLimitStockDto.openTimes > 0 && item[`最终涨停时间[${currentDate}]`]) {
            dailyLimitStockDto.dailyTime += (',' + item[`最终涨停时间[${currentDate}]`].trim());
        }
        const jitianjiban = item[`几天几板[${currentDate}]`];
        if (jitianjiban && jitianjiban.indexOf('天') > -1) {
            const day = jitianjiban.split('天')[0];
            const even = jitianjiban.split('天')[1].replace('板', '');
            if (day !== even) {
                dailyLimitStockDto.evenDays = jitianjiban;
                evenBoardData.gaobiao.push(dailyLimitStockDto);
            }
        }
        !evenBoardData[currentLevel] && (evenBoardData[currentLevel] = []);
        evenBoardData[currentLevel].push(dailyLimitStockDto);
    });
    evenBoardData.maxHeight = maxHeight;
    evenBoardData.gaobiao.length === 0 && delete evenBoardData.gaobiao;
    return {
        board1,
        evenBoardData,
        dailyLimitReturnSealQuantity,
    };
}
function transformBidData(stocks, todayDateStr, yesterdayDate) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const dailyLimitYesterdayBiddingDtos = [];
    stocks.forEach(item => {
        const dailyLimitYesterdayBiddingDto = new daily_limit_yesterday_bidding_dto_1.DailyLimitYesterdayBiddingDto();
        loadStockBaseData(dailyLimitYesterdayBiddingDto, item, currentDate);
        loadBiddingBaseData(dailyLimitYesterdayBiddingDto, item, currentDate);
        dailyLimitYesterdayBiddingDto.closeIncrease = (0, commonUtil_1.toFixed)(item['最新涨跌幅']);
        const jitianjiban = item[`几天几板[${yesterdayDate}]`];
        if (jitianjiban && jitianjiban.indexOf('天') > -1) {
            const day = jitianjiban.split('天')[0];
            const even = jitianjiban.split('天')[1].replace('板', '');
            if (day !== even) {
                dailyLimitYesterdayBiddingDto.evenDays = jitianjiban;
            }
            else {
                dailyLimitYesterdayBiddingDto.evenDays = day;
            }
        }
        if (!item[`最终涨停时间[${yesterdayDate}]`]) {
            yesterdayDate = (0, commonUtil_1.getLastTradingDay)(currentDate);
        }
        dailyLimitYesterdayBiddingDto.bidVolumeRatio = +(item[`竞价量[${currentDate}]`] / item[`竞价量[${yesterdayDate}]`]).toFixed(2);
        if (item[`涨停开板次数[${yesterdayDate}]`] != 0) {
            dailyLimitYesterdayBiddingDto.openTimes = item[`涨停开板次数[${yesterdayDate}]`];
        }
        dailyLimitYesterdayBiddingDto.dailyTime = item[`首次涨停时间[${yesterdayDate}]`] ? item[`首次涨停时间[${yesterdayDate}]`].trim() : '-';
        if (dailyLimitYesterdayBiddingDto.openTimes > 0 && item[`最终涨停时间[${yesterdayDate}]`]) {
            dailyLimitYesterdayBiddingDto.dailyTime += (',' + item[`最终涨停时间[${yesterdayDate}]`].trim());
        }
        dailyLimitYesterdayBiddingDto.expected = judgeExpected(dailyLimitYesterdayBiddingDto);
        delete dailyLimitYesterdayBiddingDto.dailyTime;
        delete dailyLimitYesterdayBiddingDto.openTimes;
        dailyLimitYesterdayBiddingDtos.push(dailyLimitYesterdayBiddingDto);
    });
    return dailyLimitYesterdayBiddingDtos;
}
exports.transformBidData = transformBidData;
function transformNewStockData(stocks, todayDateStr) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const newStockDtos = [];
    stocks.forEach(item => {
        const newStock = new new_stock_dto_1.NewStockDto();
        loadStockBaseData(newStock, item, currentDate);
        loadBiddingBaseData(newStock, item, currentDate);
        newStock.closeIncrease = (0, commonUtil_1.toFixed)(item['最新涨跌幅']);
        newStockDtos.push(newStock);
    });
    return newStockDtos;
}
exports.transformNewStockData = transformNewStockData;
function transformStrongStockData(stocks, todayDateStr, yesterdayDate) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const strongStockDtos = [];
    stocks.forEach(item => {
        const strongStockDto = new strong_stock_dto_1.StrongStockDto();
        loadStockBaseData(strongStockDto, item, currentDate);
        loadBiddingBaseData(strongStockDto, item, currentDate);
        if (!strongStockDto.price) {
            strongStockDto.price = item[`平均成本[${currentDate}]`] || item[`平均成本[${yesterdayDate}]`];
        }
        strongStockDto.turnoverRate = (0, commonUtil_1.toFixed)(item[`换手率[${yesterdayDate}]`], 1);
        strongStockDto.cmjzd = (0, commonUtil_1.toFixed)(item[`集中度70[${currentDate}]`] || item[`集中度70[${yesterdayDate}]`], 1);
        strongStockDto.sphl = (0, commonUtil_1.toFixed)(item[`收盘获利[${yesterdayDate}]`], 1);
        strongStockDto.closeIncrease = (0, commonUtil_1.toFixed)(item['最新涨跌幅']);
        strongStockDtos.push(strongStockDto);
    });
    return strongStockDtos;
}
exports.transformStrongStockData = transformStrongStockData;
function transformShortTermSourceData(dailyLimitData, downLimitData, hugeFallData, todayDateStr) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const { downLimitDataArr, downLimitQuantity } = transformDownLimitData(downLimitData, currentDate);
    const { hugeFallDataArr } = transformHugeFallData(hugeFallData);
    const { board1, evenBoardData, dailyLimitReturnSealQuantity } = transformDailyLimitData(dailyLimitData, currentDate);
    return {
        board1,
        evenBoardData,
        downLimitDataArr,
        hugeFallDataArr,
        downLimitQuantity,
        dailyLimitReturnSealQuantity,
    };
}
exports.transformShortTermSourceData = transformShortTermSourceData;
function loadBiddingBaseData(stock, item, currentDate) {
    stock.bidChangeTypeT = item[`竞价异动类型[${currentDate}]`];
    stock.bidIncreaseT = item[`竞价涨幅[${currentDate}]`];
    stock.bidRating = item[`集合竞价评级[${currentDate}]`];
    return stock;
}
function loadStockBaseData(stock, item, currentDate = null) {
    stock.name = item['股票简称'];
    stock.code = item.code;
    stock.plateLevel2 = getPlateLevel2(item);
    if (currentDate) {
        stock.price = item['最新价'];
        stock.circulationValue = (0, commonUtil_1.fundsToFixed)(item[`a股市值(不含限售股)[${currentDate}]`]);
    }
    return stock;
}
function getPlateLevel2(item) {
    if (item['所属同花顺二级行业']) {
        return item['所属同花顺二级行业'];
    }
    return item['所属同花顺行业'] ? item['所属同花顺行业'].split('-')[1] : '未知';
}
function judgeExpected(item) {
    const { bidIncreaseT } = item;
    const expected = (0, pay_back_core_1.getExpected)(item);
    if (expected.indexOf(',') === -1) {
        const expectedD = parseInt(expected);
        if (bidIncreaseT > expectedD) {
            if (bidIncreaseT - expectedD >= 1) {
                return ExpectEnum.exceed;
            }
            return ExpectEnum.conformTo;
        }
        return ExpectEnum.incompatible;
    }
    else {
        const expecteds = expected.split(',');
        const start = parseInt(expecteds[0]);
        const end = parseInt(expecteds[1]);
        if (bidIncreaseT >= start && bidIncreaseT <= end) {
            return ExpectEnum.conformTo;
        }
        if (bidIncreaseT > end) {
            return ExpectEnum.exceed;
        }
        return ExpectEnum.incompatible;
    }
}
//# sourceMappingURL=transformDataUtil.js.map