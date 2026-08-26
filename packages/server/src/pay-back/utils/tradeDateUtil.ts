import * as dayjs from 'dayjs';

export const toTradeDate = (value: string | Date = new Date()) => dayjs(value).format('YYYY-MM-DD');
export const toIwencaiDate = (value: string | Date = new Date()) => dayjs(value).format('YYYYMMDD');
