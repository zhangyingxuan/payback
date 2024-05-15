import { http } from '@/core/request';

const baseUrl = 'tonghuashun';

export const fetchLonghuHistoryData = () => {
  return http.request<any>("get", `${baseUrl}/dataapi/transaction/market/v1/history_count`);
}
export const fetchIndustryData = () => {
  return http.request<any>("get", `https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate?type=industry`);
}
/**
 * （最强题材）获取涨停个股 按 概念分类
 * 
 * @param date 
 * @returns 
 */
export const fetchDailyLimitStockGroupByGainian = (date: string) => {
  // https://data.10jqka.com.cn/dataapi/limit_up/block_top?filter=HS,GEM2STAR&date=20240412
  return http.request<any>("get", `${baseUrl}/dataapi/limit_up/block_top?filter=HS,GEM2STAR&date=${date}`);
}