<template>
  <div class="container flex__row">
    <div class="left">
      <h2>异动个股</h2>
      <ul>
        <li
          v-for="(stock, index) in data.stockHaltMonitorList"
          :key="stock.stock_code"
          class="flex__row"
        >
          <span class="index">{{ index }}</span>
          <Stock
            class="stock__span large"
            :name="stock.stock_name"
            :code="stock.stock_code"
          />
          <span class="date">{{ stock.start_date }}</span>
          <span :class="['date', { endDateIsToday: stock.endDateIsToday }]">{{
            stock.end_date
          }}</span>
        </li>
      </ul>
    </div>
    <div class="right">
      <h2>历史异动个股</h2>
      <ul>
        <li
          v-for="(stock, index) in data.stockHaltMonitorHistoryList"
          :key="stock.stock_code"
        >
          <span class="index">{{ index }}</span>
          <Stock
            class="stock__span large"
            :name="stock.stock_name"
            :code="stock.stock_code"
          />
          <span class="date">{{ stock.start_date }}</span>
          <span class="date">{{ stock.end_date }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import dayjs from 'dayjs';
import {
  fetchThsStockHaltMonitor,
  fetchThsStockHaltMonitorHistory,
} from '@/api/tonghuashun';
const data: any = reactive({
  stockHaltMonitorList: [],
  stockHaltMonitorHistoryList: [],
});
const now = dayjs();
/**
 * 将时间戳格式化为字符串
 * @param dataList
 */
const formatDataListDate = (dataList: any) => {
  return dataList.map((item: any) => {
    const end_date = dayjs(item.end_date).format('YYYY-MM-DD');
    const start_date = dayjs(item.start_date).format('YYYY-MM-DD');
    const endDateIsToday = now.isSame(end_date, 'day');
    return {
      ...item,
      end_date,
      start_date,
      endDateIsToday,
    };
  });
};
/**
 * 初始化页面
 */
const initPage = async () => {
  // 异动个股
  const stockHaltMonitorResult = await fetchThsStockHaltMonitor();
  // 历史历史异动个股
  const stockHaltMonitorHistoryResult = await fetchThsStockHaltMonitorHistory();

  data.stockHaltMonitorList = formatDataListDate(stockHaltMonitorResult?.list);
  data.stockHaltMonitorHistoryList = formatDataListDate(
    stockHaltMonitorHistoryResult?.list,
  );
};

initPage();
</script>

<style scoped lang="less">
.container {
  font-size: 14px;
  ul,
  li {
    list-style: none;
  }
  li {
    margin-bottom: 5px;
  }
  h2 {
    margin-bottom: 10px;
  }
  .left,
  .right {
    width: 50%;
  }
  .index {
    width: 40px;
    color: #aaa;
  }
  .date {
    color: #aaa;
    width: 120px;

    &.endDateIsToday {
      color: #f00;
    }
  }
  .stock__span {
    width: 80px;
  }
  span {
    display: inline-block;
  }
}
</style>
