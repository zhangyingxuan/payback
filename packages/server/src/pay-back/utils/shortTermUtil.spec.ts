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
