import commonUtil from './commonUtil';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { params } from '../core/config';
import fetch from 'node-fetch';
import { ignoreGainianPlateStr } from './commonUtil';
import { transformForeignFundsNew } from './transformDataUtil';

export default {
  /**
   * 获取 资金数据
   */
  async getFundsData(dateStr: string) {
    // 北向资金、南向资金 获取
    // const responseForeignFunds = await fetchNorhFunds();
    // 更新数据获取接口 2024-05-15 21:26:00
    const dateTime = new Date().getTime();
    const responseForeignFunds = fetch(
      `https://push2.eastmoney.com/api/qt/kamt/get?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f56,f60,f62,f63,f65,f66&ut=fa5fd1943c7b386f172d6893dbfba10b&cb=jQuery1123049543730033209155_${dateTime}&_=${dateTime}`,
    );
    // 成交量
    const responseMarketTurnover = fetch(
      `https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=${dateTime}`,
    );

    const hangyeFundsInflow = fetchIwencaiApi(params.hangyeFundsInflow);
    const hangyeFundsOutflow = fetchIwencaiApi(params.hangyeFundsOutflow);
    const gaiNianFundsInflow = fetchIwencaiApi(params.gainianFundsInflow + ignoreGainianPlateStr);
    const gaiNianFundsOutflow = fetchIwencaiApi(params.gainianFundsOutflow + ignoreGainianPlateStr);

    const [
      responseForeignFundsData,
      responseMarketTurnoverData,
      hangyeFundsInflowData,
      hangyeFundsOutflowData,
      gaiNianFundsInflowData,
      gaiNianFundsOutflowData,
    ] = await Promise.all([
      responseForeignFunds,
      responseMarketTurnover,
      hangyeFundsInflow,
      hangyeFundsOutflow,
      gaiNianFundsInflow,
      gaiNianFundsOutflow,
    ]);

    // const foreignFunds: any = this.transformForeignFunds(responseForeignFunds);
    // 更新数据获取接口 2024-05-15 21:26:00
    const foreignFunds: any = transformForeignFundsNew(await responseForeignFundsData.text());
    const marketTurnover: any = this.getMarketTurnover(await responseMarketTurnoverData.text());
    // 获取行业板块流入 Top3
    const hangyeFundsInflowTop3 = this.getPlateTop(hangyeFundsInflowData, dateStr, 3);
    const hangyeFundsOutflowTop3 = this.getPlateTop(hangyeFundsOutflowData, dateStr, 3);
    const gainianFundsInflowTop3 = this.getPlateTop(gaiNianFundsInflowData, dateStr, 3);
    const gainianFundsOutflowTop3 = this.getPlateTop(gaiNianFundsOutflowData, dateStr, 3);

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
  getPlateTop(platesData, dateStr, len = 5) {
    // const platesData = commonUtil.getIwencaiData(responseJson);
    return platesData.splice(0, len).map(item => {
      return {
        name: item['指数简称'],
        code: item['code'],
        // code: item['指数代码'],
        funds: commonUtil.fundsToFixed(item[`指数@主力资金流向[${dateStr}]`]),
        quoteChange: commonUtil.toFixed(item[`指数@涨跌幅:前复权[${dateStr}]`] || '0.0'),
      };
    });
  },
};
