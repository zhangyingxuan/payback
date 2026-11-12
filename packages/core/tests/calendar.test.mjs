import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getNextTradingDay, getTradingDayInfo, toShanghaiDate, tradingCalendars } from '../es/index.esm.js';

test('上海日期不依赖进程时区', () => {
  assert.equal(toShanghaiDate(new Date('2026-09-30T16:00:00Z')), '2026-10-01');
  assert.throws(() => toShanghaiDate(new Date('invalid')));
});

test('交易日、休市边界和调休周末', () => {
  assert.equal(getTradingDayInfo('2026-09-30').status, 'open');
  for (const date of ['2026-10-01', '2026-10-07', '2026-02-23']) {
    assert.equal(getTradingDayInfo(date).status, 'closed');
  }
  assert.equal(getTradingDayInfo('2026-10-01').name, '国庆节');
  assert.equal(getTradingDayInfo('2026-10-08').status, 'open');
  assert.equal(getTradingDayInfo('2026-10-10').reason, 'weekend');
  assert.equal(getTradingDayInfo('2026-02-28').status, 'closed');
});

test('缺失年份不能退回工作日近似', () => {
  assert.equal(getTradingDayInfo('2027-01-01').status, 'unknown');
  assert.equal(getTradingDayInfo('2027-01-02').status, 'unknown');
  assert.equal(getNextTradingDay('2026-12-31'), undefined);
});

test('严格校验日期并查询下一交易日', () => {
  for (const date of ['2026-02-30', '2026-13-01', '2026-1-01', '', '2026-01-01T00:00:00Z']) {
    assert.throws(() => getTradingDayInfo(date), RangeError);
  }
  assert.equal(getNextTradingDay('2026-09-30'), '2026-10-08');
  assert.equal(getNextTradingDay('2026-10-08'), '2026-10-09');
});

test('年度区间有来源、按日期排列且所有首尾均休市', () => {
  for (const calendar of tradingCalendars) {
    assert.ok(calendar.sourceUrl.startsWith('https://www.sse.com.cn/'));
    let previousEnd = '';
    for (const closure of calendar.closures) {
      assert.ok(closure.startDate > previousEnd);
      assert.ok(closure.startDate <= closure.endDate);
      assert.equal(Number(closure.startDate.slice(0, 4)), calendar.year);
      assert.equal(Number(closure.endDate.slice(0, 4)), calendar.year);
      assert.equal(getTradingDayInfo(closure.startDate).status, 'closed');
      assert.equal(getTradingDayInfo(closure.endDate).status, 'closed');
      previousEnd = closure.endDate;
    }
  }
});
