"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_market_data_dto_1 = require("../dto/create-market-data.dto");
const fundsUtil_1 = require("./fundsUtil");
const fetchUtil_1 = require("../core/fetchUtil");
const config_1 = require("../core/config");
exports.default = {
    async getMarketData(dateStr) {
        const createMarketDataDto = new create_market_data_dto_1.CreateMarketDataDto();
        const indexResult = await (0, fetchUtil_1.fetchMarketPointFromEastmoney)();
        createMarketDataDto.shangzhengPoint = indexResult[0]['f2'];
        createMarketDataDto.shenzhengPoint = indexResult[1]['f2'];
        createMarketDataDto.beizheng50Point = indexResult[2]['f2'];
        createMarketDataDto.chuangyePoint = indexResult[3]['f2'];
        const marketData = await (0, fetchUtil_1.fetchMarketData)();
        createMarketDataDto.dailyLimitIncome = marketData.jrbx_data.last_zdf;
        createMarketDataDto.fallAmount = marketData.zdfb_data.dnum;
        createMarketDataDto.riseAmount = marketData.zdfb_data.znum;
        createMarketDataDto.marketScore = marketData.dppj_data;
        const gainianRiseFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianRiseFloat);
        const gainianFallFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianFallFloat);
        const hangyeRiseFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeRiseFloat);
        const hangyeFallFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeFallFloat);
        const gainianRiseFloatTop3 = fundsUtil_1.default.getPlateTop(gainianRiseFloat, dateStr, 5);
        const gainianFallFloatTop3 = fundsUtil_1.default.getPlateTop(gainianFallFloat, dateStr, 5);
        const hangyeRiseFloatTop3 = fundsUtil_1.default.getPlateTop(hangyeRiseFloat, dateStr, 5);
        const hangyeFallFloatTop3 = fundsUtil_1.default.getPlateTop(hangyeFallFloat, dateStr, 5);
        createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop3);
        createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop3);
        createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop3);
        createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop3);
        createMarketDataDto.createTime = new Date();
        return createMarketDataDto;
    },
};
//# sourceMappingURL=marketUtil.js.map