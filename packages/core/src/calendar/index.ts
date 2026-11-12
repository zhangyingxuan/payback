import { calendar2026 } from './data/2026';

export interface MarketClosure {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

export interface TradingCalendar {
  readonly year: number;
  readonly sourceUrl: string;
  readonly verifiedAt: string;
  readonly closures: readonly MarketClosure[];
}

export interface TradingDayInfo {
  date: string;
  status: 'open' | 'closed' | 'unknown';
  reason?: 'holiday' | 'weekend';
  name?: string;
}

export const tradingCalendars: readonly TradingCalendar[] = [calendar2026];

// 所有调用方先统一到上海日期，避免服务器或浏览器所在时区改变交易日。
export function toShanghaiDate(now = new Date()): string {
  if (!Number.isFinite(now.getTime())) throw new RangeError('无效时间');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// 显式拒绝日期溢出，不能让 2 月 30 日被平台自动转换成 3 月。
function parseDate(date: string): Date {
  const value = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(value.getTime()) || value.toISOString().slice(0, 10) !== date) {
    throw new RangeError('日期必须为有效的 YYYY-MM-DD');
  }
  return value;
}

export function getTradingDayInfo(date: string): TradingDayInfo {
  const value = parseDate(date);
  const calendar = tradingCalendars.find(item => item.year === value.getUTCFullYear());
  // 缺少年度公告时不推测开市状态，交给调用方决定如何处理。
  if (!calendar) return { date, status: 'unknown' };
  const closure = calendar.closures.find(item => item.startDate <= date && date <= item.endDate);
  if (closure) return { date, status: 'closed', reason: 'holiday', name: closure.name };
  const weekend = value.getUTCDay() === 0 || value.getUTCDay() === 6;
  return weekend ? { date, status: 'closed', reason: 'weekend' } : { date, status: 'open' };
}

// 只在连续已核验的日历范围内向后查找，跨入未知年份立即停止。
export function getNextTradingDay(date: string): string | undefined {
  const value = parseDate(date);
  if (getTradingDayInfo(date).status === 'unknown') return undefined;
  while (true) {
    value.setUTCDate(value.getUTCDate() + 1);
    const nextDate = value.toISOString().slice(0, 10);
    const info = getTradingDayInfo(nextDate);
    if (info.status === 'unknown') return undefined;
    if (info.status === 'open') return nextDate;
  }
}
