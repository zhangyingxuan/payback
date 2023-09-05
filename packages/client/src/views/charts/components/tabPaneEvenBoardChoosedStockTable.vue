<!-- 集合竞价数据 -->
<template>
  <div :class="['table', { isMobile }]" v-if="stockGroupByPlate.length > 0">
    <div class="table__container">
      <div class="table__header table-row">
        <div class="col1">行业板块</div>
        <div class="red">
          1进2选股
          <el-tooltip
            class="box-item"
            effect="dark"
            content="昨日首板涨停；竞价看多；股价低于30元；流通市值<=120亿；>=20亿；首板换手率>=5%；非创业板；非科创板；非ST"
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
            <Stock
              v-if="stock.evenDays"
              class="red"
              :name="stock.name + '(' + stock.evenDays + ')'"
              :code="stock.code"
            />
            <Stock v-else :name="stock.name" :code="stock.code" />
            [&nbsp;<span :class="calcClass(stock.bidRating)">
              {{ stock.bidRating }}
            </span>
            <span :class="{ 'red bold': stock.bidChangeTypeT === '竞价抢筹' }"
              >{{ stock.bidChangeTypeT }}
            </span>
            <span :class="{ 'red bold': stock.bidIncreaseT >= 7 }">
              竞价涨幅
              {{ stock.bidIncreaseT && +stock.bidIncreaseT.toFixed(2) }}
            </span>
            ] - 收盘涨幅
            <span :class="{ 'red bold': stock.closeIncrease >= 5 }">{{
              stock.closeIncrease
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
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
});

const stockGroupByPlate = computed(() => {
  const biddingData = superData.propsData
    ? _.cloneDeep(superData.propsData.chooseStock1to2Dtos)
    : null;

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

function calcClass(bidRating: string) {
  // 看空、看多、偏空、混战
  if (bidRating === '看多') {
    return 'red bold';
  }

  if (bidRating === '看空') {
    return 'green bold';
  }
  if (bidRating === '偏空') {
    return 'green';
  }
  return '';
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
