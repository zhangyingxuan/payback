import { createDataHealth, getExpectedTradeDate, jsonLength } from './dataHealthUtil';

describe('dataHealthUtil', () => {
  it('周末沿用最近交易日', () => {
    expect(getExpectedTradeDate('2026-08-28', new Date('2026-08-29T10:00:00+08:00'))).toBe('2026-08-28');
  });

  it('区分正常、过期、缺失和空数据', () => {
    expect(createDataHealth('短线', { tradeDate: '2026-08-26' }, '2026-08-26', 3).status).toBe('fresh');
    expect(createDataHealth('短线', { tradeDate: '2026-08-25' }, '2026-08-26', 3).status).toBe('stale');
    expect(createDataHealth('短线', null, '2026-08-26').status).toBe('missing');
    expect(createDataHealth('新股', { tradeDate: '2026-08-26' }, '2026-08-26', 0).status).toBe('empty');
  });

  it('安全处理空值和损坏的 JSON', () => {
    expect(jsonLength('[1,2]')).toBe(2);
    expect(jsonLength('{bad json')).toBe(0);
  });
});
