<!-- 集合竞价数据 -->
<template>
  <div :class="['table', { isMobile }]" v-if="stockGroupByPlate.length > 0">
    <div class="table__container">
      <div class="table__header table-row">
        <div class="col1">行业板块</div>
        <div class="red">
          <!-- 1进2选股 -->
          强势股
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="chooseStock1Expected"
            placement="top"
          >
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
        <!-- <div class="red">新股 （{{ biddingData.length }}）</div> -->
      </div>

      <div
        class="table-row"
        v-for="(item, key) in stockGroupByPlate"
        :key="key"
      >
        <div class="col1">
          <div>
            <span class="zise">{{ item.key }}</span>
            <br v-if="isMobile" />
            <span>&nbsp;{{ item.value.length }}</span>
          </div>
        </div>
        <div :class="`col2 ${isMobile ? 'isMobile' : ''}`">
          <div v-for="(stock, index) in item.value" :key="'stock' + index">
            <Stock :name="stock.name" :code="stock.code" />
            [&nbsp;<span :class="calcClassByBidRating(stock.bidRating)">
              {{ stock.bidRating }}
            </span>
            <span
              :class="{
                'red bold':
                  stock.bidChangeTypeT === '竞价抢筹' ||
                  stock.bidChangeTypeT === '大幅高开',
              }"
              >{{ stock.bidChangeTypeT }}
            </span>
            <span class="lanse">{{ stock.price }}</span>
            <!-- 换手率 -->
            <span v-if="stock.turnoverRate">
              换手率{{ stock.turnoverRate }}%
            </span>
            <span class="zise">流通{{ stock.circulationValue }}亿</span>
            <span class="zise">集中度70 {{ stock.cmjzd }}%</span>
            <span>获利比例 {{ stock.hlbl }}%</span>
            <span :class="{ 'red bold': stock.bidIncreaseT >= 3 }">
              竞价涨幅
              {{ stock.bidIncreaseT && +stock.bidIncreaseT.toFixed(2) }}
            </span>
            ] - 收盘涨幅
            <span
              :class="{
                'red bold': stock.closeIncrease - stock.bidIncreaseT >= 0,
              }"
              >{{ stock.closeIncrease }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import _ from 'lodash-es';
import { computed } from 'vue';
import { params } from 'pay-back-core';
import { calcClassByBidRating } from '../utils';

let superData = defineProps({
  propsData: {
    type: Object,
    default: () => {},
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const chooseStock1Expected = params.chooseStock1Expected;

const stockGroupByPlate = computed(() => {
  const biddingData = superData.propsData
    ? _.cloneDeep(superData.propsData.chooseStock1Expected)
    : // ? _.cloneDeep(superData.propsData.chooseStock1to2)
      null;

  const stockGroupByPlate: any = {};
  // 按 行业板块 将涨停个股分类
  biddingData &&
    biddingData.forEach((item: any) => {
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

.col2 {
  span {
    display: inline-block;
    width: 100px;
  }
  &.isMobile {
    span {
      width: auto;
    }
  }
}
</style>
