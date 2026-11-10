import { parseGlobalQuotes } from './globalQuotes';

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
});
