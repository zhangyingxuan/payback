<!-- 集合竞价数据 -->
<template>
  <div :class="['table', { isMobile }]" v-if="stockGroupByPlate.length > 0">
    <div class="table__container">
      <div class="table__header table-row">
        <div class="col1">行业板块</div>
        <div class="red stocks_header">
          新股
          <el-tooltip
            effect="dark"
            :content="params.chooseStockNewStock"
            placement="top"
          >
            <el-icon
              @click="openNewIwencaiWindow(params.chooseStockNewStock)"
              class="thsTooltip__icon"
              ><InfoFilled
            /></el-icon>
          </el-tooltip>
          <span class="dateTime__span">{{ updateTime }}</span>
        </div>
      </div>
      <div class="table__header table-row">
        <div class="col1">板块名</div>
        <div class="col2">
          <span class="stock large">个股名</span>
          [
          <span class="small">竞价</span>
          <span class="middle">竞价评级</span>
          <span class="middle lanse">股价</span>
          <!-- <span class="middle"> 换手率 </span> -->
          <span class="middle">流通市值</span>
          <span class="middle red">竞价涨幅</span>
          ]&nbsp;&nbsp;
          <span class="middle red">收盘涨幅</span>
          <span class="middle">区间收益</span>
        </div>
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
            <Stock class="large" :name="stock.name" :code="stock.code" />
            [ &nbsp;<span
              class="small"
              :class="calcClassByBidRating(stock.bidRating)"
              >{{ stock.bidRating }}</span
            >
            <span
              class="middle"
              :class="{
                'red bold':
                  stock.bidChangeTypeT === '竞价抢筹' ||
                  stock.bidChangeTypeT === '大幅高开',
              }"
            >
              {{ stock.bidChangeTypeT }}&nbsp;
            </span>
            <span class="lanse middle">{{ stock.price }}</span>
            <!-- 换手率 -->
            <span v-if="stock.turnoverRate" class="middle">
              换手率{{ stock.turnoverRate }} %
            </span>
            <span class="zise middle">{{ stock.circulationValue }}亿</span>
            <span
              :class="{ 'red bold': stock.bidIncreaseT >= 7, middle: true }"
            >
              {{ stock.bidIncreaseT && +stock.bidIncreaseT.toFixed(2) }}
            </span>
            ]&nbsp;&nbsp;
            <span
              :class="{
                'red bold': stock.closeIncrease >= 5,
                green: stock.closeIncrease < 0,
                middle: true,
              }"
            >
              {{ stock.closeIncrease }}
            </span>
            <span
              class="middle"
              :class="
                stock.closeIncrease - stock.bidIncreaseT >= 0
                  ? 'red bold'
                  : 'green'
              "
            >
              {{ (stock.closeIncrease - stock.bidIncreaseT).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { calcClassByBidRating, openNewIwencaiWindow } from '../utils';
import { params } from 'pay-back-core';
import _ from 'lodash-es';
import { computed } from 'vue';
let superData = defineProps({
  propsData: {
    type: Object,
    default: () => {},
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  updateTime: {
    type: String,
    default: '',
  },
});

const stockGroupByPlate = computed(() => {
  const biddingData = _.cloneDeep(superData.propsData);

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
  /deep/.stock,
  span {
    display: inline-block;
  }
  &.isMobile {
    span {
      width: auto;
    }
  }
}
</style>
