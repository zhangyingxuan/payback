import { http } from '@/core/request';
import { UserModel } from './model/UserModel'

const baseUrl = 'blowsysun/auth';

export const authLogin = (data: UserModel) => {
  return http.request<any>("post", `${baseUrl}/login`, { data });
}
export const getCode = () => {
  return http.request<any>("get", `${baseUrl}/getCode`, { responseType: 'blob'});
}
