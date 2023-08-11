import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { transformShortTermSourceData } from '../utils/transformDataUtil';
import { params } from '../core/config';
import { fetchIwencaiApi } from '../core/fetchUtil';

/**
 * 通过接口方式获取热门数据
 * @returns 
 */
export async function getShortTermData(todayDateStr): Promise<CreatePayBackDto> {
  // 准备涨停数据
  const dailyLimitData: any = await fetchIwencaiApi(params.dailyLimitMoreThan1, 100, false);
  // 跌停数据
  const downLimitData: any = await fetchIwencaiApi(params.downLimit, 50, false);
  // 涨停打开个股
  const dailyLimitOpenData: any = await fetchIwencaiApi(params.dailyLimitOpen, 50, false);
  // 跌幅大于等于15的个股
  const hugeFallData: any = await fetchIwencaiApi(params.hugeFall, 50, false);

  return prepareDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr);
}

export async function getShortTermDataByDate(todayDateStr): Promise<CreatePayBackDto> {
  // 准备涨停数据
  const dailyLimitData: any = await fetchIwencaiApi(params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr), 100, false);
  // 跌停数据
  const downLimitData: any = await fetchIwencaiApi(params.downLimitByDate.replace('${date}', todayDateStr), 50, false);
  // 涨停打开个股
  const dailyLimitOpenData: any = await fetchIwencaiApi(params.dailyLimitOpenByDate.replace('${date}', todayDateStr), 50, false);
  // 跌幅大于等于15的个股
  const hugeFallData: any = await fetchIwencaiApi(params.hugeFallByDate.replace('${date}', todayDateStr), 50, false);

  return prepareDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr);
}

/**
 * 准备dto数据
 * @param dailyLimitData 
 * @param dailyLimitOpenData 
 * @param downLimitData 
 * @param todayDateStr 
 * @returns 
 */
function prepareDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr) {
  let createPayBackDto: CreatePayBackDto = new CreatePayBackDto();
  let { board1 = 0, evenBoardData, downLimitDataArr, hugeFallDataArr, dailyLimitReturnSealQuantity, downLimitQuantity } = transformShortTermSourceData(dailyLimitData, downLimitData, hugeFallData, todayDateStr);

  // 仅存储短线跌停，即’ 资金出逃‘ 类型
  createPayBackDto.downLimitQuantity = downLimitQuantity;
  createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
  // 涨停打开数量
  createPayBackDto.dailyLimitOpenQuantity = dailyLimitOpenData.length;
  // 封板率 = 涨停数 / （涨停数 + 涨停打开数）
  createPayBackDto.sealingRate = Math.round(dailyLimitData.length / (dailyLimitData.length + dailyLimitOpenData.length) * 100);
  // 炸板率 = （涨停打开数 + 涨停未遂数） / 涨停数
  // 炸板率 = 炸板数/<炸板数+涨停数>
  createPayBackDto.dailyLimitReturnSealQuantity = dailyLimitReturnSealQuantity;
  createPayBackDto.marketHeight = evenBoardData.maxHeight;
  createPayBackDto.board1 = board1;
  createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
  createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
  createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
  createPayBackDto.hugeFallData = JSON.stringify(hugeFallDataArr);
  createPayBackDto.createTime = new Date();
  createPayBackDto.cycle = getCurrentCycle(createPayBackDto);

  return createPayBackDto;
}


function getCurrentCycle(item: any) {
  // 1、启动；犹豫中复苏，亏钱效应结束后，开始出现4板，连板小于10，不会出现15%以上大面；做首板
  // 2、发酵；3、分歧转一致；4、加速；5、分歧转一致；6、加速；7、见顶；8、调整；9、反包；
  // 高度>=5；连板股数量&gt;=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现
  // 3、高潮 板块出现批量涨停潮，涨停数>=45；连板股数量&gt;=15；（梯队整齐）几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股
  // 4、衰退：总龙头见顶，高位连板股出现亏钱效应
  // 5、冰点：
  // 周期定义
  const cycles = ['启动', '发酵', '高潮', '退潮', '冰点'];
  // 最大高度 item.evenBoardData
  const maxHeight: any = item.marketHeight;
  // 跌幅大于15的个股
  const hugeFallNum = item.hugeFall ? item.hugeFall.length : 0;
  // 跌停数量
  if (maxHeight <= 4) {
    if (item.downLimitQuantity > 10) {
      return cycles[4];
    }
    // 今天的最高板没有昨天高，昨天是高潮
    if (maxHeight === 4 && hugeFallNum == 0) {
      return cycles[0];
    }
    return cycles[3];
  }
  if (maxHeight >= 5) {
    // 高潮前提，不能有连板负反馈
    if (item.evenBoardAmount >= 10 || item.dailyLimitQuantity >= 45) {
      return cycles[2];
    }
    return cycles[1];
  }
}