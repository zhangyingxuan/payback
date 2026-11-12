import { transformNewStockData } from './transformDataUtil';

describe('transformNewStockData', () => {
  it.each([undefined, null, [], [{}], [{ '所属同花顺行业': '未知' }]])('没有有效新股时返回空列表：%j', stocks => {
    expect(transformNewStockData(stocks, '2026-11-12')).toEqual([]);
  });

  it('过滤缺少名称或代码的记录，保留真实新股及竞价数据', () => {
    const stocks = [
      null,
      {},
      { code: '001001' },
      { '股票简称': '无代码' },
      { code: '  ', '股票简称': '无效代码' },
      { code: '001002', '股票简称': '  ' },
      { code: '001003', '股票简称': '测试新股', '所属同花顺行业': '机械设备-专用设备', '竞价涨幅[20261112]': 25 },
    ];

    expect(transformNewStockData(stocks, '2026-11-12')).toEqual([
      expect.objectContaining({ code: '001003', name: '测试新股', plateLevel2: '专用设备', bidIncreaseT: 25 }),
    ]);
  });
});
