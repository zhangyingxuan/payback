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
export const crawlTodayData = (data: any | null) => {
  return http.request<ChartResult>("post", `${baseUrl}/crawlTodayData`, { data });
}

/**
 * 爬取当日竞价数据并返回
 * @returns 
 */
export const crawlBinddingData = (data: any | null) => {
  return http.request<ChartResult>("post", `${baseUrl}/crawlBinddingData`, { data });
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
 * 更新热榜数据，并返回
 * @returns 
 */
export const crawlHotListData = () => {
  return http.request<Array<any>>("get", `${baseUrl}/crawlHotListData`);
}
/**
 * 获取板块涨跌幅 TOP5
 * @returns 
 */
export const findPlateByLimit = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/findPlateByLimit`, { params });
}
/**
 * 获取复盘数据
 * @returns 
 */
export const fetchReveiwDataByDate = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/fetchReveiwDataByDate`, { params });
}
/**
 * 获取n 天内的概念
 * @returns 
 */
export const findConceptPlateWithinNDays = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/findConceptPlateWithinNDays`, { params });
}
/**
 * 获取n 天内的概念
 * @returns 
 */
export const findConceptPlateByLimit = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/findConceptPlateByLimit`, { params });
}