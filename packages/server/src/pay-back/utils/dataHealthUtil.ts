import * as dayjs from 'dayjs';
import { toTradeDate } from './tradeDateUtil';

export type DataHealthStatus = 'fresh' | 'stale' | 'missing' | 'empty';

export function getExpectedTradeDate(latestDate?: any, now = new Date()) {
  const day = dayjs(now).day();
  return day === 0 || day === 6 ? toTradeDate(latestDate || now) : toTradeDate(now);
}

export function createDataHealth(name: string, record: any, expectedDate: string, count?: number) {
  if (!record) return { name, status: 'missing' as DataHealthStatus, tradeDate: expectedDate, count: 0 };

  const tradeDate = toTradeDate(record.tradeDate || record.createTime);
  const status: DataHealthStatus = tradeDate !== expectedDate ? 'stale' : count === 0 ? 'empty' : 'fresh';
  return { name, status, tradeDate, updatedTime: record.updatedTime || record.createTime, count };
}

export function jsonLength(value?: string) {
  if (!value) return 0;
  try {
    const data = JSON.parse(value);
    return Array.isArray(data) ? data.length : Object.keys(data || {}).length;
  } catch {
    return 0;
  }
}
