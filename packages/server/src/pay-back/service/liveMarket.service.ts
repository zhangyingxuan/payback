import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { iWencaiDateFormat } from 'pay-back-core';
import { createFetch } from '@/utils/abortFetch';
import { fetchMarketSnapshotFromTencent } from '../core/fetchUtil';
import { parseGlobalQuotes, parseAsiaQuotes } from '../utils/globalQuotes';
import { buildLiveShortTerm } from '../utils/liveShortTerm';

export type LiveSection = 'market' | 'funds' | 'shortTerm' | 'global' | 'turnover' | 'stocks' | 'commodities';

@Injectable()
export class LiveMarketService {
  private pending = new Map<LiveSection, Promise<unknown>>();

  // 合并并发请求，避免多个看板同时放大对上游接口的压力。
  get(section: LiveSection) {
    const existing = this.pending.get(section);
    if (existing) return existing;
    const request = this.fetch(section).finally(() => this.pending.delete(section));
    this.pending.set(section, request);
    return request;
  }

  private async fetch(section: LiveSection) {
    const date = dayjs().format(iWencaiDateFormat);
    if (section === 'market') {
      // 指数与题材独立取数，上游题材接口失败时仍可返回指数。
      const [snapshot, sectors, breadth] = await Promise.allSettled([
        fetchMarketSnapshotFromTencent(),
        this.fetchLimitSectors(date),
        this.fetchBreadth(),
      ]);
      if (snapshot.status === 'rejected') throw snapshot.reason;
      const indexes = snapshot.value.indexes;
      const plates = sectors.status === 'fulfilled' ? sectors.value : [];
      return {
        shangzhengPoint: indexes[0].f2,
        shangzhengRiseAndFall: indexes[0].f3,
        shenzhengPoint: indexes[1].f2,
        shenzhengRiseAndFall: indexes[1].f3 ?? null,
        chuangyePoint: indexes[3].f2,
        chuangyeRiseAndFall: indexes[3].f3 ?? null,
        marketTurnover: snapshot.value.turnover / 100000000,
        riseAmount: breadth.status === 'fulfilled' ? breadth.value.riseAmount : null,
        fallAmount: breadth.status === 'fulfilled' ? breadth.value.fallAmount : null,
        gainianRiseFloat: JSON.stringify(plates),
        gainianFallFloat: '[]',
        sectorUnavailable: sectors.status === 'rejected',
        createTime: new Date(),
      };
    }
    if (section === 'funds') return this.fetchFunds();
    if (section === 'shortTerm') return this.fetchShortTerm(date);
    if (section === 'turnover') return this.fetchTurnover();
    if (section === 'stocks') return this.fetchTopStocks();
    if (section === 'commodities') return this.fetchCommoditySectors();
    // 两个行情来源独立降级，保留可用市场；失败来源仍返回固定席位和空值。
    const [tencent, asia] = await Promise.allSettled([this.fetchTencentGlobal(), this.fetchAsiaGlobal()]);
    const quotes = [
      ...(tencent.status === 'fulfilled' ? tencent.value : parseGlobalQuotes('')),
      ...(asia.status === 'fulfilled' ? asia.value : parseAsiaQuotes([])),
    ];
    if (!quotes.some(item => item.price !== null)) throw new Error('外围行情数据为空');
    return quotes;
  }

  private async fetchTencentGlobal() {
    const response = await createFetch(10000, 1)(
      'https://qt.gtimg.cn/q=hkHSI,hkHSTECH,us.INX,us.IXIC',
      { headers: { referer: 'https://finance.qq.com/' } },
    );
    if (!response.ok) throw new Error(`外围行情请求失败: HTTP ${response.status}`);
    return parseGlobalQuotes(await response.text());
  }

  private async fetchAsiaGlobal() {
    const rows = await this.fetchEastmoney(
      'ulist.np/get?fltt=2&secids=100.KS11,100.N225&fields=f2,f3,f12,f124',
    );
    return parseAsiaQuotes(rows);
  }

  private async fetchLimitSectors(date: string) {
    const blocks = await this.fetchBlocks(date);
    return blocks.filter(item => item.name && item.change != null && Number.isFinite(Number(item.change)))
      // 使用上游题材统计家数，不能用可能不完整的个股样本长度替代。
      .map(item => ({ name: item.name, quoteChange: Number(item.change),
        limitUpCount: Number.isInteger(item.limit_up_num) && item.limit_up_num >= 0 ? item.limit_up_num : null,
      }));
  }

  // 沪深指数分别提供所在市场的涨跌家数，不能将单一市场或创业板重复计入合计。
  private async fetchBreadth() {
    const rows: { f12: string; f104: number; f105: number }[] = await this.fetchEastmoney(
      'ulist.np/get?fltt=2&secids=1.000001,0.399001&fields=f12,f104,f105',
    );
    // 任一市场缺失都不能输出部分合计，缺失值也不能转换为零家数。
    const markets = ['000001', '399001'].map(code => rows.find(row => row.f12 === code));
    if (markets.some(row => !row || !Number.isInteger(row.f104) || row.f104 < 0 || !Number.isInteger(row.f105) || row.f105 < 0)) {
      throw new Error('沪深市场宽度数据不完整');
    }
    return {
      riseAmount: markets.reduce((total, row) => total + row.f104, 0),
      fallAmount: markets.reduce((total, row) => total + row.f105, 0),
    };
  }

  // 同源比较昨日同时刻，避免把盘中累计额与昨日全天成交额混比。
  private async fetchTurnover() {
    const response = await createFetch(8000, 1)(
      'https://dq.10jqka.com.cn/fuyao/market_analysis_api/chart/v1/get_chart_data?chart_key=turnover_minute',
      { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.10jqka.com.cn/' } },
    );
    if (!response.ok) throw new Error(`量能请求失败: HTTP ${response.status}`);
    const result = await response.json();
    const chart = result.data?.charts;
    if (!chart || !Array.isArray(chart.header)) throw new Error('量能行情响应异常');
    // turnover_pre 表头实际可能是昨日全天额，优先取同一个分时点的两列。
    const point = [...(Array.isArray(chart.point_list) ? chart.point_list : [])].reverse()
      .find(point => [point?.[1], point?.[2]].every(value => typeof value === 'number' && Number.isFinite(value) && value > 0));
    const header = (key: string) => chart.header.find(item => item.key === key)?.val;
    const current = point?.[1] ?? header('turnover');
    const change = header('turnover_change');
    const previous = point?.[2] ?? (typeof current === 'number' && typeof change === 'number' ? current - change : undefined);
    if (![current, previous].every(value => typeof value === 'number' && Number.isFinite(value)) || current < 0 || previous <= 0) throw new Error('量能对比数据缺失');
    return { current: current / 1e8, previous: previous / 1e8, change: (current - previous) / 1e8, changePercent: (current / previous - 1) * 100, createTime: new Date() };
  }

  private async fetchEastmoney(path: string, allowEmpty = false) {
    const request = createFetch(8000, 1);
    const fetchRows = async (host: string) => {
      const response = await request(`https://${host}/api/qt/${path}`);
      if (!response.ok) throw new Error(`东方财富请求失败: HTTP ${response.status}`);
      const rows = (await response.json()).data?.diff;
      if (!Array.isArray(rows) || (!allowEmpty && !rows.length)) throw new Error('东方财富行情数据缺失');
      return rows;
    };

    // 主站断连或响应异常时复用原查询，保留同一行情源的统计口径。
    return fetchRows('push2.eastmoney.com').catch(() => fetchRows('push2test.eastmoney.com'));
  }

  // 按成交额取沪深 A 股前十，行业直接使用同一条行情，避免逐股请求。
  private async fetchTopStocks() {
    const rows = await this.fetchEastmoney('clist/get?pn=1&pz=10&po=1&np=1&fltt=2&invt=2&fid=f6&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f6,f100');
    return rows.filter(item => item.f12 && item.f14 && typeof item.f6 === 'number' && Number.isFinite(item.f6))
      .map(item => ({ code: item.f12, name: item.f14, change: typeof item.f3 === 'number' ? item.f3 : null, turnover: item.f6 / 1e8, industry: typeof item.f100 === 'string' && item.f100 !== '-' ? item.f100 : null }));
  }

  // 固定取黄金与石油行业板块，不依赖是否进入当天涨停题材样本。
  private async fetchCommoditySectors() {
    const rows = await this.fetchEastmoney('ulist.np/get?secids=90.BK0732,90.BK0464&fltt=2&invt=2&fields=f12,f14,f3');
    return [{ code: 'BK0732', name: '黄金' }, { code: 'BK0464', name: '原油（石油行业）' }].map(sector => {
      const row = rows.find(item => item.f12 === sector.code);
      return { ...sector, change: typeof row?.f3 === 'number' && Number.isFinite(row.f3) ? row.f3 : null };
    });
  }

  private async fetchBlocks(date: string) {
    const result = await this.fetchThs('block_top', date);
    if (!Array.isArray(result)) throw new Error('题材行情响应异常');
    return result;
  }

  private async fetchThs(path: string, date: string, query = '') {
    // 涨停池默认不返回换手与封单；统一指定字段，确保后续分页也包含相同指标。
    const fields = path === 'limit_up_pool' ? '&field=turnover_rate,order_amount' : '';
    const response = await createFetch(8000, 1)(
      `https://data.10jqka.com.cn/dataapi/limit_up/${path}?filter=HS,GEM2STAR&date=${date}${query}${fields}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    );
    if (!response.ok) throw new Error(`同花顺行情请求失败: HTTP ${response.status}`);
    const result = await response.json();
    if (result.status_code !== 0 || !result.data) throw new Error('同花顺行情响应异常');
    return result.data;
  }

  private async fetchShortTerm(date: string) {
    const [first, boards, blocks] = await Promise.all([
      // 上游可能对不同页返回不同批次的数据，优先在一页内取齐涨停池。
      this.fetchThs('limit_up_pool', date, '&page=1&limit=200'),
      this.fetchThs('continuous_limit_up', date),
      this.fetchBlocks(date).catch(() => []),
    ]);
    if (!Array.isArray(first.info) || !Number.isInteger(first.page?.total) || !Array.isArray(boards)) {
      throw new Error('涨停池响应异常');
    }
    const stocks = [...first.info];
    const pageSize = Number(first.page.limit);
    if (first.page.total > stocks.length && (!Number.isInteger(pageSize) || pageSize <= 0)) throw new Error('涨停池分页异常');
    // 按接口返回的页数取齐数据，防止将第一页误当作全市场数量。
    for (let page = 2; stocks.length < first.page.total; page++) {
      const next = await this.fetchThs('limit_up_pool', date, `&page=${page}&limit=${pageSize}`);
      if (!Array.isArray(next.info) || !next.info.length || page > Math.ceil(first.page.total / pageSize)) {
        throw new Error('涨停池分页数据不完整');
      }
      stocks.push(...next.info);
    }
    if (stocks.length !== first.page.total || new Set(stocks.map(stock => stock.code)).size !== stocks.length) {
      throw new Error('涨停池数据不完整');
    }
    return buildLiveShortTerm(stocks, boards, blocks, {
      limitUp: first.limit_up_count?.today,
      limitDown: first.limit_down_count?.today,
    });
  }

  private async fetchFunds() {
    // 东方财富的板块分类与原问财二级行业口径不同，前端需注明来源。
    const getRank = async (order: number) => {
      const rows = await this.fetchEastmoney(
        `clist/get?pn=1&pz=5&po=${order}&np=1&fltt=2&invt=2&fid=f62&fs=m:90+t:2&fields=f12,f14,f62`,
        true,
      );
      return rows.filter(item => item.f14 && item.f62 != null && item.f62 !== '-' && Number.isFinite(Number(item.f62)))
        .map(item => ({ name: item.f14, code: item.f12, funds: Number(item.f62) / 100000000 }));
    };
    const [inflow, outflow] = await Promise.all([getRank(1), getRank(0)]);
    return { hangyeFundsTop: JSON.stringify({ in: inflow.filter(item => item.funds > 0), out: outflow.filter(item => item.funds < 0) }), createTime: new Date() };
  }
}
