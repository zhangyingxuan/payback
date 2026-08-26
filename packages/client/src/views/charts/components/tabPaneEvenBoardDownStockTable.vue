<template>
  <div :class="['table', { isMobile }]">
    <div class="table__container">
      <div class="table__header table-row">
        <div class="col1">行业板块</div>
        <div class="col2 green stocks_header">
          <template v-if="isDownLimitMode">
            跌停个股（{{
              downLimitData ? downLimitData.length : 0
            }}）<el-tooltip
              effect="dark"
              :content="params.downLimit"
              placement="top"
            >
              <el-icon
                @click="openNewIwencaiWindow(params.downLimit)"
                class="thsTooltip__icon"
                ><InfoFilled
              /></el-icon>
            </el-tooltip>
            短线跌停
          </template>
          <template v-else>
            大面股
            <el-tooltip
              effect="dark"
              :content="params.hugeFall"
              placement="top"
            >
              <el-icon
                @click="openNewIwencaiWindow(params.hugeFall)"
                class="thsTooltip__icon"
                ><InfoFilled
              /></el-icon> </el-tooltip
          ></template>
          （{{ num }}）
          <span class="dateTime__span">{{ updateTime }}</span>
        </div>
      </div>

      <div class="table-row" v-for="item in stockGroupByPlate" :key="item.key">
        <div class="col1">
          <div>
            <Plate class="zise" :name="item.key" />
            <br v-if="isMobile" />
            <span v-if="item.value.length > 1">
              &nbsp;{{ item.value.length }}
            </span>
          </div>
        </div>
        <div class="col2">
          <div v-for="stock in item.value" :key="stock.code">
            <Stock :name="stock.name" :code="stock.code" />
            <template v-if="isDownLimitMode">
              &nbsp;[&nbsp;<span class="orange">{{ stock.reason }}</span>
              <span class="lvse"> 封单{{ stock.closingFunds }}亿</span> ]
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es';
import { openNewIwencaiWindow } from '../utils';
import { params } from 'pay-back-core';
import { computed } from 'vue';
let superData = defineProps({
  downLimitData: {
    type: Object,
    default: () => {},
  },
  num: {
    type: Number,
    default: 0,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isDownLimitMode: {
    type: Boolean,
    default: true,
  },
  updateTime: {
    type: String,
    default: '',
  },
});

const stockGroupByPlate = computed(() => {
  const downLimitData = cloneDeep(superData.downLimitData);

  const stockGroupByPlate: any = {};
  // 按 行业板块 将涨停个股分类
  downLimitData &&
    downLimitData.forEach((item: any) => {
      // 按板块划分 涨停数据
      if (!stockGroupByPlate[item.plateLevel2]) {
        stockGroupByPlate[item.plateLevel2] = [];
      }

      stockGroupByPlate[item.plateLevel2].push(item);
    });

  return sortPlates(stockGroupByPlate);
});

/**
 * 按板块排序 排序
 * @param stockGroupByPlate
 */
function sortPlates(stockGroupByPlate: any) {
  // 将对象转换为数组 便于排序
  const stockGroupByPlateArr: any[] = [];
  Object.keys(stockGroupByPlate).forEach(key => {
    let o = { key: '', value: [] };
    o.key = key;
    o.value = stockGroupByPlate[key];
    // 板块内 个股按 连板高度 => 首次涨停时间降序
    stockGroupByPlateArr.push(o);
  });

  // 按 行业板块 涨停数量降序
  stockGroupByPlateArr.sort((a: any, b: any) => {
    return b.value.length - a.value.length;
  });
  return stockGroupByPlateArr;
}
</script>

<style scoped lang="less">
@import '../styles/tabPaneEvenBoardStockTable.less';
</style>
