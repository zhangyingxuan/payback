"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_market_data_dto_1 = require("../dto/create-market-data.dto");
const fundsUtil_1 = require("./fundsUtil");
const fetchUtil_1 = require("../core/fetchUtil");
const config_1 = require("../core/config");
const commonUtil_1 = require("./commonUtil");
exports.default = {
    async getMarketData(dateStr) {
        const createMarketDataDto = new create_market_data_dto_1.CreateMarketDataDto();
        const index = (0, fetchUtil_1.fetchMarketPointFromEastmoney)();
        const market = (0, fetchUtil_1.fetchMarketData)();
        const gainianRiseFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianRiseFloat + commonUtil_1.ignoreGainianPlateStr);
        const gainianFallFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianFallFloat + commonUtil_1.ignoreGainianPlateStr);
        const hangyeRiseFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeRiseFloat);
        const hangyeFallFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeFallFloat);
        const [indexData, marketData, gainianRiseFloatData, gainianFallFloatData, hangyeRiseFloatData, hangyeFallFloatData,] = await Promise.all([index, market, gainianRiseFloat, gainianFallFloat, hangyeRiseFloat, hangyeFallFloat]);
        createMarketDataDto.shangzhengPoint = indexData[0]['f2'];
        createMarketDataDto.shenzhengPoint = indexData[1]['f2'];
        createMarketDataDto.beizheng50Point = indexData[2]['f2'];
        createMarketDataDto.chuangyePoint = indexData[3]['f2'];
        createMarketDataDto.dailyLimitIncome = marketData.jrbx_data.last_zdf;
        createMarketDataDto.fallAmount = marketData.zdfb_data.dnum;
        createMarketDataDto.riseAmount = marketData.zdfb_data.znum;
        createMarketDataDto.marketScore = marketData.dppj_data;
        const gainianRiseFloatTop5 = fundsUtil_1.default.getPlateTop(gainianRiseFloatData, dateStr);
        const gainianFallFloatTop5 = fundsUtil_1.default.getPlateTop(gainianFallFloatData, dateStr);
        const hangyeRiseFloatTop5 = fundsUtil_1.default.getPlateTop(hangyeRiseFloatData, dateStr);
        const hangyeFallFloatTop5 = fundsUtil_1.default.getPlateTop(hangyeFallFloatData, dateStr);
        createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop5);
        createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop5);
        createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop5);
        createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop5);
        createMarketDataDto.createTime = new Date();
        return createMarketDataDto;
    },
};
//# sourceMappingURL=marketUtil.js.map