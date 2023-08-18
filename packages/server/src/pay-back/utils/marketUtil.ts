// 开发须知：
// 轻量服务器 1核1G 仅支持1个 browser 1个page 同时打开，否则会阻塞执行
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import fundsUtil from './fundsUtil';
import { fetchMarketPointFromEastmoney, fetchMarketData, fetchIwencaiApi } from '../core/fetchUtil';
import { params } from '../core/config';

export default {
  /**
   * 获取 市场数据
   */
  async getMarketData(dateStr): Promise<CreateMarketDataDto> {
    const createMarketDataDto: CreateMarketDataDto = new CreateMarketDataDto();
    // 获取市场指数
    const indexResult = await fetchMarketPointFromEastmoney();
    createMarketDataDto.shangzhengPoint = indexResult[0]['f2'];
    createMarketDataDto.shenzhengPoint = indexResult[1]['f2'];
    createMarketDataDto.beizheng50Point = indexResult[2]['f2'];
    createMarketDataDto.chuangyePoint = indexResult[5]['f2'];

    // 获取同花顺分数、涨跌家数
    const marketData = await fetchMarketData();
    createMarketDataDto.dailyLimitIncome = marketData.jrbx_data.last_zdf;
    createMarketDataDto.fallAmount = marketData.zdfb_data.dnum;
    createMarketDataDto.riseAmount = marketData.zdfb_data.znum;
    createMarketDataDto.marketScore = marketData.dppj_data;

    const gainianRiseFloat = await fetchIwencaiApi(params.gainianRiseFloat);
    const gainianFallFloat = await fetchIwencaiApi(params.gainianFallFloat);
    const hangyeRiseFloat = await fetchIwencaiApi(params.hangyeRiseFloat);
    const hangyeFallFloat = await fetchIwencaiApi(params.hangyeFallFloat);

    const gainianRiseFloatTop3 = fundsUtil.getPlateTop(gainianRiseFloat, dateStr, 5);
    const gainianFallFloatTop3 = fundsUtil.getPlateTop(gainianFallFloat, dateStr, 5);
    const hangyeRiseFloatTop3 = fundsUtil.getPlateTop(hangyeRiseFloat, dateStr, 5);
    const hangyeFallFloatTop3 = fundsUtil.getPlateTop(hangyeFallFloat, dateStr, 5);
    createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop3);
    createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop3);
    createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop3);
    createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop3);
    createMarketDataDto.createTime = new Date();
    return createMarketDataDto;
  },
}