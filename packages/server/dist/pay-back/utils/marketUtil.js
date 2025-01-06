"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_market_data_dto_1 = require("../dto/create-market-data.dto");
const fundsUtil_1 = require("./fundsUtil");
const fetchUtil_1 = require("../core/fetchUtil");
const config_1 = require("../core/config");
const commonUtil_1 = require("./commonUtil");
const abortFetch_1 = require("../../utils/abortFetch");
exports.default = {
    async getMarketData(dateStr) {
        const createMarketDataDto = new create_market_data_dto_1.CreateMarketDataDto();
        const index = (0, fetchUtil_1.fetchMarketPointFromEastmoney)();
        const dateTime = new Date().getTime();
        const market = (0, fetchUtil_1.fetchMarketData)();
        const gainianRiseFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianRiseFloat + commonUtil_1.ignoreGainianPlateStr);
        const gainianFallFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianFallFloat + commonUtil_1.ignoreGainianPlateStr);
        const hangyeRiseFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeRiseFloat);
        const hangyeFallFloat = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeFallFloat);
        const abortFetch = (0, abortFetch_1.createFetch)();
        const responseMarketTurnover = abortFetch(`https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=${dateTime}`);
        const [indexData, marketData, gainianRiseFloatData, gainianFallFloatData, hangyeRiseFloatData, hangyeFallFloatData, responseMarketTurnoverData,] = await Promise.all([
            index,
            market,
            gainianRiseFloat,
            gainianFallFloat,
            hangyeRiseFloat,
            hangyeFallFloat,
            responseMarketTurnover,
        ]);
        createMarketDataDto.shangzhengRiseAndFall = indexData[0]['f3'];
        createMarketDataDto.shangzhengPoint = indexData[0]['f2'];
        createMarketDataDto.shenzhengPoint = indexData[1]['f2'];
        createMarketDataDto.beizheng50Point = indexData[2]['f2'];
        createMarketDataDto.chuangyePoint = indexData[3]['f2'];
        createMarketDataDto.dailyLimitIncome = marketData.jrbx_data.last_zdf;
        createMarketDataDto.fallAmount = marketData.zdfb_data.dnum;
        createMarketDataDto.riseAmount = marketData.zdfb_data.znum;
        createMarketDataDto.marketScore = marketData.dppj_data;
        const marketTurnover = (0, commonUtil_1.getMarketTurnover)(await responseMarketTurnoverData.text());
        const gainianRiseFloatTop5 = fundsUtil_1.default.getPlateTop(gainianRiseFloatData, dateStr);
        const gainianFallFloatTop5 = fundsUtil_1.default.getPlateTop(gainianFallFloatData, dateStr);
        const hangyeRiseFloatTop5 = fundsUtil_1.default.getPlateTop(hangyeRiseFloatData, dateStr);
        const hangyeFallFloatTop5 = fundsUtil_1.default.getPlateTop(hangyeFallFloatData, dateStr);
        createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop5);
        createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop5);
        createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop5);
        createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop5);
        createMarketDataDto.marketTurnover = (0, commonUtil_1.toFixed)(marketTurnover / 10000 / 10000 / 10000);
        createMarketDataDto.createTime = new Date();
        return createMarketDataDto;
    },
};
//# sourceMappingURL=marketUtil.js.map