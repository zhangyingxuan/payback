<template>
  <main class="terminal">
    <header class="masthead">
      <div class="identity"><div class="logo">P<span>.</span></div><div><div class="eyebrow">PAYBACK / MARKET INTELLIGENCE</div><h1>盘面观察 <small>MARKET OVERVIEW</small></h1></div></div>
      <div class="actions"><span class="live"><i></i>行情源直连 · 60秒轮询</span><button :disabled="loading" @click="refresh">↻ {{ loading ? '更新中' : '刷新行情' }}</button></div>
    </header>
    <div v-if="error" class="notice" role="alert">{{ error }}</div>
    <section class="hero panel">
      <div class="hero-main"><div class="heading"><div><div class="eyebrow"><em>01</em> / MARKET PULSE</div><h2>市场脉搏 <small>一眼看懂当下的市场</small></h2></div><span class="timestamp">获取 {{ time(market?.createTime) }}</span></div>
        <div class="indices"><div class="primary-index"><label>上证指数 <small>SHANGHAI</small></label><strong>{{ value(market?.shangzhengPoint) }}</strong><b :class="color(market?.shangzhengRiseAndFall)">{{ percent(market?.shangzhengRiseAndFall) }}</b></div><div class="minor-index"><div><label>深证成指</label><strong>{{ value(market?.shenzhengPoint) }}</strong><small>点位</small></div><div><label>创业板指</label><strong>{{ value(market?.chuangyePoint) }}</strong><small>点位</small></div></div></div>
      </div>
      <div class="breadth"><label>市场宽度 <small>MARKET BREADTH</small></label><div class="breadth-visual"><div class="donut"><MarketChart v-if="breadthTotal" :option="breadthOption" label="上涨与下跌家数占比环形图" /><div class="donut-center"><strong>{{ breadthRatio }}</strong><span>上涨占比</span></div></div><div class="breadth-values"><div><strong class="up">{{ value(market?.riseAmount) }}</strong><span>上涨家数</span></div><div><strong class="down">{{ value(market?.fallAmount) }}</strong><span>下跌家数</span></div></div></div><div class="turnover"><span>两市成交额 <small>TURNOVER</small></span><strong>{{ value(market?.marketTurnover) }} <small>亿元</small></strong></div></div>
    </section>
    <div class="dashboard">
      <section class="panel sector-panel"><div class="heading"><div><div class="eyebrow"><em>02</em> / SECTOR RADAR</div><h2>涨停题材 <small>样本内涨跌幅排序</small></h2></div><span class="timestamp">获取 {{ time(market?.createTime) }}</span></div>
        <div v-if="sectorData.length" class="compact-list"><div v-for="item in sectorData" :key="item.name" class="compact-row"><span>{{ item.name }}</span><b :class="color(item.value)">{{ percent(item.value) }}</b></div></div>
        <p v-else class="chart-empty">{{ market?.sectorUnavailable ? '题材数据源暂不可用' : '暂无涨停题材数据' }}</p><div class="note">仅涵盖涨停题材，非全市场板块涨跌榜</div>
      </section>
      <section class="panel sentiment-panel"><div class="heading"><div><div class="eyebrow"><em>03</em> / SENTIMENT</div><h2>短线情绪 <small>同花顺涨停池（沪深、创业板、科创板）</small></h2></div><span class="timestamp">{{ time(shortTerm?.createTime) }}</span></div>
        <div class="sentiment"><div><label>涨停家数</label><strong class="up">{{ value(shortTerm?.dailyLimitQuantity) }}</strong><small>LIMIT UP</small></div><div><label>跌停家数</label><strong class="down">{{ value(shortTerm?.downLimitQuantity) }}</strong><small>LIMIT DOWN</small></div></div><div class="seal"><div class="bar-label"><span>封板率</span><strong>{{ percent(shortTerm?.sealingRate, false) }}</strong></div><div class="bar-track"><span class="gold-fill" :style="{ width: sealWidth }"></span></div><div class="scale"><span>0%</span><span>50%</span><span>100%</span></div></div><div class="height-row"><span>市场高度 <small>最高连板</small></span><strong>{{ value(shortTerm?.marketHeight) }} <small>板</small></strong></div><div class="emotion-extra"><span>连板股 <b>{{ value(shortTerm?.evenBoardAmount) }}</b> 只</span><span>开板后回封 <b>{{ value(shortTerm?.dailyLimitReturnSealQuantity) }}</b> 只</span></div><router-link class="detail" to="/charts">查看短线详情 <span>↗</span></router-link>
      </section>
      <section class="panel funds-panel"><div class="heading"><div><div class="eyebrow"><em>04</em> / CAPITAL FLOW</div><h2>资金流向 <small>东方财富行业板块</small></h2></div><span class="timestamp">{{ time(funds?.createTime) }} · 亿元</span></div>
        <div v-if="capitalData.length" class="compact-list"><div v-for="item in capitalData" :key="item.name" class="compact-row"><span>{{ item.name }}</span><b :class="color(item.value)">{{ signed(item.value) }} 亿</b></div></div>
        <p v-else class="chart-empty">暂无资金行情</p><div class="note">主力资金为数据源估算值，正值为净流入，负值为净流出</div>
      </section>
      <section class="panel stock-panel"><div class="heading"><div><div class="eyebrow"><em>05</em> / LEADERS</div><h2>连板梯队 <small>按连板高度排序 · 题材信息来自涨停题材样本</small></h2></div><span class="timestamp">{{ time(shortTerm?.createTime) }}</span></div>
        <div class="stock-table"><table><thead><tr><th>个股</th><th>高度</th><th>换手</th><th>封单</th><th>首次封板</th></tr></thead><tbody><tr v-for="stock in leaderStocks" :key="stock.code"><td><Stock :name="stock.name" :code="stock.code" /><small>{{ stock.plateLevel2 || '—' }}</small></td><td class="up">{{ stock.level }}板</td><td>{{ percent(stock.turnoverRate, false) }}</td><td>{{ value(stock.closingFunds) }}<small v-if="stock.closingFunds != null">亿</small></td><td>{{ stock.dailyTime?.split(',')[0] || '—' }}</td></tr></tbody></table><p v-if="!leaderStocks.length" class="empty">暂无涨停个股数据</p></div>
        <div class="risk-line"><span>跌停反馈</span><template v-if="downStocks.length"><span v-for="stock in downStocks.slice(0, 4)" :key="stock.code" class="risk-stock"><Stock :name="stock.name" :code="stock.code" /></span><span v-if="downStocks.length > 4">等 {{ downStocks.length }} 只</span></template><span v-else>暂无跌停个股数据</span></div>
      </section>
      <section class="panel global-panel"><div class="heading"><div><div class="eyebrow"><em>06</em> / GLOBAL MARKETS</div><h2>外围市场 <small>跨市场风险参考</small></h2></div><span class="source">腾讯行情</span></div><div class="global-head"><span>指数 / 行情时间</span><span>最新点位</span><span>涨跌幅</span></div><div v-for="item in globalMarkets" :key="item.code" class="global-row"><div><strong>{{ item.name }}</strong><small>{{ item.quoteTime || '暂无行情时间' }}</small></div><span>{{ value(item.price) }}</span><b :class="color(item.change)">{{ percent(item.change) }}</b></div><p v-if="!globalMarkets.length" class="empty">暂无外围行情</p><div class="note">◷ &nbsp;时间为交易所当地时间，行情可能延迟或处于休市状态</div></section>
    </div><footer><span>PAYBACK / MARKET MONITOR</span><span>获取时间不等于交易所行情时间 · 市场信息仅供研究参考</span></footer>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import dayjs from 'dayjs';
import { fetchLiveMarket, type GlobalQuote } from '@/api/payBack';
import type { MarketModel } from '@/api/model/MarketModel';
import type { FundsModel } from '@/api/model/FundsModel';
import type { ShortTermModel } from '@/api/model/ShortTermModel';
import type { EChartsCoreOption } from 'echarts/core';
import MarketChart from './MarketChart.vue';

type Plate = { name: string; quoteChange?: number; funds?: number };
type StockItem = { name: string; code: string; plateLevel2?: string; turnoverRate?: number; closingFunds?: number; dailyTime?: string };
type LiveMarket = MarketModel & { gainianRiseFloat?: string; gainianFallFloat?: string; sectorUnavailable?: boolean };
const market = ref<LiveMarket>();
const funds = ref<FundsModel>();
const shortTerm = ref<ShortTermModel>();
const globalMarkets = ref<GlobalQuote[]>([]);
const loading = ref(false);
const error = ref('');
// 单个字段损坏时保留其他模块，避免整页不可用。
function parse<T>(raw: string | undefined, fallback: T): T {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function plateList(raw?: string): Plate[] { const result = parse<unknown>(raw, []); return Array.isArray(result) ? result : []; }
const directions = computed(() => [
  { label: '进攻方向', note: '涨幅居前', dot: 'red-dot', items: plateList(market.value?.gainianRiseFloat) },
  { label: '防守观察', note: '跌幅居前', dot: 'green-dot', items: plateList(market.value?.gainianFallFloat) },
]);
const fundGroups = computed(() => {
  const data = parse<{ in?: Plate[]; out?: Plate[] }>(funds.value?.hangyeFundsTop, {});
  return [{ label: '净流入', dot: 'red-dot', items: Array.isArray(data?.in) ? data.in : [] }, { label: '净流出', dot: 'green-dot', items: Array.isArray(data?.out) ? data.out : [] }];
});
// 连板数据按高度分组，排除统计字段并从高到低展开，避免重复计入高标。
const leaderStocks = computed(() => {
  const boards = parse<Record<string, unknown>>(shortTerm.value?.evenBoardData, {});
  if (!boards || typeof boards !== 'object' || Array.isArray(boards)) return [];
  return Object.entries(boards)
    .filter(([level, stocks]) => /^\d+$/.test(level) && Array.isArray(stocks))
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([level, stocks]) => (stocks as StockItem[]).filter(stock => stock?.code && stock?.name).map(stock => ({ ...stock, level: Number(level) })));
});
const downStocks = computed(() => {
  const items = parse<unknown>(shortTerm.value?.downLimitData, []);
  return Array.isArray(items) ? (items as StockItem[]).filter(stock => stock?.code && stock?.name) : [];
});
// 图形只表示当前返回值，不推断不存在的历史走势。
const breadthTotal = computed(() => {
  const up = market.value?.riseAmount;
  const down = market.value?.fallAmount;
  return up != null && down != null && Number.isFinite(Number(up)) && Number.isFinite(Number(down)) && Number(up) >= 0 && Number(down) >= 0 ? Number(up) + Number(down) : 0;
});
const breadthRatio = computed(() => breadthTotal.value ? (Number(market.value?.riseAmount) / breadthTotal.value * 100).toFixed(1) + '%' : '—');
const sealWidth = computed(() => shortTerm.value?.sealingRate == null || !Number.isFinite(Number(shortTerm.value.sealingRate)) ? '0%' : Math.min(100, Math.max(0, Number(shortTerm.value.sealingRate))) + '%');
const breadthOption = computed<EChartsCoreOption>(() => ({
  series: [{ type: 'pie', radius: ['70%', '88%'], center: ['50%', '50%'], silent: true, label: { show: false }, itemStyle: { borderColor: '#102124', borderWidth: 3 }, data: [
    { name: '上涨', value: Number(market.value?.riseAmount), itemStyle: { color: '#f16e62' } },
    { name: '下跌', value: Number(market.value?.fallAmount), itemStyle: { color: '#49c3a0' } },
  ] }],
}));
// 两侧排行可能包含同一板块；按名称去重并过滤缺失数值，避免图表产生虚假零值。
function chartData(groups: { items: Plate[] }[], key: 'quoteChange' | 'funds') {
  const items = groups.flatMap(group => group.items).filter(item => item.name && item[key] != null && Number.isFinite(Number(item[key])));
  return Array.from(new Map(items.map(item => [item.name, { name: item.name, value: Number(item[key]) }])).values()).sort((a, b) => b.value - a.value);
}
const sectorData = computed(() => chartData(directions.value, 'quoteChange'));
const capitalData = computed(() => chartData(fundGroups.value, 'funds'));
function value(n: number | undefined | null) { return n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 }); }
function signed(n: number | undefined) { return n == null || !Number.isFinite(Number(n)) ? '—' : (Number(n) > 0 ? '+' : '') + value(n); }
function percent(n: number | undefined | null, sign = true) { return n == null || !Number.isFinite(Number(n)) ? '—' : (sign ? signed(n) : value(n)) + '%'; }
function color(n: number | undefined | null) { return n == null ? '' : Number(n) > 0 ? 'up' : Number(n) < 0 ? 'down' : ''; }
function time(date?: Date | string) { return date && dayjs(date).isValid() ? dayjs(date).format('MM-DD HH:mm') : '暂无'; }
// 各行情源独立请求，某一来源失败时保留其他数据。
async function refresh() {
  if (loading.value) return;
  loading.value = true;
  const failures: string[] = [];
  const request = async <T,>(name: string, promise: Promise<T>, update: (data: T) => void) => {
    try { update(await promise); } catch { failures.push(name); error.value = name + '行情获取失败；已保留上次结果。'; }
  };
  error.value = '';
  await Promise.all([
    request('市场', fetchLiveMarket<LiveMarket>('market'), data => { market.value = data; }),
    request('资金', fetchLiveMarket<FundsModel>('funds'), data => { funds.value = data; }),
    request('短线', fetchLiveMarket<ShortTermModel>('shortTerm'), data => { shortTerm.value = data; }),
    request('外围', fetchLiveMarket<GlobalQuote[]>('global'), data => { globalMarkets.value = data; }),
  ]);
  error.value = failures.length ? failures.join('、') + '行情获取失败；已保留上次结果。' : '';
  loading.value = false;
}
let timer: ReturnType<typeof setInterval>;
onMounted(() => { refresh(); timer = setInterval(refresh, 60000); });
onUnmounted(() => clearInterval(timer));
</script>
<style scoped>
.breadth-visual{display:flex;align-items:center;gap:20px;margin:6px 0}.donut{width:160px;height:160px;position:relative;flex-shrink:0}.donut :deep(.chart){height:160px}.donut-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:none}.donut-center strong{font:600 24px Georgia,serif;color:#e8eee9}.donut-center span{font-size:10px;color:#a2b5ad;margin-top:5px}.breadth-visual .breadth-values{flex:1;display:grid;gap:18px;margin:0}.breadth-visual .breadth-values>div:last-child{text-align:left}.chart-empty{height:320px;display:grid;place-items:center;color:#91a6a0;font-size:13px}.dashboard :deep(.chart){margin-top:12px}
.stock-table{overflow:auto;min-height:0;margin-top:12px;flex:1}.stock-table table{border-collapse:collapse;width:100%;font-size:12px;white-space:nowrap;text-align:right}.stock-table th{color:#91a6a0;font-size:10px;font-weight:400}.stock-table th,.stock-table td{padding:7px 4px;border-bottom:1px solid #243a39}.stock-table th:first-child,.stock-table td:first-child{text-align:left}.stock-table td:first-child small{display:block;color:#91a6a0;font-size:10px;margin-top:2px;max-width:110px;overflow:hidden;text-overflow:ellipsis}.stock-table td small{color:#91a6a0;font-size:10px}.risk-line{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding-top:8px;color:#91a6a0;font-size:10px}.risk-stock{color:#49c3a0}
.emotion-extra{display:flex;justify-content:space-between;gap:8px;color:#91a6a0;font-size:10px;margin-top:7px}.emotion-extra b{color:#dce9e1;font-size:12px}
.compact-list{min-height:0;overflow:auto;flex:1;margin-top:8px}.compact-row{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #243a39;font-size:12px}.compact-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.compact-row b{font:600 13px Georgia,serif;white-space:nowrap}
@media(max-width:400px){.donut{width:130px;height:130px}.donut :deep(.chart){height:130px}}
.terminal{--red:#f16e62;--green:#49c3a0;--line:#293e3c;background:#0a1518;color:#e7eeec;min-height:100%;padding:30px 34px 24px;font-family:"Microsoft YaHei",sans-serif;box-sizing:border-box}.terminal *{box-sizing:border-box}.masthead,.identity,.actions,.heading,.group-title,.bar-label,.height-row{display:flex;align-items:center;justify-content:space-between;gap:12px}.masthead{margin-bottom:26px}.identity{justify-content:flex-start;gap:14px}.logo{display:flex;align-items:center;justify-content:center;width:43px;height:43px;border:1px solid #426363;font:700 25px Georgia,serif}.logo span{color:#e6b875}.eyebrow{color:#91a5a0;font:700 10px Georgia,serif;letter-spacing:2px}.eyebrow em{font-style:normal;color:#dfb474}h1,h2,p{margin:0}h1{font-size:22px;letter-spacing:2px;margin-top:6px}h1 small{font:10px Georgia,serif;letter-spacing:1.4px;color:#8a9f98;margin-left:10px}.live{font-size:11px;color:#a3b7ac;white-space:nowrap}.live i,.group-title i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px}.live i{background:#62c8a4;box-shadow:0 0 12px #62c8a4}.actions{gap:20px}.actions button{border:1px solid #516461;background:#1b302f;color:#eef4ed;padding:10px 15px;border-radius:3px;cursor:pointer;min-height:40px}.actions button:disabled{opacity:.6}.actions button:focus-visible,.detail:focus-visible{outline:2px solid #dfb474;outline-offset:3px}.panel{background:#102124;border:1px solid #263b3c;position:relative}.panel:before{content:"";position:absolute;top:-1px;left:22px;width:30px;height:2px;background:#b7905e}.hero{display:grid;grid-template-columns:1.18fr 1fr;margin-bottom:16px;background:linear-gradient(110deg,#142b2c,#102124 70%)}.hero-main,.breadth{padding:25px 28px}.breadth{border-left:1px solid var(--line);background:linear-gradient(145deg,transparent,#122a29)}.heading{align-items:flex-start}.heading h2{font-size:17px;letter-spacing:.5px;margin-top:8px}.heading h2 small{font-size:11px;font-weight:400;color:#91a6a0;margin-left:9px}.timestamp{font-size:11px;color:#91a6a0;white-space:nowrap}.indices{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;margin-top:28px}label{display:block;font-size:12px;color:#a1b3ae}label small{font:9px Georgia,serif;letter-spacing:1px;color:#8aa099;margin-left:7px}.primary-index strong{display:block;font:600 42px/1.1 Georgia,serif;letter-spacing:-1px;margin:12px 0 7px}.primary-index b{font:600 16px Georgia,serif}.minor-index{display:grid;grid-template-columns:1fr 1fr;gap:15px;align-items:end}.minor-index>div{border-left:1px solid #314744;padding-left:18px}.minor-index strong{display:block;font:600 20px Georgia,serif;margin:12px 0 5px}.minor-index small{color:#93a7a0;font-size:11px}.breadth-values{display:flex;justify-content:space-between;margin:23px 0 15px}.breadth-values>div:last-child{text-align:right}.breadth-values strong{display:block;font:600 28px Georgia,serif}.breadth-values span{color:#9eb0aa;font-size:11px}.breadth-bar,.bar-track{display:flex;background:#273c3c;overflow:hidden}.breadth-bar{height:8px;gap:3px}.red-fill{background:linear-gradient(90deg,#ac4a48,#ef7466)}.green-fill{background:linear-gradient(90deg,#287d6a,#55c3a1)}.gold-fill{background:#d0a56d}.scale{display:flex;justify-content:space-between;margin-top:8px;color:#91a6a0;font-size:10px}.turnover{display:flex;justify-content:space-between;align-items:end;border-top:1px solid #304541;margin-top:21px;padding-top:17px;font-size:12px;color:#a5b6b0}.turnover>span small{display:block;font:9px Georgia,serif;letter-spacing:1px;color:#8aa099;margin-top:5px}.turnover strong{font:600 23px Georgia,serif;color:#e8eee9}.turnover strong small,.height-row strong small{font:11px sans-serif;color:#a1b5ae}.dashboard{display:grid;grid-template-columns:1.3fr 1fr;gap:16px}.dashboard>.panel{padding:24px 26px}.two-cols{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:24px}.two-cols>div+div{border-left:1px solid var(--line);padding-left:26px}.group-title{padding-bottom:11px;border-bottom:1px solid #2c403f;font-size:13px;font-weight:700}.group-title small{font-size:10px;color:#91a6a0;font-weight:400}.red-dot{background:var(--red)}.green-dot{background:var(--green)}.bar-row{padding-top:15px}.bar-label{font-size:12px}.bar-label b{font:600 14px Georgia,serif}.bar-label b small{font:10px sans-serif;color:#91a6a0}.rank-no{font:10px Georgia,serif;color:#89a09a;font-style:normal;margin-right:9px}.bar-track{height:4px;margin-top:9px}.bar-track span{display:block}.note{border-top:1px solid #2b403f;margin-top:22px;padding-top:13px;font-size:10px;line-height:1.6;color:#9ab0a8}.up{color:var(--red)!important}.down{color:var(--green)!important}.empty{color:#91a6a0;font-size:12px;padding:24px 0}.sentiment{display:flex;align-items:center;justify-content:space-around;margin:25px 0 20px}.sentiment>div{text-align:center;flex:1}.sentiment>div+div{border-left:1px solid #304541}.sentiment strong{display:block;font:600 38px/1 Georgia,serif;margin:10px 0 5px}.sentiment small{font:9px Georgia,serif;letter-spacing:1px;color:#91a6a0}.seal{background:#172e2e;padding:14px 16px;color:#adbfba}.seal strong{font:600 19px Georgia,serif;color:#e0c18f}.height-row{margin-top:17px;font-size:12px;color:#a6b9b2}.height-row>span small{font-size:10px;color:#91a6a0;margin-left:6px}.height-row strong{font:600 22px Georgia,serif;color:#e8eee9}.detail{display:flex;justify-content:space-between;color:#dfb474;text-decoration:none;font-size:11px;border-top:1px solid #2b403f;padding-top:13px;margin-top:16px}.source{font-size:10px;color:#d5bd95;border:1px solid #615741;padding:5px 8px}.global-head,.global-row{display:grid;grid-template-columns:1fr 90px 68px;align-items:center;gap:8px}.global-head{font-size:10px;color:#91a6a0;border-bottom:1px solid #2c403f;padding:20px 0 10px}.global-head span:not(:first-child),.global-row>span,.global-row>b{text-align:right}.global-row{border-bottom:1px solid #243a39;padding:11px 0;font:13px Georgia,serif}.global-row strong{display:block;font:12px sans-serif}.global-row small{display:block;color:#91a6a0;font:10px Georgia,serif;margin-top:5px}.global-row b{font:600 14px Georgia,serif}footer{display:flex;justify-content:space-between;gap:15px;color:#91a6a0;font-size:10px;margin-top:22px}footer span:first-child{font:10px Georgia,serif;letter-spacing:1px}.notice{padding:12px;margin-bottom:16px;background:#413426;color:#f0c08f;font-size:13px}
@media(max-width:1100px){.hero{grid-template-columns:1fr}.breadth{border-left:0;border-top:1px solid var(--line)}.dashboard{grid-template-columns:1fr 1fr}.heading h2 small{display:block;margin:6px 0 0}}@media(max-width:760px){.terminal{padding:20px 14px}.masthead{align-items:flex-start;gap:16px;flex-direction:column}.actions{width:100%;justify-content:space-between}.dashboard{grid-template-columns:1fr}.hero-main,.breadth,.dashboard>.panel{padding:21px 18px}.primary-index strong{font-size:34px}.minor-index{gap:8px}.minor-index>div{padding-left:10px}.minor-index strong{font-size:17px}.two-cols{gap:14px}.two-cols>div+div{padding-left:14px}.timestamp{font-size:10px}footer{flex-direction:column}}@media(max-width:400px){h1 small{display:none}.indices{grid-template-columns:1fr}.minor-index>div:first-child{border:0;padding-left:0}.global-head,.global-row{grid-template-columns:1fr 75px 58px}}
/* 桌面端优先把所有模块放进视口，较矮或较窄屏幕保留自然滚动。 */
@media(min-width:1000px) and (min-height:700px){
  .terminal{height:100%;min-height:0;padding:12px 18px 10px;display:flex;flex-direction:column}
  .masthead{flex:none;margin-bottom:10px}.logo{width:34px;height:34px;font-size:21px}h1{font-size:19px;margin-top:3px}
  .hero{flex:none;grid-template-columns:1.18fr 1fr;margin-bottom:10px}
  .hero-main,.breadth{padding:13px 18px}.breadth{border-left:1px solid var(--line);border-top:0}
  .heading h2{font-size:15px;margin-top:4px}.heading h2 small{display:inline;margin:0 0 0 9px}
  .indices{margin-top:12px}.primary-index strong{font-size:32px;margin:7px 0 4px}.minor-index strong{font-size:18px;margin:7px 0 4px}
  .breadth-visual{margin:0}.donut,.donut :deep(.chart){width:92px;height:92px}.donut-center strong{font-size:17px}
  .breadth-visual .breadth-values{display:flex;gap:22px}.breadth-values strong{font-size:20px}
  .turnover{margin-top:4px;padding-top:8px}.turnover strong{font-size:19px}
  .dashboard{flex:1;min-height:0;grid-template-columns:1.3fr 1fr;grid-template-rows:repeat(2,minmax(0,1fr));gap:10px}
  .dashboard>.panel{min-height:0;padding:12px 16px;display:flex;flex-direction:column}
  .dashboard :deep(.chart){flex:1;min-height:0;height:0;margin-top:4px}.chart-empty{flex:1;height:auto}
  .note{margin-top:4px;padding-top:6px;font-size:10px}
  .sentiment{margin:10px 0}.sentiment strong{font-size:30px;margin:5px 0}
  .seal{padding:8px 12px}.seal .bar-track{margin-top:5px}.seal .scale{margin-top:4px}
  .height-row{margin-top:8px}.detail{margin-top:auto;padding-top:7px}
  .global-head{padding:9px 0 6px}.global-row{padding:5px 0}.global-row small{margin-top:2px}
  footer{flex:none;margin-top:7px}
}
@media(min-width:1300px) and (min-height:700px){
  .terminal{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,3fr);grid-template-rows:auto auto minmax(0,0.85fr) minmax(0,1.15fr) auto;gap:10px}
  .masthead{grid-column:1 / -1;margin:0}.notice{grid-column:1 / -1;margin:0}.dashboard{display:contents}
  .hero{grid-column:1;grid-row:3;display:flex;flex-direction:column;margin:0;min-height:0;overflow:auto}
  .hero-main,.breadth{padding:12px}.breadth{border-left:0;border-top:1px solid var(--line)}
  .hero .heading,.global-panel .heading,.sector-panel .heading,.funds-panel .heading{flex-wrap:wrap;gap:4px}
  .hero .indices{grid-template-columns:1fr;gap:8px;margin-top:10px}
  .hero .primary-index strong{font-size:26px}.hero .minor-index>div:first-child{padding-left:0;border:0}
  .breadth-visual{gap:8px}.donut,.donut :deep(.chart){width:64px;height:64px}.donut-center strong{font-size:13px}.donut-center span{font-size:9px}
  .breadth-visual .breadth-values{gap:10px}.breadth-values strong{font-size:16px}.turnover strong{font-size:16px}
  .global-panel{grid-column:1;grid-row:4}.sector-panel{grid-column:2;grid-row:3}.funds-panel{grid-column:2;grid-row:4}
  .sentiment-panel{grid-column:3;grid-row:3}.stock-panel{grid-column:3;grid-row:4}
  .dashboard>.panel{overflow:hidden}.stock-panel{min-width:0}
  .stock-table{margin-top:5px}.stock-table th,.stock-table td{padding:6px 8px}.stock-table td:first-child small{max-width:none}
  .risk-line{padding-top:5px}.compact-list{margin-top:5px}.compact-row{padding:4px 0}
  .sentiment-panel .sentiment{justify-content:flex-start}.sentiment-panel .sentiment>div{max-width:180px}
  .sentiment-panel .seal{max-width:480px}.sentiment-panel .height-row,.sentiment-panel .emotion-extra{max-width:480px}
  footer{grid-column:1 / -1;grid-row:5;margin:0}
}
@media(min-width:1000px) and (max-width:1299px) and (min-height:700px){.terminal{height:auto;min-height:100%}.dashboard{flex:none;grid-template-rows:none}.dashboard>.panel{min-height:230px}.stock-table{max-height:300px}}
</style>
