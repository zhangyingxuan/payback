jest.mock('@/utils/abortFetch', () => ({ createFetch: jest.fn() }), { virtual: true });
jest.mock('../core/fetchUtil', () => ({ fetchMarketSnapshotFromTencent: jest.fn() }));
jest.mock('../utils/fundsUtil', () => ({ __esModule: true, default: { getFundsData: jest.fn() } }));
jest.mock('../utils/shortTermUtil', () => ({ getShortTermData: jest.fn() }));

import { LiveMarketService } from './liveMarket.service';
import { fetchMarketSnapshotFromTencent } from '../core/fetchUtil';
import { createFetch } from '@/utils/abortFetch';

describe('实时市场行情', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchMarketSnapshotFromTencent as jest.Mock).mockResolvedValue({
      indexes: [{ f2: 3000, f3: 1 }, { f2: 10000 }, { f2: 900 }, { f2: 2000 }],
      turnover: 1200000000000,
    });
  });

  it('上游题材出错时仍返回指数，并标记数据缺失', async () => {
    (createFetch as jest.Mock).mockReturnValue(jest.fn().mockRejectedValue(new Error('上游不可用')));
    const result = await new LiveMarketService().get('market');
    expect(result).toMatchObject({ shangzhengPoint: 3000, marketTurnover: 12000, sectorUnavailable: true, gainianRiseFloat: '[]' });
  });

  it('返回涨停题材的名称和涨跌幅', async () => {
    (createFetch as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue({
      ok: true, json: async () => ({ status_code: 0, data: [{ name: '题材', change: 2.5 }] }),
    }));
    const result = await new LiveMarketService().get('market');
    expect(result).toMatchObject({ sectorUnavailable: false, gainianRiseFloat: '[{"name":"题材","quoteChange":2.5}]' });
  });
});
