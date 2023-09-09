import dayjs from 'dayjs';
import { DailyLimitStockDto } from '@/typings';
/**
 * 对象转数组
 * @param obj 
 * @returns 
 */
export function objectToArr(obj: any) {
  const arr: any[] = [];
  Object.keys(obj).forEach(key => {
    let o = { key: '', value: [] };
    o.key = key;
    o.value = obj[key];
    arr.push(o);
  });
  return arr;
}

/**
 * 数组转对象
 * @param arr 
 * @returns 
 */
export function arrToObject(arr: any) {
  const obj: any = {};
  arr.forEach((item: any) => {
    obj[item.key] = item.value;
  });
  return obj;
}

/**
 * 判断是否为周一
 * @param date 
 * @returns 
 */
export function judgeMonday(date: string) {
  return dayjs(date).day() === 1;
}

/**
 * 获取当前日期是周几
 * 
 * @param date 
 * @returns 
 */
export function getCurrentDay(date: string) {
  const day = dayjs(date).day();
  var week = ['日', '一', '二', '三', '四', '五', '六'];
  // console.log(date, '周' + week[day]);

  return '周' + week[day];
}

export function highlightKeyWord(result: string, keyword: string) {
  if (keyword && result) {
    /**
     * 使用正则表达式进行全文匹配关键词
     * ig : 表示 全文查找 ,忽略大小写
     *  i : 忽略大小写
     *  g : 全文查找
    *
    * 使用字符串的replace方法进行替换
    * stringObject.replace('被替换的值',替换的值)
    */
    let replaceReg = new RegExp(keyword, 'ig');
    let replaceString = `<span class="searchWord">${keyword}</span>`;
    result = result.replace(replaceReg, replaceString);
  }
  return result;
}