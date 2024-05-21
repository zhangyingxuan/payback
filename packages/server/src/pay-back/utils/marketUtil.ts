// 开发须知：
// 轻量服务器 1核1G 仅支持1个 browser 1个page 同时打开，否则会阻塞执行
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import fundsUtil from './fundsUtil';
import { fetchMarketPointFromEastmoney, fetchMarketData, fetchIwencaiApi } from '../core/fetchUtil';
import { params } from '../core/config';
import { ignoreGainianPlateStr } from './commonUtil';

export default {
  /**
   * 获取 市场数据
   */
  async getMarketData(dateStr): Promise<CreateMarketDataDto> {
    const createMarketDataDto: CreateMarketDataDto = new CreateMarketDataDto();
    // 获取市场指数
    const index = fetchMarketPointFromEastmoney();
    // 获取同花顺分数、涨跌家数
    const market = fetchMarketData();

    const gainianRiseFloat = fetchIwencaiApi(params.gainianRiseFloat + ignoreGainianPlateStr);
    const gainianFallFloat = fetchIwencaiApi(params.gainianFallFloat + ignoreGainianPlateStr);
    const hangyeRiseFloat = fetchIwencaiApi(params.hangyeRiseFloat);
    const hangyeFallFloat = fetchIwencaiApi(params.hangyeFallFloat);

    const [
      indexData,
      marketData,
      gainianRiseFloatData,
      gainianFallFloatData,
      hangyeRiseFloatData,
      hangyeFallFloatData,
    ] = await Promise.all([index, market, gainianRiseFloat, gainianFallFloat, hangyeRiseFloat, hangyeFallFloat]);

    createMarketDataDto.shangzhengPoint = indexData[0]['f2'];
    createMarketDataDto.shenzhengPoint = indexData[1]['f2'];
    createMarketDataDto.beizheng50Point = indexData[2]['f2'];
    createMarketDataDto.chuangyePoint = indexData[3]['f2'];
    createMarketDataDto.dailyLimitIncome = marketData.jrbx_data.last_zdf;
    createMarketDataDto.fallAmount = marketData.zdfb_data.dnum;
    createMarketDataDto.riseAmount = marketData.zdfb_data.znum;
    createMarketDataDto.marketScore = marketData.dppj_data;

    const gainianRiseFloatTop5 = fundsUtil.getPlateTop(gainianRiseFloatData, dateStr);
    const gainianFallFloatTop5 = fundsUtil.getPlateTop(gainianFallFloatData, dateStr);
    const hangyeRiseFloatTop5 = fundsUtil.getPlateTop(hangyeRiseFloatData, dateStr);
    const hangyeFallFloatTop5 = fundsUtil.getPlateTop(hangyeFallFloatData, dateStr);
    createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop5);
    createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop5);
    createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop5);
    createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop5);
    createMarketDataDto.createTime = new Date();
    return createMarketDataDto;
  },
};
