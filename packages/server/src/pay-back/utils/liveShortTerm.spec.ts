import { buildLiveShortTerm } from './liveShortTerm';

describe('实时短线行情转换', () => {
  it('以涨停池计算数量，合并连板高度和题材样本', () => {
    const result = buildLiveShortTerm(
      [{ code: 'a', name: '甲', is_again_limit: 1 }, { code: 'b', name: '乙' }],
      [{ height: 3, code_list: [{ code: 'a' }] }],
      [{ name: '机器人', stock_list: [{ code: 'a', first_limit_up_time: '1794188633' }] }],
      { limitUp: { rate: 0.75 }, limitDown: { num: 1 } },
    );
    const boards = JSON.parse(result.evenBoardData);
    expect(result).toMatchObject({ dailyLimitQuantity: 2, dailyLimitReturnSealQuantity: 1, evenBoardAmount: 1, marketHeight: 3, sealingRate: 75, downLimitQuantity: 1 });
    expect(boards['3'][0]).toMatchObject({ code: 'a', plateLevel2: '机器人', dailyTime: '09:43:53' });
    expect(boards['1'][0].code).toBe('b');
  });
  it('空涨停池不虚构市场高度', () => {
    expect(buildLiveShortTerm([], [], [])).toMatchObject({ marketHeight: null, sealingRate: null, downLimitQuantity: null });
  });
  it('保留换手率并将封单元转换为亿元，缺失与异常值不伪装成零', () => {
    const stocks = [
      { code: 'a', name: '甲', turnover_rate: 3.8896, order_amount: 301074020 },
      { code: 'b', name: '乙', turnover_rate: 0, order_amount: 0 },
      { code: 'c', name: '丙' },
      { code: 'd', name: '丁', turnover_rate: '', order_amount: 'invalid' },
      { code: 'e', name: '戊', turnover_rate: '12.34', order_amount: '50000000' },
      { code: 'f', name: '己', turnover_rate: -1, order_amount: -10 },
    ];
    const items = JSON.parse(buildLiveShortTerm(stocks, [], []).evenBoardData)['1'];
    expect(items.map(({ turnoverRate, closingFunds }) => [turnoverRate, closingFunds])).toEqual([
      [3.8896, 3.0107402], [0, 0], [null, null], [null, null], [12.34, 0.5], [null, null],
    ]);
  });
});
