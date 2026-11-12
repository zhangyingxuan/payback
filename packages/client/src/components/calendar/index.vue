<template>
  <span class="time">{{ time }}</span>
  <span>{{ calendarText }}</span>
</template>
<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue';
import dayjs from 'dayjs';
import { getNextTradingDay, getTradingDayInfo, toShanghaiDate, tradingCalendars } from 'pay-back-core';

const now = ref(new Date());
const time = computed(() => dayjs(now.value).format('MM-DD HH:mm:ss'));

// 日期随时钟更新，跨过上海零点后立即使用新交易日状态。
const date = computed(() => toShanghaiDate(now.value));
const calendarText = computed(() => {
  const today = date.value;
  const info = getTradingDayInfo(today);
  if (info.status === 'unknown') return '交易日历待更新';
  if (info.status === 'closed') {
    const next = getNextTradingDay(today);
    return `${info.name || '周末'}休市${next ? `，${next} 开市` : '，后续日历待更新'}`;
  }
  // 这里只展示休市倒计时，不把休市开始日误称为节日当天。
  const next = tradingCalendars.flatMap(item => [...item.closures])
    .filter(item => item.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  if (!next) return '今日交易日，后续休市安排待更新';
  const days = (Date.parse(`${next.startDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000;
  return `距${next.name}休市 ${days} 天`;
});

// 卸载时释放计时器，避免页面反复挂载后残留更新任务。
const timer = setInterval(() => { now.value = new Date(); }, 1000);
onUnmounted(() => clearInterval(timer));
</script>

<style scoped lang="less">
.time {
  min-width: 170px;
}
</style>
