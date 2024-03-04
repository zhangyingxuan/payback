<!-- // 涨停分类 -->
<!-- 分类 股票（红色：连板 青色： 反包） -->
<!-- 赤橙黄绿青蓝紫 -->
<!-- 封单大于 1亿的 标红 -->
<template>
  <div :class="['table', { isMobile }]">
    <div class="table__header table-row">
      <div
        class="col1"
        @click="
          () => {
            data.isShowContent = !data.isShowContent;
          }
        "
      >
        行业板块&nbsp;
        <el-icon v-if="!isMobile"><ArrowDownBold /></el-icon>
      </div>
      <div class="col2 red flex__row">
        <!-- 涨停个股 过滤条件 -->
        <div class="dailyLimit__content flex__row_header">
          <div class="stocks_header">
            {{ title || defaultTitle }}
            ({{ currentDateData.dailyLimitQuantity }})
            <el-tooltip
              effect="dark"
              popper-class="thsTooltip__content"
              :content="
                title ? params.dailyLimitYesterday : params.dailyLimitMoreThan1
              "
              placement="top"
            >
              <el-icon
                @click.stop="
                  openNewIwencaiWindow(
                    title
                      ? params.dailyLimitYesterday
                      : params.dailyLimitMoreThan1,
                  )
                "
                class="thsTooltip__icon"
                ><InfoFilled
              /></el-icon>
            </el-tooltip>
            <el-button
              v-if="isShowRefreshBtn"
              @click="refreshBindingData"
              style="margin: 0 5px"
              type="primary"
              plain
              size="small"
            >
              更新{{ showBidding ? '竞价' : '短线' }}
            </el-button>

            <span class="dateTime__span">{{ updateTime }}</span>

            <span
              v-for="(item, index) in currentDateData.ticaiData"
              :key="'span' + index"
              @click.stop="handleTicaiClick(item.key)"
              :class="{
                ticai__item: true,
                searchWord: data.keyword === item.key,
              }"
            >
              {{ item.key }}{{ item.value }}&nbsp;
            </span>
          </div>

          <div class="stocks_header">
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
            <el-checkbox
              v-model="data.firstBoardChecked"
              @change="handleFirstBoardChecked"
            >
              首板
            </el-checkbox>
            <el-checkbox
              v-model="data.notFirstBoardChecked"
              @change="handleNotFirstBoardChecked"
            >
              连板
            </el-checkbox>
            <el-select
              class="select"
              v-model="data.evenBoardHeight"
              placeholder="连板高度"
              size="small"
            >
              <el-option
                v-for="(item, index) in data.evenBoardHeightOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
                content="超预期；换手率>=5%，竞价量比大于10（连板及反包除外）"
                placement="top"
              >
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
              <span class="red bold">
                &nbsp;{{
                  (data.dailyLimitNum / data.biddingStrategyCheckedNum).toFixed(
                    2,
                  )
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

    <TabPaneEvenBoardDailyStockTableHeader
      :showBidding="showBidding"
      :platesLength="stockGroupByPlateByFilter.length"
    />

    <div
      v-show="data.isShowContent"
      class="table-row"
      v-for="(item, key) in stockGroupByPlateByFilter"
      :key="key"
    >
      <div class="col1">
        <PlateCol
          :item="item"
          :isMobile="isMobile"
          :showBidding="showBidding"
        />
      </div>
      <div class="col2">
        <div
          class="dailyLimit__row"
          v-for="(stock, index) in item.value"
          :key="'stock' + index"
        >
          <ColsStockInfo
            :stock="stock"
            v-show="stock.isAdd"
            :keyword="data.keyword"
          />
          <ColsBiddingData
            v-if="showBidding"
            :stock="stock.biddingData"
            v-show="stock.isAdd"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import _ from 'lodash-es';
import ColsBiddingData from './colsBiddingData.vue';
import ColsStockInfo from './colsStockInfo.vue';
import TabPaneEvenBoardDailyStockTableHeader from './header.vue';
import PlateCol from './plateCol.vue';
import { reactive, computed } from 'vue';
import { openNewIwencaiWindow, isDailyLimit, isMainPlate } from '../../utils';
import { dailyLimitOptionalStrategy, params } from 'pay-back-core';
import dayjs from 'dayjs';
import { DailyLimitStockDto } from '@/typings';

const defaultTitle = '今日 - 涨停个股';
let emit = defineEmits(['refreshBindingData']);
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

interface Option {
  label: string;
  value: number;
}
const data: {
  notFirstBoardChecked: boolean;
  firstBoardChecked: boolean;
  myStrategyChecked: boolean;
  myStrategyCheckedNum: number;
  biddingStrategyChecked: boolean;
  biddingStrategyCheckedNum: number;
  dailyLimitNum: number;
  exceededExpect: boolean;
  conformToExpect: boolean;
  closeDailyLimit: boolean;
  openDailyLimimExclude: boolean;
  isShowContent: boolean;
  evenBoardHeight: number;
  evenBoardHeightOptions: Array<Option>;
  keyword: string;
} = reactive({
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
  // 展开折叠表格
  isShowContent: true,
  // 连板高度，-1代表全部
  evenBoardHeight: -1,
  // 连板高度可选项
  evenBoardHeightOptions: [],
  keyword: '',
});

/**
 * 按板块分类的个股（高标的首板 竞价策略 也需要过滤）
 */
const stockGroupByPlate: any = computed(() => {
  const currentDateData = _.cloneDeep(superData.currentDateData);
  const evenBoardHeightOptions = new Set();

  if (!currentDateData.evenBoardData) return [];

  const stockGroupByPlateTemp: any = {};
  // 按 行业板块 将涨停个股分类
  Object.keys(currentDateData.evenBoardData).forEach((key: string) => {
    Array.isArray(currentDateData.evenBoardData[key]) &&
      currentDateData.evenBoardData[key].forEach((item: DailyLimitStockDto) => {
        // 按板块划分 涨停数据
        if (!stockGroupByPlateTemp[item.plateLevel2]) {
          stockGroupByPlateTemp[item.plateLevel2] = [];
          stockGroupByPlateTemp[item.plateLevel2].closingFundsTotal = 0;
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
          // 合并板块封板资金总数 2024-03-04 17:15:02
          stockGroupByPlateTemp[item.plateLevel2].closingFundsTotal +=
            item.closingFunds;
          evenBoardHeightOptions.add(item.evenBoardHeight);
        }
      });
  });

  // 将对象转换为数组 便于排序
  const stockGroupByPlateArr: any[] = [];
  Object.keys(stockGroupByPlateTemp).forEach(key => {
    let o = {
      key: '',
      value: [],
      closingFundsTotal: stockGroupByPlateTemp[key].closingFundsTotal,
    };
    o.key = key;
    // 板块内 个股按 连板高度降序 => 首次涨停时间降序
    o.value = sortStocks(stockGroupByPlateTemp[key]);
    stockGroupByPlateArr.push(o);
  });

  // 连板高度 可选项
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  data.evenBoardHeightOptions = Array.from(evenBoardHeightOptions)
    .map((item: any) => {
      return {
        label: item,
        value: +item,
      };
    })
    .sort((a: any, b: any) => {
      return b.value - a.value;
    });
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  data.evenBoardHeightOptions.unshift({
    label: '全部',
    value: -1,
  });
  return stockGroupByPlateArr;
});

/**
 * 按条件过滤后的数据，基本策略 或 竞价策略 等
 */
const stockGroupByPlateByFilter = computed(() => {
  const stockGroupByPlateCopy: any = _.cloneDeep(stockGroupByPlate.value);
  let myStrategyCheckedNum = 0;
  let biddingStrategyCheckedNum = 0;
  let dailyLimitNum = 0;

  // 遍历 按板块 划分后的数据
  let isAdd = true;
  stockGroupByPlateCopy.forEach((plateData: any) => {
    let len = 0;
    plateData.value.forEach((item: DailyLimitStockDto) => {
      isAdd = true;
      const evenBoardHeight = getRealEvenBoardHeight(item, false);
      // 需按照首板/我的策略 进行过滤处理
      if (data.firstBoardChecked) {
        isAdd = evenBoardHeight == 1;
      }
      // 只看连板 则与只看首板冲突
      if (data.notFirstBoardChecked) {
        isAdd = evenBoardHeight != 1;
      }
      if (data.myStrategyChecked && isAdd) {
        isAdd = dailyLimitOptionalStrategy(item, item.evenBoardHeight);
      }
      if (data.evenBoardHeight != -1 && isAdd) {
        isAdd = data.evenBoardHeight == evenBoardHeight;
      }
      // 新增 过滤题材的功能，题材梯队整理 2024-03-04 15:50:37
      if (data.keyword && isAdd) {
        isAdd = item.reason.indexOf(data.keyword) > -1;
      }
      isAdd && myStrategyCheckedNum++;

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
          isAdd = isConformToMyStrategyChecked({ ...item, evenBoardHeight });
        }
        // 竞价符合条件个数
        isAdd && biddingStrategyCheckedNum++;

        // 符合条件的个股 收盘涨停个数 +1
        isAdd &&
          isDailyLimit(item.code, +item.biddingData.closeIncrease) &&
          dailyLimitNum++;
      }

      // 标记 个数
      item.isAdd = isAdd;
      isAdd && len++;
    });

    plateData.len = len;
  });

  // 更新 各种数量
  updateNums(myStrategyCheckedNum, biddingStrategyCheckedNum, dailyLimitNum);

  return sortPlates(stockGroupByPlateCopy);
});

function updateNums(
  myStrategyCheckedNum: number,
  biddingStrategyCheckedNum: number,
  dailyLimitNum: number,
) {
  data.myStrategyCheckedNum = myStrategyCheckedNum;
  data.biddingStrategyCheckedNum = biddingStrategyCheckedNum;
  data.dailyLimitNum = dailyLimitNum;
}

/**
 * 点击 首板复选框
 */
function handleFirstBoardChecked(checked: any) {
  data.firstBoardChecked = checked;
  data.notFirstBoardChecked = false;
}
/**
 * 点击 连板复选框
 */
function handleNotFirstBoardChecked(checked: any) {
  data.notFirstBoardChecked = checked;
  data.firstBoardChecked = false;
}

/**
 * 按条件过滤后的数据，基本策略 或 竞价策略 等
 */
const isShowRefreshBtn = computed(() => {
  const today = dayjs();
  const updateTime = dayjs(today.year() + '/' + superData.updateTime);
  // 当日数据 且 展示昨日涨停个股
  return today.isSame(updateTime, 'day');
});

/**
 * 获取个股真正的 高度
 * 竞价时 反包首板，不能按正常首板考量
 * 其他情况，可按首板考虑
 */
function getRealEvenBoardHeight(item: any, isBiddingMode = true) {
  if (!item) {
    return 0;
  }
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
  if (!isMainPlate(stock.code)) {
    return false;
  }

  const biddingData = stock.biddingData;
  // 超预期
  let isConform = biddingData.expected === 2;
  // 首板 必须竞价量比大于10，换手率>=5%
  if (stock.evenBoardHeight === '1' && isConform) {
    isConform =
      biddingData.bidVolumeRatio >= 10 &&
      (stock.turnoverRate ? stock.turnoverRate >= 5 : true);
  }

  return isConform;
}
/**
 * 刷新竞价数据
 */
const refreshBindingData = _.debounce(() => {
  // superData.title有值则 刷新竞价数据，否则刷新短线数据
  emit('refreshBindingData', superData.title);
}, 500);

/**
 * 按板块排序 排序
 * @param stockGroupByPlate
 */
function sortPlates(stockGroupByPlateArr: any) {
  // 1. 按 行业板块 涨停数量降序
  stockGroupByPlateArr.sort((a: any, b: any) => {
    return b.value.length - a.value.length;
  });
  // 2. 按 满足筛选条件 个数数量 降序
  stockGroupByPlateArr.sort((a: any, b: any) => {
    return b.value.len - a.value.len;
  });

  //  3. 连板情况 或 题材过滤时，强制按连板高度排序
  let aHeight, bHeight, aStock, bStock;
  if (data.notFirstBoardChecked || data.keyword) {
    stockGroupByPlateArr.sort((a: any, b: any) => {
      // 取出板块内满足条件的最高连板的 个股 2024-03-04 16:37:51
      aStock = a.value.find((stock: any) => {
        return stock.isAdd;
      });
      bStock = b.value.find((stock: any) => {
        return stock.isAdd;
      });
      aHeight = +getRealEvenBoardHeight(aStock, true);
      bHeight = +getRealEvenBoardHeight(bStock, true);
      return bHeight - aHeight;
    });
  }

  // 4. 超预期过滤时，按板块达标率排序

  return stockGroupByPlateArr;
}

/**
 * 个股排序 板块内 个股按 连板高度降序 => 首次涨停时间降序
 * @param stocks
 */
function sortStocks(stocks: []) {
  // 首板按涨停时间排序
  stocks.sort((a: any, b: any) => {
    // if (a.evenBoardHeight != '1' || b.evenBoardHeight != '1') {
    //   return 0;
    // }
    const aStart =
      a.dailyTime.indexOf(',') > -1 ? a.dailyTime.split(',')[0] : a.dailyTime;
    const bStart =
      b.dailyTime.indexOf(',') > -1 ? b.dailyTime.split(',')[0] : b.dailyTime;

    return dayjs('2023-09-05' + aStart).isBefore(dayjs('2023-09-05' + bStart))
      ? -1
      : 1;
  });

  let aHeight, bHeight;
  // 连板高度降序
  stocks.sort((a: any, b: any) => {
    aHeight = +getRealEvenBoardHeight(a, true);
    bHeight = +getRealEvenBoardHeight(b, true);

    return bHeight - aHeight;
  });
  return stocks;
}

function handleTicaiClick(key: string) {
  if (data.keyword === key) {
    data.keyword = '';
  } else {
    data.keyword = key;
  }
}
</script>

<style scoped lang="less">
@import '../../styles/tabPaneEvenBoardStockTable.less';

.flex__row,
.flex__row_header {
  display: flex;
  align-items: center;
}

.flex__row_header {
  justify-content: space-between;
  font-size: 14px;
}
.select {
  width: 60px;
  margin-right: 10px !important;
}
</style>
