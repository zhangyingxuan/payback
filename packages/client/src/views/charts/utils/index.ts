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

// 星火集合竞价成交量放大到和首板涨停爆量相同最佳，如果放大到2/3也可以，最差也要放量到一半，如果缩量就没有参与价值。
const currentDate = dayjs().format('YYYY-MM-DD');
// 9.31
const date931 = dayjs(currentDate + ' 09:31:00');
// 10:01
const date1000 = dayjs(currentDate + ' 10:00:00');
// 13:00
const date1300 = dayjs(currentDate + ' 13:00:00');
const date1400 = dayjs(currentDate + ' 14:00:00');
const expectedArr = ['5%', '4%', '3%', '0%-2%', '-2%-2%', '-2%以上'];
export function getExpected(stock: DailyLimitStockDto) {
  let currentTime: any = stock.openTimes ? stock.dailyTime.split(',')[1] : stock.dailyTime;
  // console.log(stock.name, stock.openTimes, stock.dailyTime, currentTime);

  currentTime = dayjs(currentDate + ' ' + currentTime);
  // 文心一言
  // 1、昨日一字板或开盘秒板的。第二天正常预期高开5%以上。
  // 2、昨日10点前涨停的，第二天正常预期高开4%左右。
  // 3、昨日11点半前涨停的，第二天正常预期高开3%左右。
  // 4、昨日午后13-14涨停的，第二天预期微高开（0—2%）
  // 5、昨日午后14之后涨停的，第二天预期平开（-2%—2%）
  // 6、昨日烂板（开板5次），第二天预计低开（0--2%）

  if (stock.openTimes >= 5) {
    return expectedArr[5];
  }

  if (currentTime.isBefore(date931)) {
    return expectedArr[0];
  }
  if (currentTime.isBefore(date1000)) {
    return expectedArr[1];
  }
  if (currentTime.isBefore(date1300)) {
    return expectedArr[2];
  }
  if (currentTime.isBefore(date1400) && currentTime.isAfter(date1300)) {
    return expectedArr[3];
  }
  return expectedArr[4];
}