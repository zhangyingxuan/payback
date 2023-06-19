import commonUtil from './commonUtil';

export default {
  /**
   * 获取 北向 南向资金数据
   * @param response 
   * @returns 
   */
  transformForeignFunds(dataStr) {
    // 单位 万元
    // 净流入
    let northFundsAmtIn = 0;
    let southFundsAmtIn = 0;
    // 净买入
    let northFundsBuyAmt = 0;
    let southFundsBuyAmt = 0;
    try {
      dataStr = dataStr.substring(dataStr.indexOf('(') + 1, dataStr.length - 2);
      const dataJson = JSON.parse(dataStr);
      const data = dataJson.result.data;
      // FUNDS_DIRECTION 北向、南向
      data.forEach(item => {
        if (item.FUNDS_DIRECTION === '北向') {
          northFundsAmtIn += item.dayNetAmtIn;
          northFundsBuyAmt += item.netBuyAmt;
        } else {
          southFundsAmtIn += item.dayNetAmtIn;
          southFundsBuyAmt += item.netBuyAmt;
        }
      });
    } catch (e) {
      console.log('[error]transformForeignFunds数据转换错误！');
      // console.log('[error]transformForeignFunds数据转换错误！', e);
    }

    return {
      northFundsAmtIn,
      southFundsAmtIn,
      northFundsBuyAmt,
      southFundsBuyAmt
    }
  },
  /**
   * 获取 市场总成交额 
   * @param response 
   */
  getMarketTurnover(responseMarketTurnoverStr) {
    const marketTurnoverStr = responseMarketTurnoverStr.substring(responseMarketTurnoverStr.indexOf('(') + 1, responseMarketTurnoverStr.length - 2);
    const responseMarketTurnoverJson = JSON.parse(marketTurnoverStr).data.diff;
    return responseMarketTurnoverJson[0].f6 + responseMarketTurnoverJson[1].f6;
  },
  getPlateTop(responseJson, dateStr, len = 3) {
    const platesData = commonUtil.getIwencaiData(responseJson);
    return platesData.splice(0, len).map((item) => {
      return {
        name: item['指数简称'],
        code: item['指数代码'],
        funds: commonUtil.fundsToFixed(item[`指数@主力资金流向[${dateStr}]`]),
        quoteChange: commonUtil.toFixed(item[`指数@涨跌幅:前复权[${dateStr}]`] || '0.0'),
      }
    });
  }

}