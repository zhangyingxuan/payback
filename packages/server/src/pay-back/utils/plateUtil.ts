// 开发须知：
// 轻量服务器 1核1G 仅支持1个 browser 1个page 同时打开，否则会阻塞执行
import { CreatePlateDataDto } from '../dto/create-Plate-data.dto';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { params } from '../core/config';
import commonUtil from './commonUtil';

function getPlateTop(platesData, dateStr, len = 3) {
  // const platesData = commonUtil.getIwencaiData(responseJson);
  return platesData.splice(0, len).map(item => {
    return {
      name: item['指数简称'],
      code: item['code'],
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

    const gainianDailyLimitData = await fetchIwencaiApi(
      params.gainianPlateOrderByDailyLimitNum + commonUtil.ignoreGainianPlateStr,
      5,
    );
    const hangyeDailyLimitData = await fetchIwencaiApi(params.hangyePlateOrderByDailyLimitNum, 5);

    const gainianDailyLimitDataTop = getPlateTop(gainianDailyLimitData, dateStr, 5);
    const hangyeDailyLimitDataTop = getPlateTop(hangyeDailyLimitData, dateStr, 5);
    createPlateDataDto.gainianDailyLimitData = JSON.stringify(gainianDailyLimitDataTop);
    createPlateDataDto.gainianDailyLimitNum = gainianDailyLimitDataTop[0].num;
    createPlateDataDto.hangyeDailyLimitData = JSON.stringify(hangyeDailyLimitDataTop);
    createPlateDataDto.hangyeDailyLimitNum = hangyeDailyLimitDataTop[0].num;
    createPlateDataDto.createTime = new Date();
    return createPlateDataDto;
  },
};
