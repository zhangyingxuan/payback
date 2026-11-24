"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveMarketService = void 0;
const common_1 = require("@nestjs/common");
const dayjs = require("dayjs");
const pay_back_core_1 = require("pay-back-core");
const abortFetch_1 = require("../../utils/abortFetch");
const fetchUtil_1 = require("../core/fetchUtil");
const globalQuotes_1 = require("../utils/globalQuotes");
const liveShortTerm_1 = require("../utils/liveShortTerm");
let LiveMarketService = class LiveMarketService {
    constructor() {
        this.pending = new Map();
    }
    get(section) {
        const existing = this.pending.get(section);
        if (existing)
            return existing;
        const request = this.fetch(section).finally(() => this.pending.delete(section));
        this.pending.set(section, request);
        return request;
    }
    async fetch(section) {
        var _a, _b;
        const date = dayjs().format(pay_back_core_1.iWencaiDateFormat);
        if (section === 'market') {
            const [snapshot, sectors, breadth] = await Promise.allSettled([
                (0, fetchUtil_1.fetchMarketSnapshotFromTencent)(),
                this.fetchLimitSectors(date),
                this.fetchBreadth(),
            ]);
            if (snapshot.status === 'rejected')
                throw snapshot.reason;
            const indexes = snapshot.value.indexes;
            const plates = sectors.status === 'fulfilled' ? sectors.value : [];
            return {
                shangzhengPoint: indexes[0].f2,
                shangzhengRiseAndFall: indexes[0].f3,
                shenzhengPoint: indexes[1].f2,
                shenzhengRiseAndFall: (_a = indexes[1].f3) !== null && _a !== void 0 ? _a : null,
                chuangyePoint: indexes[3].f2,
                chuangyeRiseAndFall: (_b = indexes[3].f3) !== null && _b !== void 0 ? _b : null,
                marketTurnover: snapshot.value.turnover / 100000000,
                riseAmount: breadth.status === 'fulfilled' ? breadth.value.riseAmount : null,
                fallAmount: breadth.status === 'fulfilled' ? breadth.value.fallAmount : null,
                gainianRiseFloat: JSON.stringify(plates),
                gainianFallFloat: '[]',
                sectorUnavailable: sectors.status === 'rejected',
                createTime: new Date(),
            };
        }
        if (section === 'funds')
            return this.fetchFunds();
        if (section === 'shortTerm')
            return this.fetchShortTerm(date);
        if (section === 'turnover')
            return this.fetchTurnover();
        if (section === 'stocks')
            return this.fetchTopStocks();
        if (section === 'commodities')
            return this.fetchCommoditySectors();
        const [tencent, asia] = await Promise.allSettled([this.fetchTencentGlobal(), this.fetchAsiaGlobal()]);
        const quotes = [
            ...(tencent.status === 'fulfilled' ? tencent.value : (0, globalQuotes_1.parseGlobalQuotes)('')),
            ...(asia.status === 'fulfilled' ? asia.value : (0, globalQuotes_1.parseAsiaQuotes)([])),
        ];
        if (!quotes.some(item => item.price !== null))
            throw new Error('外围行情数据为空');
        return quotes;
    }
    async fetchTencentGlobal() {
        const response = await (0, abortFetch_1.createFetch)(10000, 1)('https://qt.gtimg.cn/q=hkHSI,hkHSTECH,us.INX,us.IXIC', { headers: { referer: 'https://finance.qq.com/' } });
        if (!response.ok)
            throw new Error(`外围行情请求失败: HTTP ${response.status}`);
        return (0, globalQuotes_1.parseGlobalQuotes)(await response.text());
    }
    async fetchAsiaGlobal() {
        const rows = await this.fetchEastmoney('ulist.np/get?fltt=2&secids=100.KS11,100.N225&fields=f2,f3,f12,f124');
        return (0, globalQuotes_1.parseAsiaQuotes)(rows);
    }
    async fetchLimitSectors(date) {
        const blocks = await this.fetchBlocks(date);
        return blocks.filter(item => item.name && item.change != null && Number.isFinite(Number(item.change)))
            .map(item => ({ name: item.name, quoteChange: Number(item.change),
            limitUpCount: Number.isInteger(item.limit_up_num) && item.limit_up_num >= 0 ? item.limit_up_num : null,
        }));
    }
    async fetchBreadth() {
        const rows = await this.fetchEastmoney('ulist.np/get?fltt=2&secids=1.000001,0.399001&fields=f12,f104,f105');
        const markets = ['000001', '399001'].map(code => rows.find(row => row.f12 === code));
        if (markets.some(row => !row || !Number.isInteger(row.f104) || row.f104 < 0 || !Number.isInteger(row.f105) || row.f105 < 0)) {
            throw new Error('沪深市场宽度数据不完整');
        }
        return {
            riseAmount: markets.reduce((total, row) => total + row.f104, 0),
            fallAmount: markets.reduce((total, row) => total + row.f105, 0),
        };
    }
    async fetchTurnover() {
        var _a, _b, _c;
        const response = await (0, abortFetch_1.createFetch)(8000, 1)('https://dq.10jqka.com.cn/fuyao/market_analysis_api/chart/v1/get_chart_data?chart_key=turnover_minute', { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.10jqka.com.cn/' } });
        if (!response.ok)
            throw new Error(`量能请求失败: HTTP ${response.status}`);
        const result = await response.json();
        const chart = (_a = result.data) === null || _a === void 0 ? void 0 : _a.charts;
        if (!chart || !Array.isArray(chart.header))
            throw new Error('量能行情响应异常');
        const point = [...(Array.isArray(chart.point_list) ? chart.point_list : [])].reverse()
            .find(point => [point === null || point === void 0 ? void 0 : point[1], point === null || point === void 0 ? void 0 : point[2]].every(value => typeof value === 'number' && Number.isFinite(value) && value > 0));
        const header = (key) => { var _a; return (_a = chart.header.find(item => item.key === key)) === null || _a === void 0 ? void 0 : _a.val; };
        const current = (_b = point === null || point === void 0 ? void 0 : point[1]) !== null && _b !== void 0 ? _b : header('turnover');
        const change = header('turnover_change');
        const previous = (_c = point === null || point === void 0 ? void 0 : point[2]) !== null && _c !== void 0 ? _c : (typeof current === 'number' && typeof change === 'number' ? current - change : undefined);
        if (![current, previous].every(value => typeof value === 'number' && Number.isFinite(value)) || current < 0 || previous <= 0)
            throw new Error('量能对比数据缺失');
        return { current: current / 1e8, previous: previous / 1e8, change: (current - previous) / 1e8, changePercent: (current / previous - 1) * 100, createTime: new Date() };
    }
    async fetchEastmoney(path, allowEmpty = false) {
        const request = (0, abortFetch_1.createFetch)(8000, 1);
        const fetchRows = async (host) => {
            var _a;
            const response = await request(`https://${host}/api/qt/${path}`);
            if (!response.ok)
                throw new Error(`东方财富请求失败: HTTP ${response.status}`);
            const rows = (_a = (await response.json()).data) === null || _a === void 0 ? void 0 : _a.diff;
            if (!Array.isArray(rows) || (!allowEmpty && !rows.length))
                throw new Error('东方财富行情数据缺失');
            return rows;
        };
        return fetchRows('push2.eastmoney.com').catch(() => fetchRows('push2test.eastmoney.com'));
    }
    async fetchTopStocks() {
        const rows = await this.fetchEastmoney('clist/get?pn=1&pz=10&po=1&np=1&fltt=2&invt=2&fid=f6&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14,f3,f6,f100');
        return rows.filter(item => item.f12 && item.f14 && typeof item.f6 === 'number' && Number.isFinite(item.f6))
            .map(item => ({ code: item.f12, name: item.f14, change: typeof item.f3 === 'number' ? item.f3 : null, turnover: item.f6 / 1e8, industry: typeof item.f100 === 'string' && item.f100 !== '-' ? item.f100 : null }));
    }
    async fetchCommoditySectors() {
        const rows = await this.fetchEastmoney('ulist.np/get?secids=90.BK0732,90.BK0464&fltt=2&invt=2&fields=f12,f14,f3');
        return [{ code: 'BK0732', name: '黄金' }, { code: 'BK0464', name: '原油（石油行业）' }].map(sector => {
            const row = rows.find(item => item.f12 === sector.code);
            return Object.assign(Object.assign({}, sector), { change: typeof (row === null || row === void 0 ? void 0 : row.f3) === 'number' && Number.isFinite(row.f3) ? row.f3 : null });
        });
    }
    async fetchBlocks(date) {
        const result = await this.fetchThs('block_top', date);
        if (!Array.isArray(result))
            throw new Error('题材行情响应异常');
        return result;
    }
    async fetchThs(path, date, query = '') {
        const fields = path === 'limit_up_pool' ? '&field=turnover_rate,order_amount' : '';
        const response = await (0, abortFetch_1.createFetch)(8000, 1)(`https://data.10jqka.com.cn/dataapi/limit_up/${path}?filter=HS,GEM2STAR&date=${date}${query}${fields}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok)
            throw new Error(`同花顺行情请求失败: HTTP ${response.status}`);
        const result = await response.json();
        if (result.status_code !== 0 || !result.data)
            throw new Error('同花顺行情响应异常');
        return result.data;
    }
    async fetchShortTerm(date) {
        var _a, _b, _c;
        const [first, boards, blocks] = await Promise.all([
            this.fetchThs('limit_up_pool', date, '&page=1&limit=200'),
            this.fetchThs('continuous_limit_up', date),
            this.fetchBlocks(date).catch(() => []),
        ]);
        if (!Array.isArray(first.info) || !Number.isInteger((_a = first.page) === null || _a === void 0 ? void 0 : _a.total) || !Array.isArray(boards)) {
            throw new Error('涨停池响应异常');
        }
        const stocks = [...first.info];
        const pageSize = Number(first.page.limit);
        if (first.page.total > stocks.length && (!Number.isInteger(pageSize) || pageSize <= 0))
            throw new Error('涨停池分页异常');
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
        return (0, liveShortTerm_1.buildLiveShortTerm)(stocks, boards, blocks, {
            limitUp: (_b = first.limit_up_count) === null || _b === void 0 ? void 0 : _b.today,
            limitDown: (_c = first.limit_down_count) === null || _c === void 0 ? void 0 : _c.today,
        });
    }
    async fetchFunds() {
        const getRank = async (order) => {
            const rows = await this.fetchEastmoney(`clist/get?pn=1&pz=5&po=${order}&np=1&fltt=2&invt=2&fid=f62&fs=m:90+t:2&fields=f12,f14,f62`, true);
            return rows.filter(item => item.f14 && item.f62 != null && item.f62 !== '-' && Number.isFinite(Number(item.f62)))
                .map(item => ({ name: item.f14, code: item.f12, funds: Number(item.f62) / 100000000 }));
        };
        const [inflow, outflow] = await Promise.all([getRank(1), getRank(0)]);
        return { hangyeFundsTop: JSON.stringify({ in: inflow.filter(item => item.funds > 0), out: outflow.filter(item => item.funds < 0) }), createTime: new Date() };
    }
};
LiveMarketService = __decorate([
    (0, common_1.Injectable)()
], LiveMarketService);
exports.LiveMarketService = LiveMarketService;
//# sourceMappingURL=liveMarket.service.js.map