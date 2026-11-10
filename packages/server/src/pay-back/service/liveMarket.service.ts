import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { iWencaiDateFormat } from 'pay-back-core';
import { createFetch } from '@/utils/abortFetch';
import { fetchMarketSnapshotFromTencent } from '../core/fetchUtil';
import { parseGlobalQuotes } from '../utils/globalQuotes';
import { buildLiveShortTerm } from '../utils/liveShortTerm';

export type LiveSection = 'market' | 'funds' | 'shortTerm' | 'global';

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
      const [snapshot, sectors] = await Promise.allSettled([
        fetchMarketSnapshotFromTencent(),
        this.fetchLimitSectors(date),
      ]);
      if (snapshot.status === 'rejected') throw snapshot.reason;
      const indexes = snapshot.value.indexes;
      const plates = sectors.status === 'fulfilled' ? sectors.value : [];
      return {
        shangzhengPoint: indexes[0].f2,
        shangzhengRiseAndFall: indexes[0].f3,
        shenzhengPoint: indexes[1].f2,
        chuangyePoint: indexes[3].f2,
        marketTurnover: snapshot.value.turnover / 100000000,
        gainianRiseFloat: JSON.stringify(plates),
        gainianFallFloat: '[]',
        sectorUnavailable: sectors.status === 'rejected',
        createTime: new Date(),
      };
    }
    if (section === 'funds') return this.fetchFunds();
    if (section === 'shortTerm') return this.fetchShortTerm(date);
    const response = await createFetch(10000, 1)(
      'https://qt.gtimg.cn/q=hkHSI,hkHSTECH,us.INX,us.IXIC',
      { headers: { referer: 'https://finance.qq.com/' } },
    );
    if (!response.ok) throw new Error(`外围行情请求失败: HTTP ${response.status}`);
    const quotes = parseGlobalQuotes(await response.text());
    if (!quotes.some(item => item.price !== null)) throw new Error('外围行情数据为空');
    return quotes;
  }

  private async fetchLimitSectors(date: string) {
    const blocks = await this.fetchBlocks(date);
    return blocks.filter(item => item.name && item.change != null && Number.isFinite(Number(item.change)))
      .map(item => ({ name: item.name, quoteChange: Number(item.change) }));
  }

  private async fetchBlocks(date: string) {
    const result = await this.fetchThs('block_top', date);
    if (!Array.isArray(result)) throw new Error('题材行情响应异常');
    return result;
  }

  private async fetchThs(path: string, date: string, query = '') {
    const response = await createFetch(8000, 1)(
      `https://data.10jqka.com.cn/dataapi/limit_up/${path}?filter=HS,GEM2STAR&date=${date}${query}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    );
    if (!response.ok) throw new Error(`同花顺行情请求失败: HTTP ${response.status}`);
    const result = await response.json();
    if (result.status_code !== 0 || !result.data) throw new Error('同花顺行情响应异常');
    return result.data;
  }

  private async fetchShortTerm(date: string) {
    const [first, boards, blocks] = await Promise.all([
      this.fetchThs('limit_up_pool', date, '&page=1&limit=100'),
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
      const response = await createFetch(8000, 1)(
        `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=5&po=${order}&np=1&fltt=2&invt=2&fid=f62&fs=m:90+t:2&fields=f12,f14,f62`,
      );
      if (!response.ok) throw new Error(`资金行情请求失败: HTTP ${response.status}`);
      const result = await response.json();
      if (!Array.isArray(result.data?.diff)) throw new Error('资金行情响应异常');
      return result.data.diff.filter(item => item.f14 && item.f62 != null && item.f62 !== '-' && Number.isFinite(Number(item.f62)))
        .map(item => ({ name: item.f14, code: item.f12, funds: Number(item.f62) / 100000000 }));
    };
    const [inflow, outflow] = await Promise.all([getRank(1), getRank(0)]);
    return { hangyeFundsTop: JSON.stringify({ in: inflow.filter(item => item.funds > 0), out: outflow.filter(item => item.funds < 0) }), createTime: new Date() };
  }
}
