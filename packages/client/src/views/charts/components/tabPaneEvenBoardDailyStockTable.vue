<!-- // 涨停分类 -->
<!-- 分类 股票（红色：连板 青色： 反包） -->
<!-- 赤橙黄绿青蓝紫 -->
<!-- 封单大于 1亿的 标红 -->
<template>
  <div :class="['table', { isMobile }]">
    <div class="table__container">
      <div class="table__header table-row">
        <div class="col1">行业板块</div>
        <div class="col2 red flex__row">
          涨停个股（{{ evenBoardData.dailyLimitQuantity }}）
          <span
            v-for="(item, index) in evenBoardData.ticaiData"
            :key="'span' + index"
            @click="handleTicaiClick(item.key)"
            class="ticai__item"
          >
            {{ item.key }}{{ item.value }}&nbsp;
          </span>
          <span>
            <el-checkbox v-model="data.myStrategyChecked"
              >我的策略 ({{ data.myStrategyCheckedLen }})
              <el-tooltip
                class="box-item"
                effect="dark"
                content="价格低于30元，流通市值20-120亿，非ST，非科创，非创业板"
                placement="top"
              >
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </el-checkbox>
            <el-checkbox v-model="data.firstBoardChecked">只看首板</el-checkbox>
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
            <!-- <Plate :code="plate.code" :name="plate.name" /> -->
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
            <span class="red">{{ stock.turnoverType }}</span>
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
import { reactive, computed } from 'vue';
import { highlightKeyWord, getExpected } from '../utils';
import { dailyLimitOptionalStrategy } from 'pay-back-core';

let emit = defineEmits(['update:evenBoardData']); //自定义的更新num事件
let superData = defineProps({
  evenBoardData: {
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

const data = reactive({
  // 首板
  firstBoardChecked: false,
  // 我的策略
  myStrategyChecked: false,
  myStrategyCheckedLen: 0,
});

let keyword = '';

const stockGroupByPlate = computed(() => {
  const evenBoardData = _.cloneDeep(superData.evenBoardData);
  data.myStrategyCheckedLen = 0;

  const stockGroupByPlate: any = {};
  let isAdd = true;
  // 按 行业板块 将涨停个股分类
  evenBoardData.evenBoardData &&
    Object.keys(evenBoardData.evenBoardData).forEach((key: string) => {
      Array.isArray(evenBoardData.evenBoardData[key]) &&
        evenBoardData.evenBoardData[key].forEach((item: any) => {
          isAdd = true;
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
            // 需按照首板/我的策略 进行过滤处理
            if (data.firstBoardChecked) {
              isAdd = item.evenBoardHeight == 1;
            }
            if (data.myStrategyChecked && isAdd) {
              isAdd = dailyLimitOptionalStrategy(item, item.evenBoardHeight);
              isAdd && data.myStrategyCheckedLen++;
            }
            isAdd && stockGroupByPlate[item.plateLevel2].push(item);
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
  emit('update:evenBoardData', _.cloneDeep(superData.evenBoardData));
}
</script>

<style scoped lang="less">
@import '../styles/tabPaneEvenBoardStockTable.less';

.flex__row {
  display: flex;
  align-items: center;
}

.ticai__item:hover {
  color: #000;
  background-color: yellow;
}
</style>
