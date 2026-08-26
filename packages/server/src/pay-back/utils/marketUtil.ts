// 开发须知：
// 轻量服务器 1核1G 仅支持1个 browser 1个page 同时打开，否则会阻塞执行
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import fundsUtil from './fundsUtil';
import {
  fetchMarketPointFromEastmoney,
  fetchMarketData,
  fetchIwencaiApi,
  fetchMarketSnapshotFromTencent,
} from '../core/fetchUtil';
import { params } from '../core/config';
import { ignoreGainianPlateStr, toFixed, getMarketTurnover } from './commonUtil';
import { createFetch } from '@/utils/abortFetch';

export default {
  /**
   * 获取 市场数据，指数数据 + 板块涨跌排行
   */
  async getMarketData(dateStr, cookie: string): Promise<CreateMarketDataDto> {
    const createMarketDataDto: CreateMarketDataDto = new CreateMarketDataDto();
    // 获取市场指数
    const index = fetchMarketPointFromEastmoney();
    const dateTime = new Date().getTime();
    // 获取同花顺分数、涨跌家数
    const market = fetchMarketData();
    // 板块涨跌排行
    const gainianRiseFloat = fetchIwencaiApi(params.gainianRiseFloat + ignoreGainianPlateStr, 5, cookie);
    const gainianFallFloat = fetchIwencaiApi(params.gainianFallFloat + ignoreGainianPlateStr, 5, cookie);
    const hangyeRiseFloat = fetchIwencaiApi(params.hangyeRiseFloat, 5, cookie);
    const hangyeFallFloat = fetchIwencaiApi(params.hangyeFallFloat, 5, cookie);
    const abortFetch = createFetch();
    // 成交量，涨幅数据
    const responseMarketTurnover = abortFetch(
      `https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=${dateTime}`,
    ).catch(() => null);

    const [
      indexData,
      marketData,
      gainianRiseFloatData,
      gainianFallFloatData,
      hangyeRiseFloatData,
      hangyeFallFloatData,
      responseMarketTurnoverData,
    ] = await Promise.all([
      index,
      market,
      gainianRiseFloat,
      gainianFallFloat,
      hangyeRiseFloat,
      hangyeFallFloat,
      responseMarketTurnover,
    ]);
    // 上涨涨跌幅
    createMarketDataDto.shangzhengRiseAndFall = indexData[0]['f3'];
    createMarketDataDto.shangzhengPoint = indexData[0]['f2'];
    createMarketDataDto.shenzhengPoint = indexData[1]['f2'];
    createMarketDataDto.beizheng50Point = indexData[2]['f2'];
    createMarketDataDto.chuangyePoint = indexData[3]['f2'];
    createMarketDataDto.dailyLimitIncome = marketData.jrbx_data.last_zdf;
    createMarketDataDto.fallAmount = marketData.zdfb_data.dnum;
    createMarketDataDto.riseAmount = marketData.zdfb_data.znum;
    createMarketDataDto.marketScore = marketData.dppj_data;

    let marketTurnover: any;
    try {
      marketTurnover = getMarketTurnover(await responseMarketTurnoverData.text());
    } catch (error) {
      marketTurnover = (await fetchMarketSnapshotFromTencent()).turnover;
    }
    const gainianRiseFloatTop5 = fundsUtil.getPlateTop(gainianRiseFloatData, dateStr);
    const gainianFallFloatTop5 = fundsUtil.getPlateTop(gainianFallFloatData, dateStr);
    const hangyeRiseFloatTop5 = fundsUtil.getPlateTop(hangyeRiseFloatData, dateStr);
    const hangyeFallFloatTop5 = fundsUtil.getPlateTop(hangyeFallFloatData, dateStr);
    createMarketDataDto.gainianRiseFloat = JSON.stringify(gainianRiseFloatTop5);
    createMarketDataDto.gainianFallFloat = JSON.stringify(gainianFallFloatTop5);
    createMarketDataDto.hangyeRiseFloat = JSON.stringify(hangyeRiseFloatTop5);
    createMarketDataDto.hangyeFallFloat = JSON.stringify(hangyeFallFloatTop5);
    createMarketDataDto.marketTurnover = toFixed(marketTurnover / 10000 / 10000 / 10000);
    createMarketDataDto.createTime = new Date();
    return createMarketDataDto;
  },
};
