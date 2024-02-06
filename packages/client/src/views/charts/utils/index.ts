import dayjs from 'dayjs';
import { iwencaiUrl } from '@/views/charts/utils/config';
/**
 * 对象转数组
 * @param obj 
 * @returns 
 */
export function objectToArr(obj: any) {
  const arr: any[] = [];
  Object.keys(obj).forEach(key => {
    const o = { key: '', value: [] };
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
  const week = ['日', '一', '二', '三', '四', '五', '六'];
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
    const replaceReg = new RegExp(keyword, 'ig');
    const replaceString = `<span class="searchWord">${keyword}</span>`;
    result = result.replace(replaceReg, replaceString);
  }
  return result;
}


/**
 * 按竞价情况，返回class
 * @param bidRating 
 * @returns 
 */
export function calcClassByBidRating(bidRating: string) {
  // 看空、看多、偏空、混战
  if (bidRating === '看多') {
    return 'red bold';
  }

  if (bidRating === '看空') {
    return 'green bold';
  }
  if (bidRating === '偏空') {
    return 'green';
  }
  return '';
}

/**
 * 打开新的爱问财 窗口
 * @returns 
 */
export function openNewIwencaiWindow(keyWord: string) {
  // console.log(iwencaiUrl + keyWord + '&querytype=stock');
  window.open(iwencaiUrl + encodeURIComponent(keyWord));
}


export function getChartStyle(isMobile: boolean) {
  // 计算宽度；屏幕宽度 - 左侧siderBar - 边框 - cardLeft
  const columnsAmount = 2;
  const screenWidth = screen.width - 64 - 20 - columnsAmount * 15;
  const cardWidth = isMobile ? screen.width - 30 : screenWidth / columnsAmount;
  return {
    style: `width: ${cardWidth}px;`,
  };
}

export const stockTypes = {
  kechuang: ['688'],
  chuangye: ['3'],
  beijing: ['8', '4'],
}

/**
 * 判断是否涨停
 * @param stockCode  个股代码
 * @param increaseDecline  涨跌幅
 */
export function isDailyLimit(stockCode: string, increaseDecline: number) {
  // 涨停判断：主板大于 9.5；其他需大于19；京 29
  let dailyLimitIncrease = 9.5;
  if (
    stockCode.startsWith('688') ||
    stockCode.startsWith('3')
  ) {
    dailyLimitIncrease = 19.5;
  } else if (stockCode.startsWith('4') ||
    stockCode.startsWith('8')) {
    dailyLimitIncrease = 29.5;
  }

  return increaseDecline > dailyLimitIncrease;
}
/**
 * 是否 主板个股
 * @param stockCode  个股代码
 * @param increaseDecline  涨跌幅
 */
export function isMainPlate(stockCode: string) {
  if (
    stockCode.startsWith('688') ||
    stockCode.startsWith('3') || stockCode.startsWith('4') ||
    stockCode.startsWith('8')
  ) {
    return false;
  }

  return true;
}