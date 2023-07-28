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
  if (keyword) {
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

const currentDate = dayjs().format('YYYY-MM-DD');
// 9.31
const date931 = dayjs(currentDate + ' 09:31:00');
// 10:01
const date1001 = dayjs(currentDate + ' 10:01:00');
// 13:00
const date1300 = dayjs(currentDate + ' 13:00:00');
const expectedArr = ['5%', '4%', '3%', '-2%-2%', '0%--2%'];
export function getExpected(stock: DailyLimitStockDto) {
  let currentTime: any = stock.openTimes === 0 ? stock.dailyTime : stock.dailyTime.split(',')[0];
  currentTime = dayjs(currentDate + ' ' + currentTime);
  // 1、昨日一字板或开盘秒板的。第二天正常预期高开5%以上。
  // 2、昨日10点前涨停的，第二天正常预期高开4%左右。
  // 3、昨日11点半前涨停的，第二天正常预期高开3%左右。
  // 4、昨日午后涨停的，第二天预期平开（-2%—2%）
  // 5、昨日烂板（开板5次），第二天预计低开（0--2%）
  // openTimes、dailyTime
  // 开板5次以上，烂板
  if (stock.openTimes >= 5) {
    return expectedArr[4];
  }

  if (currentTime.isBefore(date931)) {
    return expectedArr[0];
  }
  if (currentTime.isBefore(date1001)) {
    return expectedArr[1];
  }
  if (currentTime.isBefore(date1300)) {
    return expectedArr[2];
  }
  return expectedArr[3];
}