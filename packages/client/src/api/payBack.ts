import { http } from '@/core/request';
import { ShortTermModel } from './model/ShortTermModel';
import { MarketModel } from './model/MarketModel';
import { FundsModel } from './model/FundsModel';

const baseUrl = 'blowsysun/pay-back';

export interface ChartResult {
  shortTermData: ShortTermModel[],
  marketData: MarketModel[],
  fundsData: FundsModel[],
}

/**
 * 获取图表数据
 * @param params 
 * @returns 
 */
export const fetchChartData = (params: any | null) => {
  return http.request<ChartResult>("get", `${baseUrl}/list`, { params });
}

export const fetchData = (params: any | null) => {
  return http.request<ChartResult>("get", `${baseUrl}/list`, { params });
}

/**
 * 爬取当日数据，更新至数据库
 * @returns 
 */
export const crawlTodayData = () => {
  return http.request<ChartResult>("get", `${baseUrl}/crawlTodayData`);
}
/**
 * 获取连板数据
 * @returns 
 */
export const fetchEvenBoardData = (params: any | null) => {
  return http.request<ChartResult>("get", `${baseUrl}/fetchEvenBoardData`, { params });
}
/**
 * 获取热榜数据
 * @returns 
 */
export const fetchHostListData = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/fetchHostListData`, { params });
}
/**
 * 获取板块涨跌幅 TOP5
 * @returns 
 */
export const findPlateByLimit = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/findPlateByLimit`, { params });
}
