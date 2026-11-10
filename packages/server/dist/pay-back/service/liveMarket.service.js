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
        const date = dayjs().format(pay_back_core_1.iWencaiDateFormat);
        if (section === 'market') {
            const [snapshot, sectors] = await Promise.allSettled([
                (0, fetchUtil_1.fetchMarketSnapshotFromTencent)(),
                this.fetchLimitSectors(date),
            ]);
            if (snapshot.status === 'rejected')
                throw snapshot.reason;
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
        if (section === 'funds')
            return this.fetchFunds();
        if (section === 'shortTerm')
            return this.fetchShortTerm(date);
        const response = await (0, abortFetch_1.createFetch)(10000, 1)('https://qt.gtimg.cn/q=hkHSI,hkHSTECH,us.INX,us.IXIC', { headers: { referer: 'https://finance.qq.com/' } });
        if (!response.ok)
            throw new Error(`外围行情请求失败: HTTP ${response.status}`);
        const quotes = (0, globalQuotes_1.parseGlobalQuotes)(await response.text());
        if (!quotes.some(item => item.price !== null))
            throw new Error('外围行情数据为空');
        return quotes;
    }
    async fetchLimitSectors(date) {
        const blocks = await this.fetchBlocks(date);
        return blocks.filter(item => item.name && item.change != null && Number.isFinite(Number(item.change)))
            .map(item => ({ name: item.name, quoteChange: Number(item.change) }));
    }
    async fetchBlocks(date) {
        const result = await this.fetchThs('block_top', date);
        if (!Array.isArray(result))
            throw new Error('题材行情响应异常');
        return result;
    }
    async fetchThs(path, date, query = '') {
        const response = await (0, abortFetch_1.createFetch)(8000, 1)(`https://data.10jqka.com.cn/dataapi/limit_up/${path}?filter=HS,GEM2STAR&date=${date}${query}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
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
            this.fetchThs('limit_up_pool', date, '&page=1&limit=100'),
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
            var _a;
            const response = await (0, abortFetch_1.createFetch)(8000, 1)(`https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=5&po=${order}&np=1&fltt=2&invt=2&fid=f62&fs=m:90+t:2&fields=f12,f14,f62`);
            if (!response.ok)
                throw new Error(`资金行情请求失败: HTTP ${response.status}`);
            const result = await response.json();
            if (!Array.isArray((_a = result.data) === null || _a === void 0 ? void 0 : _a.diff))
                throw new Error('资金行情响应异常');
            return result.data.diff.filter(item => item.f14 && item.f62 != null && item.f62 !== '-' && Number.isFinite(Number(item.f62)))
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