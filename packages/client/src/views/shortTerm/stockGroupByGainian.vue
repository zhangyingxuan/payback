<template>
  <div class="shortTerm__container table">
    <!-- 标题区域 -->
    <div class="table__header table-row">
      <div class="col1">
        概念名 ({{
          data.stockGroupByGainian ? data.stockGroupByGainian.length : 0
        }})
      </div>
      <div class="col2 dailyLimit__row">
        <!-- <div> -->
        <!-- 竞价行 -->
        <span class="stock large">个股名</span>
        [
        <span class="middle lanse">股价</span>
        <span class="middle">连板高度</span>
        <span class="orange content-large">涨停原因</span>
        <span class="large">涨停时间</span>]&nbsp;&nbsp;
        <span class="middle">涨停分类</span>
        <span class="dateTime__span">{{ data.refreshTime }}</span>
        &nbsp;
        <el-radio-group v-model="autoRefreshInterval" size="small">
          <el-radio-button
            v-for="(item, index) in Object.keys(autoRefreshIntervalConfig)"
            :label="item"
            :key="index"
          ></el-radio-button>
        </el-radio-group>
        &nbsp;
        <el-button
          type="primary"
          @click="refreshPage"
          size="small"
          plain
          :loading="data.refreshLoading"
        >
          刷新
        </el-button>
        <el-divider
          direction="vertical"
          border-style="dashed"
          style="color: #000; background-color: #000"
        />
        <!-- </div> -->
        <div class="filter__container">
          <el-select
            class="select"
            v-model="filter.stockType"
            placeholder="连板高度"
            size="small"
          >
            <el-option
              v-for="(item, index) in filter.stockTypeOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="table__content">
      <div
        v-if="
          stockGroupByGainianFiltered &&
          stockGroupByGainianFiltered.length === 0
        "
        class="noData"
      >
        暂无数据
      </div>
      <div
        class="table-row"
        v-for="(item, key) in stockGroupByGainianFiltered"
        :key="key"
      >
        <div class="col1">
          <div class="col1__container">
            <div class="plate_col">
              <plate :name="item.name" :code="item.code" />
              <span class="red">{{ item.high }}</span>

              <span :class="item.change > 0 ? 'red' : 'green'">
                {{ item.change && item.change.toFixed(2) }}%
              </span>
            </div>
            <div class="plate_col">
              <span>
                {{ item?.stock_list.length }}/<span class="red">
                  {{ item.limit_up_num }}
                </span>
              </span>
              <span>{{ item.days }}天</span>
            </div>
          </div>
        </div>
        <div :class="`col2 ${isMobile ? 'isMobile' : ''}`">
          <div
            v-for="(stock, index) in item.stock_list"
            :key="index"
            class="dailyLimit__row"
          >
            <Stock class="large" :name="stock.name" :code="stock.code" />
            [
            <span class="middle lanse">{{ stock.latest }}</span>
            <span :class="['middle', { red: stock.high !== '首板' }]">
              {{ stock.high }}
            </span>
            <span class="orange content-large">{{ stock.reason_type }}</span>
            <span class="large">
              <span class="time">{{
                dayjs(stock.first_limit_up_time * 1000).format(dayFormat)
              }}</span>
              <span class="time">
                {{
                  stock.last_limit_up_time !== stock.first_limit_up_time
                    ? dayjs(stock.last_limit_up_time * 1000).format(dayFormat)
                    : ''
                }}
              </span>
            </span>
            ]&nbsp;&nbsp;
            <span
              class="reason_info"
              @mouseover="(e: Event) => handleShowMoreInfo(e, stock.reason_info)"
            >
              {{ stock.reason_info }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, watch, ref, inject, onBeforeUnmount, computed } from 'vue';
import { fetchDailyLimitStockGroupByGainian } from '@/api/tonghuashun';
import dayjs from 'dayjs';
import { isMobile } from '@/core/util';

const showTooltip: any = inject('showTooltip');

const dayFormat = 'HH:mm';
const data: {
  stockGroupByGainian: any[];
  refreshTime: string;
  refreshLoading: boolean;
} = reactive({
  stockGroupByGainian: [],
  refreshTime: '',
  refreshLoading: false,
});

const stockTypeOptions: any = [
  { value: 'all', label: '全部' },
  { value: 'chuangye', label: '创业板', code: ['30'] },
  { value: 'kechuang', label: '科创板', code: ['68'] },
  { value: 'zhuban', label: '主板', code: ['60', '0'] },
  { value: 'beijing', label: '京股', code: ['8', '4', '92'] },
];

const filter = reactive({
  stockType: 'all',
  stockTypeOptions,
});
const autoRefreshInterval = ref('不刷新');
const autoRefreshIntervalConfig: any = {
  不刷新: -1,
  '5秒': 5,
  '30秒': 30,
  '1分钟': 60,
};
let interval: any = null;

watch(
  autoRefreshInterval,
  val => {
    const time = autoRefreshIntervalConfig[val];
    clearInterval(interval);
    if (time === -1) {
      return;
    }
    interval = setInterval(() => {
      initPage();
    }, time * 1000);
  },
  { immediate: true },
);

async function refreshPage() {
  data.refreshLoading = true;
  try {
    await initPage();
  } catch (e) {
    console.log(e);
  } finally {
    data.refreshLoading = false;
  }
}

/**
 * 销毁时清理定时任务
 */
onBeforeUnmount(() => {
  clearInterval(interval);
});

/**
 * 处理过滤数据
 */
const dealFilter = (stockGroupByGainian: any) => {
  if (filter.stockType === 'all') {
    return stockGroupByGainian;
  }
  // 取出筛选条件 codes
  const codes = stockTypeOptions.find(
    (item: { value: string }) => item.value === filter.stockType,
  ).code;

  // 过滤
  stockGroupByGainian.forEach((itemGroup: any) => {
    itemGroup.stock_list = itemGroup?.stock_list.filter((stock: any) => {
      return codes.some((code: string) => stock.code.startsWith(code));
    });
  });
  return stockGroupByGainian;
};

async function initPage() {
  const stockGroupByGainianOriginal = await fetchDailyLimitStockGroupByGainian(
    dayjs().format('YYYYMMDD'),
  );
  // 排序，只需要排一次
  stockGroupByGainianOriginal &&
    stockGroupByGainianOriginal.forEach((item: any) => {
      // 按首次涨停时间 升序排序
      item.stock_list &&
        item.stock_list.sort((stock1: any, stock2: any) => {
          return stock1.first_limit_up_time - stock2.first_limit_up_time;
        });
    });

  // 按概念板块分类
  // 个股展示 reason_info、reason_type、name、code、high、first_limit_up_time（首次涨停）、last_limit_up_time、latest（股价）
  data.stockGroupByGainian = stockGroupByGainianOriginal;
  data.refreshTime = dayjs(new Date()).format('HH:mm:ss');
}

initPage();

const stockGroupByGainianFiltered: any = computed(() => {
  // 过滤
  return dealFilter(JSON.parse(JSON.stringify(data.stockGroupByGainian)));
});

// 显示更多
function handleShowMoreInfo(e: Event, reason_info: string) {
  showTooltip(e.target, {
    toolTipContent:
      '<pre style=" word-wrap: break-word;white-space: pre-wrap">' +
      reason_info +
      '</pre>',
    placement: 'bottom',
    maxWidth: '400px',
    popoverClass: 'tooltip__popper',
  });
}
</script>

<style scoped lang="less">
@import '../charts/styles/tabPaneEvenBoardStockTable.less';
.col2 {
  overflow: hidden;
}
.dateTime__span {
  width: 45px;
}
.col1__container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shortTerm__container {
  background-color: #fff;
  padding: 10px 0;
}
.reason_info {
  white-space: nowrap;
  overflow: hidden;
}
.plate_col {
  display: flex;
  flex-direction: column;
}

.time {
  display: inline-block;
  min-width: 40px;
}
.noData {
  padding: 50px;
  text-align: center;
  columns: #ccc;
}
.filter__container {
  .el-checkbox {
    margin-right: 10px;
  }
  .el-select {
    width: 80px;
  }
}
</style>

<style lang="less">
.tooltip__popper {
  width: 50%;
}
</style>
