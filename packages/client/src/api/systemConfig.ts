import { http } from '@/core/request';

const baseUrlSystemConfig = 'blowsysun/system-config';
/**
 * 获取系统配置
 * @returns 
 */
export const fetchSystemConfig = () => {
  return http.request<Array<any>>("get", `${baseUrlSystemConfig}/fetchSystemConfig`);
}
/**
 * 修改系统配置
 * @returns 
 */
export const updateSystemConfig = (data: any | null) => {
  return http.request<Array<any>>("post", `${baseUrlSystemConfig}/updateSystemConfig`, { data });
}
/**
 * 修改系统配置
 * @returns 
 */
export const toggleNewsPushEnable = (data: any | null) => {
  return http.request<Array<any>>("post", `${baseUrlSystemConfig}/toggleNewsPushEnable`, { data });
}