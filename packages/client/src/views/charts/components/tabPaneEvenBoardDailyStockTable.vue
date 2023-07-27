<!-- // 涨停分类 -->
<!-- 分类 股票（红色：连板 青色： 反包） -->
<!-- 赤橙黄绿青蓝紫 -->
<!-- 封单大于 1亿的 标红 -->
<template>
  <div :class="['table', { isMobile }]">
    <div class="table__container">
      <div class="table__header table-row">
        <div class="col1">行业板块</div>
        <div class="col2 red">
          涨停个股（{{ data.dailyLimitQuantity }}）
          <span
            v-for="(item, index) in data.ticaiData"
            :key="'span' + index"
            @click="handleTicaiClick(item.key)"
          >
            {{ item.key }}{{ item.value }}&nbsp;
          </span>
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
        <div class="col2">
          <div v-for="(stock, index) in item.value" :key="'stock' + index">
            <Stock
              v-if="stock.evenBoardHeight != 1"
              class="red"
              :name="stock.name + '(' + stock.evenBoardHeight + ')'"
              :code="stock.code"
            />
            <Stock v-else :name="stock.name" :code="stock.code" />
            <el-tag v-if="stock.type === 1" size="small" round> 创 </el-tag>
            <el-tag v-else-if="stock.type === 2" size="small" type="info" round>
              其它
            </el-tag>
            &nbsp;[&nbsp;
            <span
              class="orange"
              v-html="highlightKeyWord(stock.reason, keyword)"
            ></span>
            ，<span class="lanse">{{ stock.price }}</span> ，<span
              :class="{ red: stock.closingFunds > 1 }"
              >封单{{ stock.closingFunds }}亿</span
            >， <span class="zise">流通{{ stock.circulationValue }}亿</span>，
            {{ stock.dailyTime }}
            <span class="lvse" v-if="stock.openTimes > 0">
              {{ stock.openTimes }}
            </span>
            ] <span class="red bold">{{ getExpected(stock) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import _ from 'lodash-es';
import { computed } from 'vue';
import { highlightKeyWord, getExpected } from '../utils';

let emit = defineEmits(['update:data']); //自定义的更新num事件
let superData = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  title: {
    type: String,
    default: '',
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isHangye: {
    type: Boolean,
    default: false,
  },
});

let keyword = '';

const stockGroupByPlate = computed(() => {
  const data = _.cloneDeep(superData.data);

  const stockGroupByPlate: any = {};
  // 按 行业板块 将涨停个股分类
  data.evenBoardData &&
    Object.keys(data.evenBoardData).forEach((key: string) => {
      Array.isArray(data.evenBoardData[key]) &&
        data.evenBoardData[key].forEach((item: any) => {
          // 按板块划分 涨停数据
          if (!stockGroupByPlate[item.plateLevel2]) {
            stockGroupByPlate[item.plateLevel2] = [];
          }

          let repeatStock;
          item.evenBoardHeight = key;
          if (key === 'gaobiao') {
            repeatStock = stockGroupByPlate[item.plateLevel2].find(
              (stock: any) => stock.name === item.name,
            );
          }

          // 去重处理，合并连板数据
          if (repeatStock) {
            if (repeatStock.evenBoardHeight === '1') {
              repeatStock.evenBoardHeight = item.evenDays;
            } else {
              repeatStock.evenBoardHeight += '，' + item.evenDays;
            }
          } else {
            stockGroupByPlate[item.plateLevel2].push(item);
          }
        });
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
    o.value = sortStocks(stockGroupByPlate[key]);
    // 板块内 个股按 连板高度 => 首次涨停时间降序
    stockGroupByPlateArr.push(o);
  });

  // 按 行业板块 涨停数量降序
  stockGroupByPlateArr.sort((a: any, b: any) => {
    return b.value.length - a.value.length;
  });
  return stockGroupByPlateArr;
}

function sortStocks(stocks: []) {
  stocks.sort((a: any, b: any) => {
    if (
      a.evenBoardHeight.indexOf('，') > -1 &&
      b.evenBoardHeight.indexOf('，') > -1
    ) {
      return (
        +a.evenBoardHeight.split('，')[0] - +b.evenBoardHeight.split('，')[0]
      );
    }
    if (a.evenBoardHeight.indexOf('天') > -1) {
      if (a.evenBoardHeight.indexOf('，') > -1) {
        return +a.evenBoardHeight.split('，')[0] >= +b.evenBoardHeight ? -1 : 1;
      }
      return -1;
    }
    // if (b.evenBoardHeight.indexOf('天') > -1) {
    //   if (b.evenBoardHeight.indexOf('，') > -1) {
    //     return +b.evenBoardHeight.split('，')[0] >= +a.evenBoardHeight ? 1 : -1;
    //   }
    //   return -1;
    // }

    return b.evenBoardHeight - a.evenBoardHeight;
  });
  return stocks;
}

function handleTicaiClick(key: string) {
  keyword = key;

  // 修改父组件传过来的值
  emit('update:data', _.cloneDeep(superData.data));
}
</script>

<style scoped lang="less">
@import '../styles/tabPaneEvenBoardStockTable.less';
</style>
