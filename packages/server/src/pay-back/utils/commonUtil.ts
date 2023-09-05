import * as dayjs from 'dayjs';

export function toFixed(num, floatLen = 2) {
  if (!num) return;
  if (typeof (num) == 'string') {
    num = +num;
  }
  return +(num).toFixed(floatLen)
};

export function fundsToFixed(num, floatLen = 2) {
  if (!num) return;
  if (typeof (num) == 'string') {
    num = +num;
  }
  return +(num / 100000000).toFixed(floatLen)
};

/**
* 取出 爱问财 返回的有效数据
* @param responseJson 
* @returns 
*/
export function getIwencaiData(responseJson) {
  let data = [];
  try {
    data = responseJson.data.answer[0].txt[0].content.components[0].data.datas;
  } catch (e) {
    console.log('[error log] getIwencaiData 数据结构错误！', e)
    // console.log('[error log] getIwencaiData 数据结构错误！' + responseJson)
  }
  return data;
};

export function getLastTradingDay(nowStr: string) {
  const dayOfWeek = +dayjs(nowStr).format('ddd');
  let subtractNum = 1;

  // 如果今天是周6 7，昨日为周五， 如果今天是周1，则昨日为上周5
  switch (dayOfWeek) {
    case 1:
      subtractNum = 3;
      break;
    case 6:
      subtractNum = 1;
      break;
    case 7:
      subtractNum = 2;
      break;
    case 2:
    case 3:
    case 4:
    case 5:
    default:
      break;
  }

  const yesterday = dayjs(nowStr).subtract(subtractNum, 'day').format('YYYYMMDD');
  // 判断yesterday 是否为节假日，如果是继续-1

  return yesterday;
}

export function isHoliday(date: string) {
  // 手动输入节假日日期 数组
}

export default {
  getIwencaiData,
  toFixed,
  fundsToFixed,
  getLastTradingDay,
}