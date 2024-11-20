import { CreateLatestConceptPlate } from '../dto/create-latest-concept-plate';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { iwencaiUrl, params } from '../core/config';

/**
 * 通过接口方式获取热门数据
 * @returns
 */
export async function getLatestConceptPlate(currentLatestConceptPlate) {
  let createLatestConceptPlateArr = [];
  const latestConceptPlates: any = await fetchIwencaiApi(iwencaiUrl + params.gainianPlate);

  // 与最新板块比较，判断是否 有新增的概念板块，如有 则返回
  if (currentLatestConceptPlate.code === latestConceptPlates[0]['code']) {
    return null;
  }

  const index = latestConceptPlates.findIndex(item => {
    return item['code'] === currentLatestConceptPlate.code;
  });
  // 取出待录入的 板块信息
  const latestConceptPlatesArr = latestConceptPlates.splice(0, index);
  const createTime = new Date();
  createLatestConceptPlateArr = latestConceptPlatesArr.map(item => {
    const createLatestConceptPlate = new CreateLatestConceptPlate();
    createLatestConceptPlate.name = item['指数简称'];
    createLatestConceptPlate.code = item['code'];
    // createLatestConceptPlate.code = item['指数代码'];
    createLatestConceptPlate.createTime = createTime;
    return createLatestConceptPlate;
  });

  return createLatestConceptPlateArr.reverse();
}
