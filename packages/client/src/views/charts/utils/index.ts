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
  return dayjs(date).day() - 1 === 1;
}

/**
 * 判断是否为周一
 * @param date 
 * @returns 
 */
export function getCurrentDay(date: string) {
  const day = dayjs(date).day();
  switch (day) {
    case 0:
      return '周六';
    case 1:
      return '周天';
    case 6:
      return '周五';
    case 5:
      return '周四';
    case 4:
      return '周三';
    case 3:
      return '周二';
    case 2:
      return '周一';
  }
  return;
}