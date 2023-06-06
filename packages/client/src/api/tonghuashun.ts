import { http } from '@/core/request';

const baseUrl = 'tonghuashun';

export const fetchLonghuHistoryData = () => {
  return http.request<any>("get", `${baseUrl}/dataapi/transaction/market/v1/history_count`);
}
export const fetchIndustryData = () => {
  return http.request<any>("get", `https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate?type=industry`);
}