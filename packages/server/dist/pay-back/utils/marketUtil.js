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
        const gainianRiseFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianRiseFloat + commonUtil_1.ignoreGainianPlateStr);
        const gainianFallFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianFallFloat + commonUtil_1.ignoreGainianPlateStr);
        const hangyeRiseFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeRiseFloat);
        const hangyeFallFloat = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeFallFloat);
        const gainianRiseFloatTop5 = fundsUtil_1.default.getPlateTop(gainianRiseFloat, dateStr);
        const gainianFallFloatTop5 = fundsUtil_1.default.getPlateTop(gainianFallFloat, dateStr);
        const hangyeRiseFloatTop5 = fundsUtil_1.default.getPlateTop(hangyeRiseFloat, dateStr);
        const hangyeFallFloatTop5 = fundsUtil_1.default.getPlateTop(hangyeFallFloat, dateStr);
        createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop5);
        createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop5);
        createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop5);
        createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop5);
        createMarketDataDto.createTime = new Date();
        return createMarketDataDto;
    },
};
//# sourceMappingURL=marketUtil.js.map