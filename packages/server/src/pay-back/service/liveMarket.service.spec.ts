jest.mock('@/utils/abortFetch', () => ({ createFetch: jest.fn() }), { virtual: true });
jest.mock('../core/fetchUtil', () => ({ fetchMarketSnapshotFromTencent: jest.fn() }));
jest.mock('../utils/fundsUtil', () => ({ __esModule: true, default: { getFundsData: jest.fn() } }));
jest.mock('../utils/shortTermUtil', () => ({ getShortTermData: jest.fn() }));

import { LiveMarketService } from './liveMarket.service';
import { fetchMarketSnapshotFromTencent } from '../core/fetchUtil';
import { createFetch } from '@/utils/abortFetch';

describe('实时市场行情', () => {
  it.each([true, false])('外围来源独立降级，日韩与原有市场保留固定席位', async (asiaAvailable) => {
    (createFetch as jest.Mock).mockReturnValue(jest.fn(async (url: string) => {
      if (url.includes('eastmoney')) {
        if (!asiaAvailable) throw new Error('日韩不可用');
        return { ok: true, json: async () => ({ data: { diff: [{ f12: 'KS11', f2: 4968.48, f3: -2.59, f124: 1794897000 }] } }) };
      }
      if (asiaAvailable) throw new Error('腾讯不可用');
      const fields = Array(33).fill('');
      fields[3] = '25000';
      return { ok: true, text: async () => 'v_hkHSI="' + fields.join('~') + '";' };
    }));
    const result = await new LiveMarketService().get('global') as { code: string; price: number | null }[];
    expect(result).toHaveLength(6);
    expect(result.find(item => item.code === 'KS11').price).toBe(asiaAvailable ? 4968.48 : null);
    expect(result.find(item => item.code === 'hkHSI').price).toBe(asiaAvailable ? null : 25000);
  });
  const mockData = (data: unknown) => (createFetch as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data }) }));

  it.each([[120e8, 100e8, 20, 20], [80e8, 100e8, -20, -20], [100e8, 100e8, 0, 0]])('量能使用同一分时点，忽略昨日全天表头', async (current, previous, change, percentage) => {
    mockData({ charts: { header: [{ key: 'turnover_pre', val: 200e8 }], point_list: [[1, current, previous], [2, null, 200e8]] } });
    const result = await new LiveMarketService().get('turnover');
    expect(result).toMatchObject({ current: current / 1e8, previous: previous / 1e8, change });
    expect((result as { changePercent: number }).changePercent).toBeCloseTo(percentage);
  });

  it('分时缺失时通过当前额与同期差额回退', async () => {
    mockData({ charts: { header: [{ key: 'turnover', val: 120e8 }, { key: 'turnover_change', val: 20e8 }] } });
    expect(await new LiveMarketService().get('turnover')).toMatchObject({ current: 120, previous: 100, change: 20 });
  });

  it('同期基数缺失时不展示虚假量能', async () => {
    mockData({ charts: { header: [], point_list: [[1, 100, 0]] } });
    await expect(new LiveMarketService().get('turnover')).rejects.toThrow('量能对比数据缺失');
  });

  it('成交额转换为亿并携带行业，过滤缺失金额', async () => {
    mockData({ diff: [{ f12: '600000', f14: '示例', f6: 12e8, f3: 2, f100: '银行' }, { f12: '600001', f14: '缺失', f6: '-' }] });
    expect(await new LiveMarketService().get('stocks')).toEqual([{ code: '600000', name: '示例', turnover: 12, change: 2, industry: '银行' }]);
  });

  it('固定保留黄金和石油席位，缺失涨跌返回空值', async () => {
    mockData({ diff: [{ f12: 'BK0732', f3: 1.2 }] });
    expect(await new LiveMarketService().get('commodities')).toEqual([{ code: 'BK0732', name: '黄金', change: 1.2 }, { code: 'BK0464', name: '原油（石油行业）', change: null }]);
  });
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

  it.each([[1.23, -2.34], [0, 0], [undefined, undefined]])('返回深证与创业板涨跌幅，缺失时不伪造零值', async (shenzheng, chuangye) => {
    (fetchMarketSnapshotFromTencent as jest.Mock).mockResolvedValue({
      indexes: [{ f2: 3000, f3: 1 }, { f2: 10000, f3: shenzheng }, { f2: 900 }, { f2: 2000, f3: chuangye }],
      turnover: 1200000000000,
    });
    (createFetch as jest.Mock).mockReturnValue(jest.fn().mockRejectedValue(new Error('上游不可用')));
    expect(await new LiveMarketService().get('market')).toMatchObject({
      shenzhengRiseAndFall: shenzheng ?? null, chuangyeRiseAndFall: chuangye ?? null,
    });
  });

  it('返回涨停题材的名称、涨跌幅及有效涨停家数', async () => {
    (createFetch as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue({
      ok: true, json: async () => ({ status_code: 0, data: [{ name: '题材', change: 2.5, limit_up_num: 16 }, { name: '缺失', change: 1 }, { name: '零', change: 0, limit_up_num: 0 }] }),
    }));
    const result = await new LiveMarketService().get('market');
    expect(JSON.parse((result as { gainianRiseFloat: string }).gainianRiseFloat)).toEqual([
      { name: '题材', quoteChange: 2.5, limitUpCount: 16 }, { name: '缺失', quoteChange: 1, limitUpCount: null }, { name: '零', quoteChange: 0, limitUpCount: 0 },
    ]);
  });
  it('市场宽度汇总沪深两市，并保留有效的零家数', async () => {
    (createFetch as jest.Mock).mockReturnValue(jest.fn(async (url: string) => ({
      ok: true, json: async () => url.includes('ulist.np')
        ? { data: { diff: [{ f12: '399001', f104: 1894, f105: 900 }, { f12: '000001', f104: 1363, f105: 0 }] } }
        : { status_code: 0, data: [] },
    })));
    expect(await new LiveMarketService().get('market')).toMatchObject({ riseAmount: 3257, fallAmount: 900 });
  });
  it.each([
    [{ f12: '000001', f104: 10, f105: 20 }],
    [{ f12: '000001', f104: 10, f105: 20 }, { f12: '399001', f104: '-', f105: 30 }],
  ])('宽度数据不完整时不展示部分市场合计，仍保留指数', async (...rows) => {
    (createFetch as jest.Mock).mockReturnValue(jest.fn(async (url: string) => ({
      ok: true, json: async () => url.includes('ulist.np') ? { data: { diff: rows } } : { status_code: 0, data: [] },
    })));
    expect(await new LiveMarketService().get('market')).toMatchObject({ shangzhengPoint: 3000, riseAmount: null, fallAmount: null });
  });
});
