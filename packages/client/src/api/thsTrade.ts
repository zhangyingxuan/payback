import { http } from '@/core/request';

const baseUrl = 'blowsysun/ths-trade';

/**
 * 同步自选个股
 * @returns 
 */
export const modifyThsSelfStocks = () => {
  return http.request<Array<any>>("get", `${baseUrl}/modifyThsSelfStocks`);
}
