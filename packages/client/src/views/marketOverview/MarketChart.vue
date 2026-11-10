<template>
  <div ref="container" class="chart" role="img" :aria-label="label"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption, ECharts } from 'echarts/core';

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer]);
const props = defineProps<{ option: EChartsCoreOption; label: string }>();
const container = ref<HTMLElement>();
let chart: ECharts | undefined;
let observer: ResizeObserver | undefined;

// 容器尺寸变化也会影响图表，不能只监听窗口尺寸。
onMounted(() => {
  if (!container.value) return;
  chart = echarts.init(container.value);
  chart.setOption(props.option);
  observer = new ResizeObserver(() => chart?.resize());
  observer.observe(container.value);
});
watch(() => props.option, option => chart?.setOption(option, true));
onUnmounted(() => { observer?.disconnect(); chart?.dispose(); });
</script>

<style scoped>
.chart { width: 100%; height: 320px; }
</style>
