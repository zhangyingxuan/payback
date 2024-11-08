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
 * 爬取当日新股、强势股数据并返回
 * @returns 
 */
export const crawlSpecialStockData = (data: any | null) => {
  return http.request<ChartResult>("post", `${baseUrl}/crawlSpecialStockData`, { data });
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
 * 更新 板块数据，并返回
 * @returns 
 */
export const crawlPlateData = () => {
  return http.request<Array<any>>("get", `${baseUrl}/crawlPlateData`);
}
/**
 * 获取板块涨跌幅 TOP5
 * @returns 
 */
export const findPlateByLimit = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/findPlateByLimit`, { params });
}
/**
 * 获取板块 按板块内涨停家数排序
 * @returns 
 */
export const fetchPlateOrderByDailyLimit = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/fetchPlateOrderByDailyLimit`, { params });
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
 * 获取n 条概念
 * @returns 
 */
export const findConceptPlateByLimit = (params: any | null) => {
  return http.request<Array<any>>("get", `${baseUrl}/findConceptPlateByLimit`, { params });
}

/**
 * 删除 数据库数据 - 用于无用数据清理（节假日）
 * @returns 
 */
export const deleteData = (data: any | null) => {
  return http.request<Array<any>>("post", `${baseUrl}/deleteData`, { data });
}
/**
 * 保存用户信息
 * @returns 
 */
export const saveUserInfo = (data: any | null) => {
  return http.request<Array<any>>("post", `${baseUrl}/saveUserInfo`, { data });
}
/**
 * 获取最新 新闻消息 - 同花顺重要消息
 * @returns 
 */
export const fetchLatestNews = (params: any | null) => {
  return http.request<any>("get", `${baseUrl}/fetchLatestNews`, { params });
}