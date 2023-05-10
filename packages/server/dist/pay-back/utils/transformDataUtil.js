"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const daily_limit_stock_dto_1 = require("../dto/daily-limit-stock.dto");
const dayjs = require("dayjs");
exports.default = {
    transformShortTermSourceData(dailyLimitData, todayDateStr) {
        const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
        const evenBoardLabel = `连续涨停天数[${currentDate}]`;
        let SZAmount = 0, SHAmount = 0, board1 = 0, maxHeight = 1, currentLevel = 0;
        let evenBoardData = { maxHeight: 1 };
        dailyLimitData.forEach(item => {
            const dailyLimitStockDto = new daily_limit_stock_dto_1.DailyLimitStockDto();
            currentLevel = item[evenBoardLabel];
            if (currentLevel > maxHeight) {
                maxHeight = currentLevel;
            }
            if (currentLevel === 1) {
                board1++;
            }
            if (item['股票代码'].includes('SZ')) {
                SZAmount++;
            }
            else {
                SHAmount++;
            }
            dailyLimitStockDto.name = item['股票简称'];
            dailyLimitStockDto.code = item.code;
            dailyLimitStockDto.reason = item[`涨停原因类别[${currentDate}]`];
            dailyLimitStockDto.closingFunds = item[`涨停封单额[${currentDate}]`];
            dailyLimitStockDto.turnover = item[`成交额[${currentDate}]`];
            !evenBoardData[currentLevel] && (evenBoardData[currentLevel] = []);
            evenBoardData[currentLevel].push(dailyLimitStockDto);
        });
        evenBoardData.maxHeight = maxHeight;
        return {
            SZAmount,
            SHAmount,
            board1,
            maxHeight,
            evenBoardData,
        };
    }
};
//# sourceMappingURL=transformDataUtil.js.map