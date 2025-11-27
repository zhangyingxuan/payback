import { http } from '@/core/request';
import { ArticleModel } from './model/ArticleModel';

const baseUrl = 'blowsysun/article';

/**
 * 获取所有文章
 * @param params 
 * @returns 
 */
export const findAll = () => {
  return http.request<Array<ArticleModel>>("get", `${baseUrl}/findAll`);
}
/**
 * 获取一条文章
 * @param params 
 * @returns 
 */
export const findOne = (params: any | null) => {
  return http.request<ArticleModel>("get", `${baseUrl}/findOne`, { params });
}
/**
 * 新增
 * @param params 
 * @returns 
 */
export const create = (data: any | null) => {
  return http.request<ArticleModel>("post", `${baseUrl}/create`, { data });
}
/**
 * 编辑
 * @param params 
 * @returns 
 */
export const update = (data: any | null) => {
  return http.request<ArticleModel>("post", `${baseUrl}/update`, {
    data,
  });
}
/**
 * 删除
 * @param params 
 * @returns 
 */
export const remove = (data: any | null) => {
  return http.request<ArticleModel>("post", `${baseUrl}/remove`, {
    data,
  });
}