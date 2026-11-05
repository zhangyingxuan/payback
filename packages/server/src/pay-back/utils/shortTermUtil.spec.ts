jest.mock('@/utils/abortFetch', () => ({ createFetch: jest.fn() }), { virtual: true });

const { mergeExtra2ShortTermData } = require('./shortTermUtil');

describe('mergeExtra2ShortTermData', () => {
  it('按日期合并新股，并保留列表最后一天的数据', () => {
    const shortTermData = [
      { createTime: '2026-08-26', evenBoardData: '{}' },
      { createTime: '2026-08-25', evenBoardData: '{}' },
    ];
    const specialStocks = [
      { createTime: '2026-08-25', newStock: '["旧"]' },
      { createTime: '2026-08-26', newStock: '["新"]' },
    ];

    const result = mergeExtra2ShortTermData(shortTermData, specialStocks);

    expect(result[0].newStock).toBe('["新"]');
    expect(result[1].newStock).toBe('["旧"]');
  });

  it('优先按 tradeDate 合并数据', () => {
    const result = mergeExtra2ShortTermData(
      [{ createTime: '2026-08-26', evenBoardData: '{}' }],
      [{ tradeDate: '2026-08-26', createTime: '2026-08-25', newStock: '["新"]' }],
    );

    expect(result[0].newStock).toBe('["新"]');
  });
});

describe('题材聚合请求', () => {
  it('携带浏览器标识访问同花顺接口', async () => {
    const { createFetch } = require('@/utils/abortFetch');
    const fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    createFetch.mockReturnValue(fetch);
    const fetchAllStocksByIwencai = jest.spyOn(require('../core/fetchUtil'), 'fetchAllStocksByIwencai')
      .mockRejectedValue(new Error('停止后续处理'));

    await expect(require('./shortTermUtil').getShortTermData('2026-11-04', null)).rejects.toThrow('停止后续处理');
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ 'User-Agent': expect.stringContaining('Mozilla/5.0') }),
    }));
    fetchAllStocksByIwencai.mockRestore();
  });
});
