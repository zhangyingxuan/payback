import { parseGlobalQuotes, parseAsiaQuotes } from './globalQuotes';

describe('外围行情解析', () => {
  it('保留行情时间和涨跌幅，缺失行情不显示为零', () => {
    const fields = Array(33).fill('');
    fields[3] = '24537.6';
    fields[30] = '2026/11/09 10:56:31';
    fields[32] = '0.23';
    const result = parseGlobalQuotes(`v_hkHSI="${fields.join('~')}";`);
    expect(result[0]).toMatchObject({ price: 24537.6, change: 0.23, quoteTime: '2026/11/09 10:56:31' });
    expect(result[1]).toMatchObject({ price: null, change: null, quoteTime: null });
  });
  it('日韩指数保留点位、涨跌幅与交易所当地时间，异常值不显示为零', () => {
    const result = parseAsiaQuotes([
      { f12: 'KS11', f2: 4968.48, f3: -2.59, f124: 1794897000 },
      { f12: 'N225', f2: 58860.43, f3: 0, f124: 1794897000 },
    ]);
    expect(result).toEqual([
      { code: 'KS11', name: '韩国 KOSPI', price: 4968.48, change: -2.59, quoteTime: '2026/11/17 15:30:00' },
      { code: 'N225', name: '日经 225', price: 58860.43, change: 0, quoteTime: '2026/11/17 15:30:00' },
    ]);
    expect(parseAsiaQuotes([{ f12: 'KS11', f2: '-', f3: null, f124: 0 }])).toEqual([
      { code: 'KS11', name: '韩国 KOSPI', price: null, change: null, quoteTime: null },
      { code: 'N225', name: '日经 225', price: null, change: null, quoteTime: null },
    ]);
  });
});
