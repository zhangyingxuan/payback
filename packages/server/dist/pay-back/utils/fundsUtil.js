"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commonUtil_1 = require("./commonUtil");
exports.default = {
    async transformForeignFunds(response) {
        let dataStr = await response.text();
        let northFundsAmtIn = 0;
        let southFundsAmtIn = 0;
        let northFundsBuyAmt = 0;
        let southFundsBuyAmt = 0;
        try {
            dataStr = dataStr.substring(dataStr.indexOf('(') + 1, dataStr.length - 2);
            const dataJson = JSON.parse(dataStr);
            const data = dataJson.result.data;
            data.forEach(item => {
                if (item.FUNDS_DIRECTION === '北向') {
                    northFundsAmtIn += item.dayNetAmtIn;
                    northFundsBuyAmt += item.netBuyAmt;
                }
                else {
                    southFundsAmtIn += item.dayNetAmtIn;
                    southFundsBuyAmt += item.netBuyAmt;
                }
            });
        }
        catch (e) {
            console.log('[error]transformForeignFunds数据转换错误！');
        }
        return {
            northFundsAmtIn,
            southFundsAmtIn,
            northFundsBuyAmt,
            southFundsBuyAmt
        };
    },
    async getMarketTurnover(response) {
        let responseMarketTurnoverStr = await response.text();
        const marketTurnoverStr = responseMarketTurnoverStr.substring(responseMarketTurnoverStr.indexOf('(') + 1, responseMarketTurnoverStr.length - 2);
        const responseMarketTurnoverJson = JSON.parse(marketTurnoverStr).data.diff;
        return responseMarketTurnoverJson[0].f6 + responseMarketTurnoverJson[1].f6;
    },
    async getPlateTop3(response, dateStr) {
        const responseJson = await response.json();
        const platesData = commonUtil_1.default.getIwencaiData(responseJson);
        return platesData.splice(0, 3).map((item) => {
            return {
                name: item['指数简称'],
                code: item['指数代码'],
                funds: +(item[`指数@主力资金流向[${dateStr}]`] / 10000 / 10000).toFixed(2),
                quoteChange: item[`指数@涨跌幅:前复权[${dateStr}]`] || '0.0',
            };
        });
    }
};
//# sourceMappingURL=fundsUtil.js.map