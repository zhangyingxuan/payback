import { http } from '@/core/request';
import { ShortTermModel } from './model/shortTermModel';
import { MarketModel } from './model/MarketModel';

const baseUrl = 'pay-back';

export interface ChartResult {
  shortTermData: ShortTermModel[],
  marketData: MarketModel[],
}

export const fetchChartData = (params: any) => {
  return http.request<ChartResult>("get", `${baseUrl}/list`, params);
}
