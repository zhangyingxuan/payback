import { http } from '@/core/request';

const baseUrl = 'tonghuashun';
const baseUrlNews = 'thsNews';
const baseUrlDq = 'thsDq';

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

/**
 * 获取最新新闻
 * @param time 
 * @param source 
 * @returns 
 */
export const fetchThsNews = (time = '1725962009', source: any) => {
  return http.request<any>("get", `${baseUrlNews}/tapp/news/push/stock/?page=1&tag=&track=website&ctime=${time}`, { cancelToken: source.token });
}
/**
 * 
 * @returns 所有新闻，20条
 */
export const fetchThsAllNews = () => {
  return http.request<any>("get", `${baseUrlNews}/tapp/news/push/stock/?page=1&tag=&track=website&pagesize=400`,);
}

/**
 * 获取异动个股
 * @param time 
 * @param source 
 * @returns 
 */
export const fetchThsStockHaltMonitor = () => {
  return http.request<any>("get", `${baseUrlDq}/fuyao/stock_halt_monitor/monitor_stock/v1/list?date_type=monitor&page_num=1`);
}
/**
 * 获取历史异动个股
 * @param time 
 * @param source 
 * @returns 
 */
export const fetchThsStockHaltMonitorHistory = () => {
  return http.request<any>("get", `${baseUrlDq}/fuyao/stock_halt_monitor/monitor_stock/v1/list?date_type=history&page_num=1`);
}