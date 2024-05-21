import { CreateHotListDto } from '../dto/create-hot-list.dto';
import { Logger } from '@nestjs/common';
import { transformStockData, transformPlateData } from './transformDataUtil';
import fetch from 'node-fetch';

const logger = new Logger('hotListUtil');

/**
 * 通过接口方式获取热门数据
 * @returns
 */
export async function getHotListData() {
  const createHotListDto = new CreateHotListDto();
  const baseUrl = 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1';
  const normal = fetch(baseUrl + '/stock?stock_type=a&type=hour&list_type=normal');
  const value = fetch(baseUrl + '/stock?stock_type=a&type=day&list_type=value');
  const concept = fetch(baseUrl + '/plate?type=concept');
  const industry = fetch(baseUrl + '/plate?type=industry');
  const maxAmount10 = 10;
  const maxAmount5 = 5;
  try {
    const [stockNormal, stockValue, plateConcept, plateIndustry] = await Promise.all([
      normal,
      value,
      concept,
      industry,
    ]).then(async ([d1, d2, d3, d4]) => {
      const normalStock = (await d1.json()).data.stock_list.splice(0, maxAmount10);
      const valueStock = (await d2.json()).data.stock_list.splice(0, maxAmount10);
      const conceptPlate = (await d3.json()).data.plate_list.splice(0, maxAmount5);
      const industryPlate = (await d4.json()).data.plate_list.splice(0, maxAmount5);
      return [normalStock, valueStock, conceptPlate, industryPlate];
    });

    createHotListDto.stockNormal = transformStockData(stockNormal);
    createHotListDto.stockValue = transformStockData(stockValue);
    createHotListDto.plateConcept = transformPlateData(plateConcept);
    createHotListDto.plateIndustry = transformPlateData(plateIndustry);
    createHotListDto.updatedTime = new Date();
    return createHotListDto;
  } catch (e: any) {
    logger.error('getHotListData error:', e);
    return createHotListDto;
  }
}
