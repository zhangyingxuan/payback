import { CreatePlateDataDto } from '../dto/create-Plate-data.dto';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { params } from '../core/config';
import commonUtil from './commonUtil';

function getPlateTop(platesData, dateStr, len = 5) {
  return platesData.splice(0, len).map(item => {
    return {
      name: item['指数简称'],
      code: item['code'],
      turnover: commonUtil.fundsToFixed(item[`指数@成交额[${dateStr}]`]),
      num: item[`指数@涨停家数[${dateStr}]`],
      quoteChange: commonUtil.toFixed(item[`指数@涨跌幅:前复权[${dateStr}]`] || '0.0'),
    };
  });
}

export default {
  /**
   * 获取 市场数据
   */
  async getPlateData(dateStr): Promise<CreatePlateDataDto> {
    const createPlateDataDto: CreatePlateDataDto = new CreatePlateDataDto();

    const gainianDailyLimit = fetchIwencaiApi(
      params.gainianPlateOrderByDailyLimitNum + commonUtil.ignoreGainianPlateStr,
    );
    const hangyeDailyLimit = fetchIwencaiApi(params.hangyePlateOrderByDailyLimitNum);
    const [gainianDailyLimitData, hangyeDailyLimitData] = await Promise.all([gainianDailyLimit, hangyeDailyLimit]);

    const gainianDailyLimitDataTop = getPlateTop(gainianDailyLimitData, dateStr);
    const hangyeDailyLimitDataTop = getPlateTop(hangyeDailyLimitData, dateStr);
    createPlateDataDto.gainianDailyLimitData = JSON.stringify(gainianDailyLimitDataTop);
    createPlateDataDto.gainianDailyLimitNum =
      gainianDailyLimitDataTop && gainianDailyLimitDataTop[0] ? gainianDailyLimitDataTop[0].num : 0;
    createPlateDataDto.hangyeDailyLimitData = JSON.stringify(hangyeDailyLimitDataTop);
    createPlateDataDto.hangyeDailyLimitNum =
      hangyeDailyLimitDataTop && hangyeDailyLimitDataTop[0] ? hangyeDailyLimitDataTop[0].num : 0;
    createPlateDataDto.createTime = new Date();
    return createPlateDataDto;
  },
};
