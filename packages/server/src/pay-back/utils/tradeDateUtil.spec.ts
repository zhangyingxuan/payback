import { toIwencaiDate, toTradeDate } from './tradeDateUtil';

describe('tradeDateUtil', () => {
  it('统一输出交易日格式', () => {
    expect(toTradeDate('2026/08/26')).toBe('2026-08-26');
    expect(toIwencaiDate('2026-08-26')).toBe('20260826');
  });
});
