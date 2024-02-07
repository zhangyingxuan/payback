"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commonUtil_1 = require("./commonUtil");
const fetchUtil_1 = require("../core/fetchUtil");
const create_funds_data_dto_1 = require("../dto/create-funds-data.dto");
const config_1 = require("../core/config");
const node_fetch_1 = require("node-fetch");
const commonUtil_2 = require("./commonUtil");
exports.default = {
    async getFundsData(dateStr) {
        const responseForeignFunds = await (0, fetchUtil_1.fetchNorhFunds)();
        const responseMarketTurnover = await (await (0, node_fetch_1.default)('https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=1688383194362')).text();
        const hangyeFundsInflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeFundsInflow);
        const hangyeFundsOutflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyeFundsOutflow);
        const gaiNianFundsInflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianFundsInflow + commonUtil_2.ignoreGainianPlateStr);
        const gaiNianFundsOutflow = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianFundsOutflow + commonUtil_2.ignoreGainianPlateStr);
        const foreignFunds = this.transformForeignFunds(responseForeignFunds);
        const marketTurnover = this.getMarketTurnover(responseMarketTurnover);
        const hangyeFundsInflowTop3 = this.getPlateTop(hangyeFundsInflow, dateStr, 3);
        const hangyeFundsOutflowTop3 = this.getPlateTop(hangyeFundsOutflow, dateStr, 3);
        const gainianFundsInflowTop3 = this.getPlateTop(gaiNianFundsInflow, dateStr, 3);
        const gainianFundsOutflowTop3 = this.getPlateTop(gaiNianFundsOutflow, dateStr, 3);
        const createFundsDataDto = new create_funds_data_dto_1.CreateFundsDataDto();
        createFundsDataDto.northFundsAmtIn = commonUtil_1.default.toFixed(foreignFunds.northFundsAmtIn / 10000);
        createFundsDataDto.northFundsBuyAmt = commonUtil_1.default.toFixed(foreignFunds.northFundsBuyAmt / 10000);
        createFundsDataDto.southFundsAmtIn = commonUtil_1.default.toFixed(foreignFunds.southFundsAmtIn / 10000);
        createFundsDataDto.southFundsBuyAmt = commonUtil_1.default.toFixed(foreignFunds.southFundsBuyAmt / 10000);
        createFundsDataDto.marketTurnover = commonUtil_1.default.toFixed(marketTurnover / 10000 / 10000 / 10000);
        createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
        createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
        createFundsDataDto.createTime = new Date();
        return createFundsDataDto;
    },
    transformForeignFunds(dataStr) {
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
            southFundsBuyAmt,
        };
    },
    getMarketTurnover(responseMarketTurnoverStr) {
        const marketTurnoverStr = responseMarketTurnoverStr.substring(responseMarketTurnoverStr.indexOf('(') + 1, responseMarketTurnoverStr.length - 2);
        const responseMarketTurnoverJson = JSON.parse(marketTurnoverStr).data.diff;
        return responseMarketTurnoverJson[0].f6 + responseMarketTurnoverJson[1].f6;
    },
    getPlateTop(platesData, dateStr, len = 5) {
        return platesData.splice(0, len).map(item => {
            return {
                name: item['指数简称'],
                code: item['code'],
                funds: commonUtil_1.default.fundsToFixed(item[`指数@主力资金流向[${dateStr}]`]),
                quoteChange: commonUtil_1.default.toFixed(item[`指数@涨跌幅:前复权[${dateStr}]`] || '0.0'),
            };
        });
    },
};
//# sourceMappingURL=fundsUtil.js.map