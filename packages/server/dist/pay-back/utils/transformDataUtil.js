"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpected = exports.transformShortTermSourceData = exports.transformBidData = exports.transformPlateData = exports.transformStockData = void 0;
const daily_limit_stock_dto_1 = require("../dto/daily-limit-stock.dto");
const down_limit_stock_dto_1 = require("../dto/down-limit-stock.dto");
const daily_limit_yesterday_bidding_dto_1 = require("../dto/daily-limit-yesterday-bidding.dto");
const commonUtil_1 = require("./commonUtil");
const dayjs = require("dayjs");
const turnoverTypeArr = ['放量涨停', '缩量涨停', '一字涨停', 'T字涨停'];
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
        downLimitStockDto.name = item['股票简称'];
        downLimitStockDto.code = item.code;
        downLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
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
        downLimitStockDto.name = item['股票简称'];
        downLimitStockDto.code = item.code;
        downLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
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
function judgeType(str) {
    if (!str)
        return 2;
    const num = +str;
    if (num < 11) {
        return 0;
    }
    else if (num >= 11 && num < 21) {
        return 1;
    }
    else {
        return 2;
    }
}
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
        dailyLimitStockDto.name = item['股票简称'];
        dailyLimitStockDto.code = item.code;
        dailyLimitStockDto.reason = item[`涨停原因类别[${currentDate}]`];
        dailyLimitStockDto.turnoverRate = (0, commonUtil_1.toFixed)(item[`换手率[${currentDate}]`], 1);
        dailyLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
        dailyLimitStockDto.closingFunds = (0, commonUtil_1.fundsToFixed)(item[`涨停封单额[${currentDate}]`]);
        if (item[`涨停类型[${currentDate}]`] !== turnoverTypeArr[0]) {
            dailyLimitStockDto.turnoverType = item[`涨停类型[${currentDate}]`];
            dailyLimitStockDto.turnoverType && dailyLimitStockDto.turnoverType.indexOf(turnoverTypeArr[2]) > -1 && (evenBoardData.yizi++);
        }
        dailyLimitStockDto.type = judgeType(item['最新涨跌幅']);
        dailyLimitStockDto.price = item['最新价'];
        if (item[`涨停开板次数[${currentDate}]`] != 0) {
            dailyLimitStockDto.openTimes = item[`涨停开板次数[${currentDate}]`];
            dailyLimitReturnSealQuantity++;
        }
        dailyLimitStockDto.circulationValue = (0, commonUtil_1.fundsToFixed)(item[`a股市值(不含限售股)[${currentDate}]`]);
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
function transformBidData(dailyLimitData, todayDateStr) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const yesterdayDate = dayjs(todayDateStr).subtract(1, 'day').format('YYYYMMDD');
    const dailyLimitYesterdayBiddingDtos = [];
    dailyLimitData.forEach(item => {
        const dailyLimitYesterdayBiddingDto = new daily_limit_yesterday_bidding_dto_1.DailyLimitYesterdayBiddingDto();
        dailyLimitYesterdayBiddingDto.name = item['股票简称'];
        dailyLimitYesterdayBiddingDto.code = item.code;
        dailyLimitYesterdayBiddingDto.plateLevel2 = item['所属同花顺二级行业'];
        dailyLimitYesterdayBiddingDto.bidChangeTypeT = item[`竞价异动类型[${currentDate}]`];
        dailyLimitYesterdayBiddingDto.bidIncreaseT = item[`竞价涨幅[${currentDate}]`];
        dailyLimitYesterdayBiddingDto.bidVolumeT = item[`竞价量[${currentDate}]`];
        dailyLimitYesterdayBiddingDto.bidVolumeY = item[`竞价量[${yesterdayDate}]`];
        dailyLimitYesterdayBiddingDto.bidRating = item[`集合竞价评级[${currentDate}]`];
        dailyLimitYesterdayBiddingDto.closeIncrease = (0, commonUtil_1.toFixed)(item['最新涨跌幅']);
        if (item[`涨停开板次数[${yesterdayDate}]`] != 0) {
            dailyLimitYesterdayBiddingDto.openTimes = item[`涨停开板次数[${yesterdayDate}]`];
        }
        dailyLimitYesterdayBiddingDto.dailyTime = item[`首次涨停时间[${yesterdayDate}]`] ? item[`首次涨停时间[${yesterdayDate}]`].trim() : '-';
        if (dailyLimitYesterdayBiddingDto.openTimes > 0 && item[`最终涨停时间[${yesterdayDate}]`]) {
            dailyLimitYesterdayBiddingDto.dailyTime += (',' + item[`最终涨停时间[${yesterdayDate}]`].trim());
        }
        dailyLimitYesterdayBiddingDto.expected = judgeExpected(dailyLimitYesterdayBiddingDto, dailyLimitYesterdayBiddingDto.bidIncreaseT);
        delete dailyLimitYesterdayBiddingDto.dailyTime;
        delete dailyLimitYesterdayBiddingDto.openTimes;
        dailyLimitYesterdayBiddingDtos.push(dailyLimitYesterdayBiddingDto);
    });
    return dailyLimitYesterdayBiddingDtos;
}
exports.transformBidData = transformBidData;
function judgeExpected(item, bidIncreaseT) {
    const expected = getExpected(item);
    if (expected.indexOf(',') === -1) {
        return getExpectedValue(bidIncreaseT, parseInt(expected));
    }
    const expecteds = expected.split(',');
    const start = parseInt(expecteds[0]);
    const end = parseInt(expecteds[1]);
    if (bidIncreaseT >= start && bidIncreaseT <= end) {
        return 1;
    }
    if (bidIncreaseT > end) {
        return 2;
    }
    return 0;
}
function getExpectedValue(bidIncreaseT, expected) {
    if (bidIncreaseT > expected) {
        if (bidIncreaseT - expected >= 1) {
            return 2;
        }
        return 1;
    }
    return 0;
}
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
const currentDate = '2018-08-08';
const date931 = dayjs(currentDate + ' 09:31:00');
const date1000 = dayjs(currentDate + ' 10:00:00');
const date1300 = dayjs(currentDate + ' 13:00:00');
const date1400 = dayjs(currentDate + ' 14:00:00');
const expectedArr = ['5', '4', '3', '0,2', '-2,2', '-2'];
function getExpected(stock) {
    let currentTime = stock.openTimes ? stock.dailyTime.split(',')[1] : stock.dailyTime;
    currentTime = dayjs(currentDate + ' ' + currentTime);
    if (stock.openTimes >= 5) {
        if (currentTime.isBefore(date1300)) {
            return expectedArr[2];
        }
        return expectedArr[5];
    }
    if (currentTime.isBefore(date931)) {
        return expectedArr[0];
    }
    if (currentTime.isBefore(date1000)) {
        return expectedArr[1];
    }
    if (currentTime.isBefore(date1300)) {
        return expectedArr[2];
    }
    if (currentTime.isBefore(date1400) && currentTime.isAfter(date1300)) {
        return expectedArr[3];
    }
    return expectedArr[4];
}
exports.getExpected = getExpected;
//# sourceMappingURL=transformDataUtil.js.map