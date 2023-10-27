<!-- // 涨停分类 -->
<!-- 分类 股票（红色：连板 青色： 反包） -->
<!-- 赤橙黄绿青蓝紫 -->
<!-- 封单大于 1亿的 标红 -->
<template>
  <div :class="['table', { isMobile }]">
    <div class="table__container">
      <div
        class="table__header table-row"
        @click="
          () => {
            data.isShowContent = !data.isShowContent;
          }
        "
      >
        <div class="col1">
          行业板块 ({{ stockGroupByPlateByFilter.length }})
        </div>
        <div class="col2 red flex__row">
          <!-- 涨停个股 过滤条件 -->
          <div class="dailyLimit__content flex__row_header">
            <div class="stocks_header">
              {{ title || '今日 - 涨停个股' }} ({{
                currentDateData.dailyLimitQuantity
              }})<el-tooltip
                effect="dark"
                popper-class="thsTooltip__content"
                :content="params.dailyLimitYesterday"
                placement="top"
              >
                <el-icon
                  @click.stop="openNewIwencaiWindow(params.dailyLimitYesterday)"
                  class="thsTooltip__icon"
                  ><InfoFilled
                /></el-icon>
              </el-tooltip>

              <span class="dateTime__span">{{ updateTime }}</span>

              <span
                v-for="(item, index) in currentDateData.ticaiData"
                :key="'span' + index"
                @click.stop="handleTicaiClick(item.key)"
                class="ticai__item"
              >
                {{ item.key }}{{ item.value }}&nbsp;
              </span>
            </div>

            <div>
              <el-checkbox v-model="data.myStrategyChecked">
                <div class="stocks_header">
                  我的策略 ({{ data.myStrategyCheckedNum }})&nbsp;
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="价格低于30元，流通市值20-120亿，非ST，非科创，非创业板"
                    placement="top"
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
              </el-checkbox>
              <el-checkbox v-model="data.firstBoardChecked"> 首板 </el-checkbox>
              <el-checkbox v-model="data.notFirstBoardChecked">
                连板
              </el-checkbox>
            </div>
          </div>
          <!-- 集合竞价 过滤条件 -->
          <div v-if="showBidding" class="biddingData__filter--row">
            <el-checkbox v-model="data.biddingStrategyChecked">
              <div class="stocks_header">
                竞价策略 ({{ data.biddingStrategyCheckedNum }})&nbsp;
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="看多，超预期或符合预期；换手率>=5%，竞价量比大于10（连板及反包除外）"
                  placement="top"
                >
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
                <span class="red bold">
                  &nbsp;{{
                    (
                      data.dailyLimitNum / data.biddingStrategyCheckedNum
                    ).toFixed(2)
                  }}
                </span>
              </div>
            </el-checkbox>
            <el-checkbox v-model="data.exceededExpect">超预期</el-checkbox>
            <el-checkbox v-model="data.conformToExpect">符合预期</el-checkbox>
            <el-checkbox v-model="data.openDailyLimimExclude">
              去一字
            </el-checkbox>
            <el-checkbox v-model="data.closeDailyLimit">收盘涨停</el-checkbox>
          </div>
        </div>
      </div>

      <transition name="h1">
        <div v-show="data.isShowContent" class="table__content">
          <div
            class="table-row"
            v-for="(item, key) in stockGroupByPlateByFilter"
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
              <div
                class="dailyLimit__row"
                v-for="(stock, index) in item.value"
                :key="'stock' + index"
              >
                <div class="dailyLimit__content">
                  <Stock
                    v-if="stock.evenBoardHeight != 1"
                    class="red large"
                    :name="stock.name + '(' + stock.evenBoardHeight + ')'"
                    :code="stock.code"
                  />
                  <Stock
                    v-else
                    class="large"
                    :name="stock.name"
                    :code="stock.code"
                  />
                  &nbsp;[&nbsp;
                  <span
                    class="orange content-large"
                    v-html="highlightKeyWord(stock.reason, keyword)"
                  ></span>
                  <span class="lanse small">{{ stock.price }}</span>
                  <span
                    :class="{
                      'red bold': stock.closingFunds > 1,
                      large: true,
                    }"
                  >
                    封单 {{ stock.closingFunds }} 亿
                  </span>
                  <!-- 换手率 -->
                  <span
                    v-if="stock.turnoverRate"
                    :class="calcClass(stock)"
                    class="content-middle"
                  >
                    换手 {{ stock.turnoverRate }}%
                  </span>
                  <span class="zise content-middle">
                    流通 {{ stock.circulationValue }} 亿
                  </span>
                  <span class="large">
                    {{ transformTime(stock.dailyTime) }}
                  </span>
                  <span class="lvse small text-center">
                    {{ stock.openTimes }}
                  </span>
                  ]
                  <span class="red bold small">{{
                    getExpectedStr(stock)
                  }}</span>
                  <span class="red middle"
                    >&nbsp;&nbsp;{{ stock.turnoverType }}</span
                  >
                </div>
                <TabPaneEvenBoardBiddingDataRow
                  v-if="showBidding"
                  :stock="stock.biddingData"
                />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script lang="ts" setup>
import _ from 'lodash-es';
import TabPaneEvenBoardBiddingDataRow from './tabPaneEvenBoardBiddingDataRow.vue';
import { reactive, computed } from 'vue';
import { highlightKeyWord, openNewIwencaiWindow, isDailyLimit } from '../utils';
import { dailyLimitOptionalStrategy, getExpected, params } from 'pay-back-core';
import { DailyLimitStockDto } from '@/typings';
import dayjs from 'dayjs';

let emit = defineEmits(['update:currentDateData']); //自定义的更新num事件
let superData = defineProps({
  currentDateData: {
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
  showBidding: {
    type: Boolean,
    default: false,
  },
  isHangye: {
    type: Boolean,
    default: false,
  },
  updateTime: {
    type: String,
    default: '',
  },
});

const data = reactive({
  // 连板
  notFirstBoardChecked: false,
  // 首板
  firstBoardChecked: false,
  // 我的策略
  myStrategyChecked: false,
  myStrategyCheckedNum: 0,
  // 竞价策略
  biddingStrategyChecked: false,
  biddingStrategyCheckedNum: 0,
  // 涨停数量
  dailyLimitNum: 0,
  // 超预期
  exceededExpect: false,
  // 符合预期
  conformToExpect: false,
  // 收盘涨停
  closeDailyLimit: false,
  // 排除 竞价涨停
  openDailyLimimExclude: false,
  isShowContent: true,
});

let keyword = '';

/**
 * 高标的首板 竞价策略 也需要过滤
 */
const stockGroupByPlate: any = computed(() => {
  const currentDateData = _.cloneDeep(superData.currentDateData);

  if (!currentDateData.evenBoardData) return [];

  const stockGroupByPlateTemp: any = {};
  // 按 行业板块 将涨停个股分类
  Object.keys(currentDateData.evenBoardData).forEach((key: string) => {
    Array.isArray(currentDateData.evenBoardData[key]) &&
      currentDateData.evenBoardData[key].forEach((item: any) => {
        // 按板块划分 涨停数据
        if (!stockGroupByPlateTemp[item.plateLevel2]) {
          stockGroupByPlateTemp[item.plateLevel2] = [];
        }

        let repeatStock;
        item.evenBoardHeight = key;
        if (key === 'gaobiao') {
          repeatStock = stockGroupByPlateTemp[item.plateLevel2].find(
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
          stockGroupByPlateTemp[item.plateLevel2].push(item);
        }
      });
  });

  return stockGroupByPlateTemp;
});

/**
 * 按条件过滤后的数据，基本策略 或 竞价策略 等
 */
const stockGroupByPlateByFilter = computed(() => {
  const stockGroupByPlateCopy: any = {};

  data.myStrategyCheckedNum = 0;
  data.biddingStrategyCheckedNum = 0;
  data.dailyLimitNum = 0;

  // 遍历 按板块 划分后的数据
  let isAdd = true;
  Object.keys(stockGroupByPlate.value).forEach((key: string) => {
    stockGroupByPlateCopy[key] = stockGroupByPlate.value[key].filter(
      (item: any) => {
        isAdd = true;
        // 需按照首板/我的策略 进行过滤处理
        if (data.firstBoardChecked) {
          const evenBoardHeight = getRealEvenBoardHeight(item, false);
          data.notFirstBoardChecked = false;
          isAdd = evenBoardHeight == 1;
        }
        // 只看连板 则与只看首板冲突
        if (data.notFirstBoardChecked) {
          const evenBoardHeight = getRealEvenBoardHeight(item, false);
          data.firstBoardChecked = false;
          isAdd = evenBoardHeight != 1;
        }
        if (data.myStrategyChecked && isAdd) {
          isAdd = dailyLimitOptionalStrategy(item, item.evenBoardHeight);
        }
        isAdd && data.myStrategyCheckedNum++;

        // 竞价条件过滤 2023-09-09 00:21:30
        if (item.biddingData && isAdd) {
          // 收盘涨停
          if (data.closeDailyLimit && isAdd) {
            isAdd = isDailyLimit(item.code, +item.biddingData.closeIncrease);
          }
          // 排除 开盘一字板
          if (data.openDailyLimimExclude && isAdd) {
            isAdd = !isDailyLimit(item.code, +item.biddingData.bidIncreaseT);
          }

          // 超预期
          if ((data.exceededExpect || data.conformToExpect) && isAdd) {
            if (data.exceededExpect && data.conformToExpect) {
              isAdd =
                item.biddingData.expected === 2 ||
                item.biddingData.expected === 1;
            } else {
              isAdd =
                item.biddingData.expected === (data.conformToExpect ? 1 : 2);
            }
          }

          // 看多、符合预期、首板量比大于10，只看主板
          if (data.biddingStrategyChecked && isAdd) {
            // ============ 竞价策略：高标的首板不能按首板考虑 !!!!!!============
            const evenBoardHeight = getRealEvenBoardHeight(item);
            // if(item.evenBoardHeight)
            isAdd = isConformToMyStrategyChecked({ ...item, evenBoardHeight });
          }
          // 竞价符合条件个数
          isAdd && data.biddingStrategyCheckedNum++;

          // 符合条件的个股 收盘涨停个数 +1
          isAdd &&
            isDailyLimit(item.code, +item.biddingData.closeIncrease) &&
            data.dailyLimitNum++;
        }

        return isAdd;
      },
    );
  });

  return sortPlates(stockGroupByPlateCopy);
});

/**
 * 获取个股真正的 高度
 * 竞价时 反包首板，不能按正常首板考量
 * 其他情况，可按首板考虑
 */
function getRealEvenBoardHeight(item: any, isBiddingMode = true) {
  // 反包板
  if (item.evenBoardHeight.indexOf('天') > -1) {
    // 包含天，但不包含 ， 不为首板
    if (item.evenBoardHeight.indexOf('，') > -1) {
      return item.evenBoardHeight.split('，')[0];
    }
    // 反包首板
    return isBiddingMode ? 2 : 1;
  }
  return item.evenBoardHeight;
}

/**
 * 是否符合预期
 */
function isConformToMyStrategyChecked(stock: any) {
  // 只看主板
  if (stock.code.startsWith('3') || stock.code.startsWith('688')) {
    return false;
  }

  const biddingData = stock.biddingData;
  // 竞价看多，超预期或符合预期
  let isConform =
    biddingData.bidRating === '看多' &&
    (biddingData.expected === 2 || biddingData.expected === 1);
  // 首板 必须竞价量比大于10，换手率>=5%
  if (stock.evenBoardHeight === '1' && isConform) {
    isConform =
      biddingData.bidVolumeRatio >= 10 &&
      (stock.turnoverRate ? stock.turnoverRate >= 5 : true);
  }

  return isConform;
}

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
    // 板块内 个股按 连板高度降序 => 首次涨停时间降序
    o.value = sortStocks(stockGroupByPlate[key]);
    stockGroupByPlateArr.push(o);
  });

  // 按 行业板块 涨停数量降序
  stockGroupByPlateArr.sort((a: any, b: any) => {
    return b.value.length - a.value.length;
  });
  return stockGroupByPlateArr;
}

/**
 * 个股排序 板块内 个股按 连板高度降序 => 首次涨停时间降序
 * @param stocks
 */
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

    return b.evenBoardHeight - a.evenBoardHeight;
  });
  // 首板按涨停时间排序
  stocks.sort((a: any, b: any) => {
    if (a.evenBoardHeight != '1' || b.evenBoardHeight != '1') {
      return 0;
    }
    const aStart =
      a.dailyTime.indexOf(',') > -1 ? a.dailyTime.split(',')[0] : a.dailyTime;
    const bStart =
      b.dailyTime.indexOf(',') > -1 ? b.dailyTime.split(',')[0] : b.dailyTime;

    return dayjs('2023-09-05' + aStart).isBefore(dayjs('2023-09-05' + bStart))
      ? -1
      : 1;
  });
  return stocks;
}

function handleTicaiClick(key: string) {
  keyword = key;

  // 修改父组件传过来的值
  emit('update:currentDateData', _.cloneDeep(superData.currentDateData));
}

/**
 * 处理时间格式，如果秒为0 则去除
 * @param time
 */
function transformTime(time: string): string {
  if (time.indexOf(',') === -1) {
    // 去除秒，如果秒为0
    return (
      time.slice(0, -3) + (time.slice(-2) === '00' ? '' : ':' + time.slice(-2))
    );
  }
  const times = time.split(',');
  const start = transformTime(times[0]);
  const end = transformTime(times[1]);
  return start + ',' + end;
}

/**
 * 根据换手率 标注颜色
 * @param turnoverRate
 */
function calcClass(stock: any) {
  // 仅首板 会加上 颜色区分
  if (stock.evenBoardHeight != 1) {
    return;
  }

  const turnoverRate: number = stock.turnoverRate;
  if (turnoverRate < 5) {
    return 'green';
  }
  if (turnoverRate > 5 && turnoverRate < 10) {
    return 'bold red';
  }
  return '';
}

function getExpectedStr(stock: DailyLimitStockDto) {
  // 期待值
  const expected: string = getExpected(stock);
  if (expected.indexOf(',') === -1) {
    return `${expected}%`;
  }
  const expectedArr = expected.split(',');
  return `${expectedArr[0]}-${expectedArr[1]}%`;
}
</script>

<style scoped lang="less">
@import '../styles/tabPaneEvenBoardStockTable.less';

.flex__row,
.flex__row_header {
  display: flex;
  align-items: center;
}

.flex__row_header {
  justify-content: space-between;
  padding-right: 20px;
  font-size: 14px;
}

.ticai__item:hover {
  color: #000;
  background-color: yellow;
}
.dailyLimit__row {
  display: flex;

  &:hover {
    background-color: #ccc;
  }
}
.dailyLimit__content {
  min-width: 990px;
  overflow: auto;
  /deep/ span {
    display: inline-block;
  }
}
.biddingData__filter--row {
  min-width: 520px;
  overflow: auto;

  .el-checkbox {
    margin-right: 10px;
  }
}

/* 进入之前和离开后的样式 */
.h1-enter-from,
.h1-leave-to {
  opacity: 0;
}
/* 离开和进入过程中的样式 */
.h1-enter-active,
.h1-leave-active {
  /* 添加过渡动画 */
  transition: opacity 0.1s ease;
}
/* 进入之后和离开之前的样式 */
.h1-enter-to,
.h1-leave-from {
  opacity: 1;
}
</style>
