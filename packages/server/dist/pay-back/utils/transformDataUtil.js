"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformShortTermSourceData = exports.transformPlateData = exports.transformStockData = void 0;
const daily_limit_stock_dto_1 = require("../dto/daily-limit-stock.dto");
const down_limit_stock_dto_1 = require("../dto/down-limit-stock.dto");
const commonUtil_1 = require("./commonUtil");
const dayjs = require("dayjs");
function transformStockData(stockList) {
    return JSON.stringify(stockList.map(item => {
        var _a, _b;
        return {
            code: item.code,
            name: item.name,
            rise_and_fall: (0, commonUtil_1.toFixed)(item.rise_and_fall),
            tag: (_a = item.tag) === null || _a === void 0 ? void 0 : _a.concept_tag,
            hot_tag: (_b = item.tag) === null || _b === void 0 ? void 0 : _b.popularity_tag,
        };
    }));
}
exports.transformStockData = transformStockData;
function transformPlateData(plateList) {
    return JSON.stringify(plateList.map(item => {
        return {
            code: item.code,
            name: item.name,
            rise_and_fall: (0, commonUtil_1.toFixed)(item.rise_and_fall),
            hot_tag: item.hot_tag,
            tag: item.tag,
        };
    }));
}
exports.transformPlateData = transformPlateData;
function transDownLimitData(dailyLimitData, todayDateStr) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const downLimitData = [];
    dailyLimitData.forEach(item => {
        const dailyLimitStockDto = new down_limit_stock_dto_1.DownLimitStockDto();
        dailyLimitStockDto.name = item['股票简称'];
        dailyLimitStockDto.code = item.code;
        dailyLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
        dailyLimitStockDto.closingFunds = (0, commonUtil_1.fundsToFixed)(item[`跌停封单额[${currentDate}]`]);
        downLimitData.push(dailyLimitStockDto);
    });
    return downLimitData;
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
function transformShortTermSourceData(dailyLimitData, downLimitData, todayDateStr) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const evenBoardLabel = `连续涨停天数[${currentDate}]`;
    let board1 = 0, maxHeight = 1, currentLevel = 0, dailyLimitReturnSealQuantity = 0;
    const downLimitDataArr = transDownLimitData(downLimitData, todayDateStr);
    let evenBoardData = { maxHeight: 1, gaobiao: [] };
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
        dailyLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
        dailyLimitStockDto.closingFunds = (0, commonUtil_1.fundsToFixed)(item[`涨停封单额[${currentDate}]`]);
        dailyLimitStockDto.type = judgeType(item['最新涨跌幅']);
        dailyLimitStockDto.price = item['最新价'];
        if (item[`涨停开板次数[${currentDate}]`] !== 0) {
            dailyLimitStockDto.openTimes = item[`涨停开板次数[${currentDate}]`];
            dailyLimitReturnSealQuantity++;
        }
        dailyLimitStockDto.circulationValue = (0, commonUtil_1.fundsToFixed)(item[`a股市值(不含限售股)[${currentDate}]`]);
        dailyLimitStockDto.dailyTime = item[`首次涨停时间[${currentDate}]`] ? item[`首次涨停时间[${currentDate}]`].trim() : '-';
        if (dailyLimitStockDto.openTimes > 0) {
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
        downLimitDataArr,
        dailyLimitReturnSealQuantity,
    };
}
exports.transformShortTermSourceData = transformShortTermSourceData;
//# sourceMappingURL=transformDataUtil.js.map