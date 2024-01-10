import commonUtil from './commonUtil';
import { fetchIwencaiApi, fetchNorhFunds } from '../core/fetchUtil';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { params } from '../core/config';
import fetch from 'node-fetch';

export default {
  /**
   * 获取 资金数据
   */
  async getFundsData(dateStr) {
    // 北向资金、南向资金 获取
    const responseForeignFunds = await fetchNorhFunds();
    // const responseForeignFunds = await (await fetch("https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112309386087809528996_1689650979956&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=1689650979958")).text();
    // 成交量
    const responseMarketTurnover = await (
      await fetch(
        'https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=1688383194362',
      )
    ).text();

    const hangyeFundsInflow = await fetchIwencaiApi(params.hangyeFundsInflow);
    const hangyeFundsOutflow = await fetchIwencaiApi(params.hangyeFundsOutflow);
    const gaiNianFundsInflow = await fetchIwencaiApi(params.gainianFundsInflow);
    const gaiNianFundsOutflow = await fetchIwencaiApi(params.gainianFundsOutflow);

    const foreignFunds: any = this.transformForeignFunds(responseForeignFunds);
    const marketTurnover: any = this.getMarketTurnover(responseMarketTurnover);
    // 获取行业板块流入 Top3
    const hangyeFundsInflowTop3 = this.getPlateTop(hangyeFundsInflow, dateStr);
    const hangyeFundsOutflowTop3 = this.getPlateTop(hangyeFundsOutflow, dateStr);
    const gainianFundsInflowTop3 = this.getPlateTop(gaiNianFundsInflow, dateStr);
    const gainianFundsOutflowTop3 = this.getPlateTop(gaiNianFundsOutflow, dateStr);

    const createFundsDataDto = new CreateFundsDataDto();
    // 万亿
    createFundsDataDto.northFundsAmtIn = commonUtil.toFixed(foreignFunds.northFundsAmtIn / 10000);
    createFundsDataDto.northFundsBuyAmt = commonUtil.toFixed(foreignFunds.northFundsBuyAmt / 10000);
    createFundsDataDto.southFundsAmtIn = commonUtil.toFixed(foreignFunds.southFundsAmtIn / 10000);
    createFundsDataDto.southFundsBuyAmt = commonUtil.toFixed(foreignFunds.southFundsBuyAmt / 10000);
    createFundsDataDto.marketTurnover = commonUtil.toFixed(marketTurnover / 10000 / 10000 / 10000);
    createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
    createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
    createFundsDataDto.createTime = new Date();

    return createFundsDataDto;
  },
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
    }

    return {
      northFundsAmtIn,
      southFundsAmtIn,
      northFundsBuyAmt,
      southFundsBuyAmt,
    };
  },
  /**
   * 获取 市场总成交额
   * @param response
   */
  getMarketTurnover(responseMarketTurnoverStr) {
    const marketTurnoverStr = responseMarketTurnoverStr.substring(
      responseMarketTurnoverStr.indexOf('(') + 1,
      responseMarketTurnoverStr.length - 2,
    );
    const responseMarketTurnoverJson = JSON.parse(marketTurnoverStr).data.diff;
    return responseMarketTurnoverJson[0].f6 + responseMarketTurnoverJson[1].f6;
  },
  getPlateTop(platesData, dateStr, len = 3) {
    // const platesData = commonUtil.getIwencaiData(responseJson);
    return platesData.splice(0, len).map(item => {
      return {
        name: item['指数简称'],
        code: item['指数代码'],
        funds: commonUtil.fundsToFixed(item[`指数@主力资金流向[${dateStr}]`]),
        quoteChange: commonUtil.toFixed(item[`指数@涨跌幅:前复权[${dateStr}]`] || '0.0'),
      };
    });
  },
};
