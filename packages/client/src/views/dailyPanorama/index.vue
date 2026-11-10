<template>
  <main class="review">
    <header class="top">
      <div><p class="kicker">PAYBACK / DAILY MARKET REVIEW</p><h1>每日 AI 全景复盘</h1><p class="subtitle">收盘数据与外围行情，一张图看清市场结构</p></div>
      <div class="controls"><label for="trade-date">交易日</label><input id="trade-date" v-model="selectedDate" type="date" :disabled="busy" @change="load" /><button :disabled="busy || !selectedDate" @click="generate">{{ busy ? '处理中…' : '生成复盘' }}</button></div>
    </header>
    <div v-if="error" class="notice" role="alert">{{ error }} <router-link v-if="canRefreshToday" to="/charts">前往图表页更新市场和短线数据（管理员）</router-link></div>
    <p v-if="busy" class="notice" role="status">正在收集数据并生成复盘，请稍候。</p>
    <template v-if="report">
      <div class="report-meta"><span>交易日 <b>{{ report.data_as_of }}</b></span><span>生成于 {{ showTime(report.generated_at) }}</span><span>外围为生成时最新报价，可能延迟或跨交易日</span></div>
      <section class="hero card"><div class="section-head"><div><p class="kicker">01 / MARKET PULSE</p><h2>大盘盘面</h2></div><span>记录创建 {{ showTime(market.createTime) }}</span></div>
        <div class="metrics"><div><label>上证指数</label><strong>{{ number(market.shangzhengPoint) }}</strong><small :class="tone(market.shangzhengRiseAndFall)">{{ percent(market.shangzhengRiseAndFall) }}</small></div><div><label>深证成指</label><strong>{{ number(market.shenzhengPoint) }}</strong></div><div><label>创业板指</label><strong>{{ number(market.chuangyePoint) }}</strong></div><div><label>市场成交额</label><strong>{{ number(market.marketTurnover) }}</strong><small>万亿元</small></div><div><label>上涨 / 下跌</label><strong><i class="up">{{ number(market.riseAmount) }}</i> / <i class="down">{{ number(market.fallAmount) }}</i></strong><small>家</small></div></div>
      </section>
      <div class="grid">
        <section class="card ai"><div class="section-head"><div><p class="kicker">02 / AI INSIGHT</p><h2>AI 复盘</h2></div><span>基于下方数据生成</span></div><div class="analysis">{{ report.analysis }}</div></section>
        <section class="card"><div class="section-head"><div><p class="kicker">03 / GLOBAL</p><h2>外围指数</h2></div><span>腾讯行情</span></div><div v-for="quote in report.global_quotes" :key="quote.symbol" class="row"><div><b>{{ quote.name || quote.symbol }}</b><small>{{ quote.datetime || '报价时间未知' }}</small></div><span v-if="quote.error" class="muted">获取失败</span><div v-else class="right"><b>{{ number(quote.price) }}</b><small :class="tone(quote.percent_change)">{{ percent(quote.percent_change) }}</small></div></div></section>
        <section class="card"><div class="section-head"><div><p class="kicker">04 / SECTORS</p><h2>板块涨跌</h2></div><span>当日数据库记录</span></div><div class="sectors"><div v-for="group in sectorGroups" :key="group.label"><h3>{{ group.label }}</h3><p v-if="group.items === null" class="muted">数据缺失</p><p v-else-if="!group.items.length" class="muted">暂无数据</p><div v-for="(item, index) in group.items" :key="index" class="row"><span>{{ item.name || '—' }}</span><b :class="tone(item.quoteChange)">{{ percent(item.quoteChange) }}</b></div></div></div></section>
        <section class="card"><div class="section-head"><div><p class="kicker">05 / SENTIMENT</p><h2>短线情绪</h2></div><span>记录创建 {{ showTime(panorama.short_term_create_time) }}</span></div><div class="sentiment"><div><label>涨停</label><strong class="up">{{ number(shortTerm.dailyLimitQuantity) }}</strong><small>家</small></div><div><label>跌停</label><strong class="down">{{ number(shortTerm.downLimitQuantity) }}</strong><small>家</small></div><div><label>最高连板</label><strong>{{ number(shortTerm.marketHeight) }}</strong><small>板</small></div><div><label>封板率</label><strong>{{ percent(shortTerm.sealingRate, false) }}</strong></div></div><p class="muted">周期：{{ shortTerm.cycle || '未提供' }} · 连板 {{ number(shortTerm.evenBoardAmount) }} 家 · 炸板 {{ number(shortTerm.dailyLimitOpenQuantity) }} 家</p></section>
        <section class="card"><div class="section-head"><div><p class="kicker">06 / LADDER</p><h2>涨停梯队</h2></div><span>按板高降序</span></div><p v-if="panorama.ladder === null" class="muted">梯队数据缺失</p><p v-else-if="!ladder.length" class="muted">无可展示梯队</p><div v-for="group in ladder" :key="group.level" class="ladder-row"><b>{{ group.level }} 板</b><span>{{ group.names.join('、') || '无个股明细' }}</span></div></section>
        <section class="card"><div class="section-head"><div><p class="kicker">07 / RISK</p><h2>跌停个股</h2></div><span>以采集名单为准</span></div><p v-if="panorama.down_stocks === null" class="muted">跌停名单缺失</p><p v-else-if="!panorama.down_stocks.length" class="muted">名单为空，请结合采集状态核实</p><div v-else class="tags"><span v-for="(stock, index) in panorama.down_stocks" :key="index">{{ stock.name || stock.code || '未知' }}</span></div></section>
      </div><footer>数据来源：本地收盘数据与腾讯外围行情 · 仅供研究参考，不构成投资建议</footer>
    </template>
    <div v-else-if="!busy" class="empty card"><b>暂无 {{ selectedDate }} 的全景复盘</b><p>收盘后自动生成，也可选择已有数据的交易日手动生成。</p></div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs from 'dayjs';

type Value = string | number | null | undefined;
interface Stock { name?: string; code?: string }
interface Sector { name?: string; quoteChange?: Value }
interface Quote { symbol: string; name?: string; price?: Value; percent_change?: Value; datetime?: string; error?: string }
interface Panorama {
  market: Record<string, Value>; short_term: Record<string, Value>; short_term_create_time?: string;
  sectors: Record<string, Sector[] | null>; ladder: Record<string, unknown> | null; down_stocks: Stock[] | null;
}
interface Report { data_as_of: string; generated_at: string; analysis: string; panorama: Panorama; global_quotes: Quote[] }

const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const report = ref<Report | null>(null);
const busy = ref(false);
const error = ref('');
const canRefreshToday = computed(() => error.value.includes('收盘数据未就绪') && selectedDate.value === dayjs().format('YYYY-MM-DD'));
const panorama = computed(() => report.value!.panorama);
const market = computed(() => panorama.value.market);
const shortTerm = computed(() => panorama.value.short_term);
const sectorGroups = computed(() => [
  { label: '概念涨幅', items: panorama.value.sectors.concept_rise },
  { label: '概念跌幅', items: panorama.value.sectors.concept_fall },
  { label: '行业涨幅', items: panorama.value.sectors.industry_rise },
  { label: '行业跌幅', items: panorama.value.sectors.industry_fall },
]);
// 梯队只展开数字板高，避免重复显示高标统计字段。
const ladder = computed(() => Object.entries(panorama.value.ladder || {})
  .filter(([level, stocks]) => /^\d+$/.test(level) && Array.isArray(stocks))
  .sort(([a], [b]) => Number(b) - Number(a))
  .map(([level, stocks]) => ({ level, names: (stocks as Stock[]).map(stock => stock.name || stock.code || '').filter(Boolean) })));
function number(value: Value) { return value == null || value === '' || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 }); }
function percent(value: Value, sign = true) { const formatted = number(value); return formatted === '—' ? formatted : `${sign && Number(value) > 0 ? '+' : ''}${formatted}%`; }
function tone(value: Value) { return value == null || value === '' ? '' : Number(value) > 0 ? 'up' : Number(value) < 0 ? 'down' : ''; }
function showTime(value?: Value) { return value ? String(value).replace('T', ' ').slice(0, 19) : '未知'; }
// 每次切换日期都清除旧报告，避免把旧交易日数据误认为当前选择。
async function request(method: 'GET' | 'POST', latest = false) {
  if (!selectedDate.value || busy.value) return;
  busy.value = true; error.value = ''; report.value = null;
  try {
    const response = await fetch(`/agentApi/daily-reports/${latest ? 'latest' : encodeURIComponent(selectedDate.value)}`, { method });
    const body = await response.json();
    if (!response.ok) { if (response.status !== 404) error.value = body.error || '复盘获取失败'; return; }
    report.value = body as Report;
    if (latest) selectedDate.value = report.value.data_as_of;
  } catch { error.value = '复盘服务连接失败，请检查 Agent 服务。'; }
  finally { busy.value = false; }
}
function load() { return request('GET'); }
function generate() { return request('POST'); }
onMounted(() => request('GET', true));
</script>

<style scoped>
.review{min-height:100%;padding:30px;background:#0a1518;color:#e7efeb;font-family:'Microsoft YaHei',sans-serif}.review *{box-sizing:border-box}.top,.section-head,.row,.controls,.report-meta{display:flex;justify-content:space-between;align-items:center;gap:12px}.top{align-items:flex-end;margin-bottom:24px}h1,h2,h3,p{margin:0}.kicker{font:700 10px Georgia,serif;letter-spacing:2px;color:#d4ad75}h1{font-size:28px;margin:10px 0}.subtitle,.muted,.section-head>span,small,footer{color:#97ada5;font-size:12px}.controls{flex-wrap:wrap}.controls label{font-size:12px;color:#a9bcb4}.controls input,.controls button{min-height:42px;border:1px solid #425b55;background:#122927;color:#edf4ef;border-radius:3px;padding:0 12px}.controls button{background:#c39c66;color:#10201d;border-color:#c39c66;font-weight:bold;cursor:pointer}.controls button:disabled{opacity:.55}.controls input:focus-visible,.controls button:focus-visible{outline:2px solid #efcc92;outline-offset:2px}.notice{padding:14px;background:#3b3125;color:#f0cf9e;margin-bottom:14px}.report-meta{justify-content:flex-start;flex-wrap:wrap;color:#a3b6ae;font-size:12px;margin-bottom:12px}.report-meta b{color:#e9eee9}.card{border:1px solid #2b413e;background:#102123;padding:22px;min-width:0}.hero{margin-bottom:14px}.section-head{align-items:flex-start;margin-bottom:18px}.section-head h2{font-size:17px;margin-top:7px}.metrics,.sentiment{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}.metrics>div,.sentiment>div{border-left:1px solid #324a43;padding-left:14px}.metrics label,.sentiment label{display:block;color:#a0b4ac;font-size:12px}.metrics strong,.sentiment strong{display:block;font:600 23px Georgia,serif;margin:9px 0 4px}.metrics i{font-style:normal}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.ai{grid-row:span 2}.analysis{white-space:pre-wrap;line-height:1.85;font-size:14px;color:#d5e2dc}.row{padding:10px 0;border-bottom:1px solid #283e39;font-size:13px}.row small{display:block;margin-top:5px}.right{text-align:right}.up{color:#ef7e70}.down{color:#64c6a3}.sectors{display:grid;grid-template-columns:1fr 1fr;gap:20px}.sectors h3{font-size:12px;color:#b7c8bf}.sentiment{grid-template-columns:repeat(4,1fr);margin-bottom:15px}.ladder-row{display:flex;gap:15px;border-bottom:1px solid #283e39;padding:10px 0;font-size:13px}.ladder-row b{color:#e1b779;white-space:nowrap}.tags{display:flex;gap:8px;flex-wrap:wrap}.tags span{background:#183a32;color:#8ed5b5;padding:7px 10px;font-size:12px}.empty{text-align:center;padding:70px 20px;color:#b7c8bf}.empty p{font-size:13px;margin-top:10px;color:#91a79e}footer{padding:24px 0 4px}.card .muted{line-height:1.7}@media(max-width:850px){.top{align-items:flex-start;flex-direction:column}.grid{grid-template-columns:1fr}.ai{grid-row:auto}.metrics{grid-template-columns:repeat(2,1fr)}.sentiment{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.review{padding:18px 12px}.card{padding:17px}.sectors{grid-template-columns:1fr}.controls{width:100%}.section-head{flex-wrap:wrap}}
.notice a{color:#ffdfaa;text-decoration:underline;margin-left:8px}
</style>
