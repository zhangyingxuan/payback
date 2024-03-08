import { http } from '@/core/request';

const baseUrl = 'blowsysun/ths-trade';

/**
 * 同步自选个股
 * @returns 
 */
export const modifyThsSelfStocks = () => {
  return http.request<Array<any>>("get", `${baseUrl}/modifyThsSelfStocks`);
}
/**
 * 同步自选个股
 * @returns 
 */
export const addThsSelfStock = (data: any | null) => {
  return http.request<string | null>("post", `${baseUrl}/addThsSelfStock`, { data });
}
/**
 * 同步自选个股
 * @returns 
 */
export const delThsSelfStock = (data: any | null) => {
  return http.request<string | null>("post", `${baseUrl}/delThsSelfStock`, { data });
}
/**
 * 同步自选个股
 * @returns 
 */
export const addThsSelfPlate = (data: any | null) => {
  return http.request<string | null>("post", `${baseUrl}/addThsSelfPlate`, { data });
}
/**
 * 同步自选个股
 * @returns 
 */
export const delThsSelfPlate = (data: any | null) => {
  return http.request<string | null>("post", `${baseUrl}/delThsSelfPlate`, { data });
}
