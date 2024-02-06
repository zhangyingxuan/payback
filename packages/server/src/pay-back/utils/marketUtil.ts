// 开发须知：
// 轻量服务器 1核1G 仅支持1个 browser 1个page 同时打开，否则会阻塞执行
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import fundsUtil from './fundsUtil';
import { fetchMarketPointFromEastmoney, fetchMarketData, fetchIwencaiApi } from '../core/fetchUtil';
import { params } from '../core/config';
import { ignoreGainianPlates, ignoreGainianPlateStr } from './commonUtil';

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
    createMarketDataDto.chuangyePoint = indexResult[3]['f2'];

    // 获取同花顺分数、涨跌家数
    const marketData = await fetchMarketData();
    createMarketDataDto.dailyLimitIncome = marketData.jrbx_data.last_zdf;
    createMarketDataDto.fallAmount = marketData.zdfb_data.dnum;
    createMarketDataDto.riseAmount = marketData.zdfb_data.znum;
    createMarketDataDto.marketScore = marketData.dppj_data;

    const gainianRiseFloat: any = await fetchIwencaiApi(params.gainianRiseFloat + ignoreGainianPlateStr);
    const gainianFallFloat: any = await fetchIwencaiApi(params.gainianFallFloat + ignoreGainianPlateStr);
    const hangyeRiseFloat = await fetchIwencaiApi(params.hangyeRiseFloat);
    const hangyeFallFloat = await fetchIwencaiApi(params.hangyeFallFloat);

    const gainianRiseFloatTop3 = fundsUtil.getPlateTop(gainianRiseFloat, dateStr);
    const gainianFallFloatTop3 = fundsUtil.getPlateTop(gainianFallFloat, dateStr);
    const hangyeRiseFloatTop3 = fundsUtil.getPlateTop(hangyeRiseFloat, dateStr);
    const hangyeFallFloatTop3 = fundsUtil.getPlateTop(hangyeFallFloat, dateStr);
    createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop3);
    createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop3);
    createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop3);
    createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop3);
    createMarketDataDto.createTime = new Date();
    return createMarketDataDto;
  },
};
