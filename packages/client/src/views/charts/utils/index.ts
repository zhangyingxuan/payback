import dayjs from 'dayjs';

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
  if (date.indexOf(':') === -1) {
    date += ' 12:00'
  }
  // console.log(dayjs(date).startOf('week').add(1, 'day').format('MM/DD'));
  // 获取当前时间的周一
  const currentDayMonday = dayjs(date).startOf('week').add(1, 'day').format('MM/DD');
  return dayjs(date).format('MM/DD') === currentDayMonday;
}

/**
 * 判断是否为周一
 * @param date 
 * @returns 
 */
export function getCurrentDay(date: string) {
  const day = dayjs(date).day();
  var week = ['日', '一', '二', '三', '四', '五', '六'];
  return '周' + week[day];
}