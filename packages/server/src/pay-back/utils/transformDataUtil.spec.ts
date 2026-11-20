import { transformMorningAuctionLimitUpData, transformNewStockData } from './transformDataUtil';
import { getStocksDataByIwencai } from './commonUtil';

describe('早盘问财响应', () => {
  const response = (content: unknown) => ({ data: { answer: [{ txt: [{ content }] }] } });

  it('接受明确的零结果，拒绝无法识别的响应', () => {
    expect(getStocksDataByIwencai(response('没有找到符合条件的结果！'), true).data).toEqual([]);
    expect(() => getStocksDataByIwencai(response('数据暂不可用'), true)).toThrow();
  });
});

describe('transformMorningAuctionLimitUpData', () => {
  it('以当日竞价未匹配买量排序，金额使用竞价字段的元值', () => {
    const stocks = [
      { code: '002420', '股票简称': '测试股一', '竞价未匹配量[20261120]': '-1303500', '竞价未匹配金额[20261120]': '-9202710.0' },
      { code: '000002', '股票简称': '测试股二', '竞价未匹配量[20261120]': 100, '竞价未匹配金额[20261120]': 1000 },
      { '股票代码': '603324.SH', '股票简称': '盛剑科技', '竞价未匹配量[20261120]': '7480180',
        '竞价未匹配金额[20261120]': '2.072757878E8', '涨停封单额[20261120]': '9.878238144E7' },
      { code: '000003', '股票简称': '测试股三', '竞价未匹配金额[20261119]': 5000 },
    ];

    expect(transformMorningAuctionLimitUpData(stocks, '2026-11-20')).toEqual([
      expect.objectContaining({ code: '603324.SH', sealQuantity: 7480180, sealAmount: 207275787.8 }),
      expect.objectContaining({ code: '000002', sealQuantity: 100, sealAmount: 1000 }),
      expect.objectContaining({ code: '002420', sealQuantity: 0, sealAmount: 0 }),
      expect.objectContaining({ code: '000003', sealAmount: null }),
    ]);
  });
});

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
