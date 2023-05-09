import { http } from '@/core/request';
import { ShortTermModel } from './model/ShortTermModel';
import { MarketModel } from './model/MarketModel';
import { FundsModel } from './model/FundsModel';

const baseUrl = 'pay-back';

export interface ChartResult {
  shortTermData: ShortTermModel[],
  marketData: MarketModel[],
  fundsData: FundsModel[],
}

export const fetchChartData = (params: any | null) => {
  return http.request<ChartResult>("get", `${baseUrl}/list`, { params });
}

export const fetchData = (params: any | null) => {
  return http.request<ChartResult>("get", `${baseUrl}/list`, { params });
}
