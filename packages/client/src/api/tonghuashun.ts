import { http } from '@/core/request';

const baseUrl = 'tonghuashun';
const baseUrlNews = 'tonghuashunNews';

export const fetchLonghuHistoryData = () => {
  return http.request<any>("get", `${baseUrl}/dataapi/transaction/market/v1/history_count`);
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

export const fetchThsNews = (time = '1725962009') => {
  return http.request<any>("get", `${baseUrlNews}/tapp/news/push/stock/?page=1&tag=&track=website&ctime=${time}`,);
}