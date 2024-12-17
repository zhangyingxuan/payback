import commonUtil from './commonUtil';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { params } from '../core/config';
import fetch from 'node-fetch';
import { ignoreGainianPlateStr, getLastTradingDay } from './commonUtil';
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
    // 暂时去除，北向、南向资金
    const responseForeignFunds = fetch(
      `https://push2.eastmoney.com/api/qt/kamt/get?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f56,f60,f62,f63,f65,f66&ut=fa5fd1943c7b386f172d6893dbfba10b&cb=jQuery1123049543730033209155_${dateTime}&_=${dateTime}`,
    );

    const hangyeFundsInflow = fetchIwencaiApi(params.hangyeFundsInflow);
    const hangyeFundsOutflow = fetchIwencaiApi(params.hangyeFundsOutflow);
    const gaiNianFundsInflow = fetchIwencaiApi(params.gainianFundsInflow + ignoreGainianPlateStr);
    const gaiNianFundsOutflow = fetchIwencaiApi(params.gainianFundsOutflow + ignoreGainianPlateStr);

    const [
      responseForeignFundsData,
      hangyeFundsInflowData,
      hangyeFundsOutflowData,
      gaiNianFundsInflowData,
      gaiNianFundsOutflowData,
    ] = await Promise.all([
      responseForeignFunds,
      hangyeFundsInflow,
      hangyeFundsOutflow,
      gaiNianFundsInflow,
      gaiNianFundsOutflow,
    ]);

    // const foreignFunds: any = this.transformForeignFunds(responseForeignFunds);
    // 更新数据获取接口 2024-05-15 21:26:00
    const foreignFunds: any = transformForeignFundsNew(await responseForeignFundsData.text());
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
    createFundsDataDto.hangyeFundsTop = JSON.stringify({ in: hangyeFundsInflowTop3, out: hangyeFundsOutflowTop3 });
    createFundsDataDto.gainianFundsTop = JSON.stringify({ in: gainianFundsInflowTop3, out: gainianFundsOutflowTop3 });
    createFundsDataDto.createTime = new Date();

    return createFundsDataDto;
  },
  getPlateTop(platesData, currentDateStr, len = 5) {
    // const platesData = commonUtil.getIwencaiData(responseJson);

    // 如果当前非工作日，取上周五的日期
    return platesData.splice(0, len).map(item => {
      // 纠错环节，判断昨日日期是否正确
      if (!item[`指数@涨跌幅:前复权[${currentDateStr}]`]) {
        currentDateStr = getLastTradingDay(currentDateStr);
      }

      return {
        name: item['指数简称'],
        code: item['code'],
        // code: item['指数代码'],
        funds: commonUtil.fundsToFixed(item[`指数@主力资金流向[${currentDateStr}]`]),
        quoteChange: commonUtil.toFixed(item[`指数@涨跌幅:前复权[${currentDateStr}]`] || '0.0'),
      };
    });
  },
};
