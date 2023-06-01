import { http } from '@/core/request';

const baseUrl = 'tonghuashun';

export const fetchLonghuHistoryData = () => {
  return http.request<any>("get", `${baseUrl}/dataapi/transaction/market/v1/history_count`);
}