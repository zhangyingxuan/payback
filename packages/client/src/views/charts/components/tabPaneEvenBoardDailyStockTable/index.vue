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
        <div class="dailyLimit__content flex__row flex__row_header">
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
              @click="refreshData"
              style="margin: 0 5px"
              type="primary"
              plain
              size="small"
            >
              更新{{ showBidding ? '竞价' : '短线' }}
            </el-button>

            <span class="dateTime__span">{{ updateTime }}</span>

            <el-switch
              v-model="data.isGainianSwitch"
              inline-prompt
              style="
                margin-right: 5px;
                --el-switch-on-color: #409eff;
                --el-switch-off-color: #ff7f00;
              "
              active-text="概念"
              inactive-text="题材"
              @change="
                () => {
                  data.keyword = '';
                }
              "
            />
            <span
              v-for="(item, index) in currentDateData[
                data.isGainianSwitch ? 'gainianData' : 'ticaiData'
              ]"
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
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="价格低于30元，流通市值20-120亿，非ST，非科创，非创业板"
                  placement="top"
                >
                  选股{{ data.myStrategyCheckedNum }}
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
            <el-tooltip
              class="box-item"
              effect="dark"
              content="超预期；换手率>=5%，竞价量比大于10（连板及反包除外）"
              placement="top"
            >
              竞价策略{{ data.biddingStrategyCheckedNum }}
            </el-tooltip>
            &nbsp;

            <el-tooltip
              class="box-item"
              effect="dark"
              :content="`竞价符合条件个股涨停率，涨停数量/符合条件个数=${data.dailyLimitNum}/${data.biddingStrategyCheckedNum}`"
              placement="top"
            >
              <span class="red bold">
                {{
                  (data.dailyLimitNum / data.biddingStrategyCheckedNum).toFixed(
                    2,
                  )
                }}
              </span>
            </el-tooltip>
          </el-checkbox>
          <el-checkbox v-model="data.exceededExpect">
            超预期
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="`超预期率，超预期个数/符合条件个数=${data.exceededExpectNum}/${data.biddingStrategyCheckedNum}`"
              placement="top"
            >
              <span class="red bold">
                &nbsp;{{
                  (
                    data.exceededExpectNum / data.biddingStrategyCheckedNum
                  ).toFixed(2)
                }}
              </span>
            </el-tooltip></el-checkbox
          >

          <el-checkbox v-model="data.conformToExpect">符合预期</el-checkbox>
          <el-checkbox v-model="data.openDailyLimimExclude">
            去一字
          </el-checkbox>
          <el-checkbox v-model="data.closeDailyLimit">收盘涨停</el-checkbox>
        </div>
        <el-icon
          v-if="!isMobile"
          @click="toggleStockFilterRow"
          class="toggleIcon"
        >
          <ArrowDownBold />
        </el-icon>
      </div>
    </div>
    <!-- 个股筛选条件行，高级筛选 -->
    <div
      v-show="data.isShowStockFilterRow"
      class="table__header stockFilter__row"
    >
      <el-select
        v-model="filter.stockType"
        placeholder="选择股票类型"
        size="small"
        class="select"
      >
        <el-option
          v-for="(item, index) in filter.stockTypeOptions"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-checkbox v-model="filter.firstBoardPlateDragon">
        首板寻龙
      </el-checkbox>
      <el-radio-group v-model="filter.dailyLimitTimeType" size="small">
        <el-radio-button
          v-for="(item, index) in filter.dailyLimitTimeTypeOptions"
          :key="index"
          :label="item.value"
          >{{ item.label }}
        </el-radio-button>
      </el-radio-group>

      <el-button
        @click="resetFilter"
        style="margin: 0 5px"
        type="primary"
        plain
        size="small"
      >
        重置
      </el-button>
    </div>

    <TabPaneEvenBoardDailyStockTableHeader
      :showBidding="showBidding"
      :platesLength="stockGroupByPlateByFilter.length"
      @sortByIncompatibleRateDesc="sortByIncompatibleRateDesc"
    />

    <div
      v-show="data.isShowContent"
      class="table-row"
      v-for="(item, key) in stockGroupByPlateByFilter"
      :key="key"
    >
      <div class="col1">
        <ColsPlateInfo
          :item="item"
          :incompatibleRate="item.incompatibleRate"
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
            :isGainianSwitch="data.isGainianSwitch"
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
import { isEmpty, debounce, cloneDeep } from 'lodash-es';
import ColsBiddingData from './colsBiddingData.vue';
import ColsStockInfo from './colsStockInfo.vue';
import ColsPlateInfo from './colsPlateInfo.vue';
import TabPaneEvenBoardDailyStockTableHeader from './header.vue';
import { reactive, computed } from 'vue';
import { openNewIwencaiWindow, isDailyLimit } from '../../utils';
import { dailyLimitOptionalStrategy, params } from 'pay-back-core';
import dayjs from 'dayjs';
import { DailyLimitStockDto } from '@/typings';
import {
  transformObj2Arr,
  getRealEvenBoardHeight,
  isConformToMyStrategyChecked,
  transformAndSortEvenBoardHeightOptions,
  dailyLimitTimeFilter,
  stockTypeFilter,
} from './utils';
import { stockTypeOptions, dailyLimitTimeTypeOptions } from '@/config/index';

const defaultTitle = '今日-涨停个股';
let emit = defineEmits(['refreshData']);
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
const filter = reactive({
  stockType: 'all',
  stockTypeOptions,
  dailyLimitTimeType: 'all',
  dailyLimitTimeTypeOptions,
  firstBoardPlateDragon: false,
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
  exceededExpectNum: number;
  conformToExpect: boolean;
  closeDailyLimit: boolean;
  openDailyLimimExclude: boolean;
  isShowContent: boolean;
  sortPlateByIncompatibleRate: boolean;
  evenBoardHeight: number;
  evenBoardHeightOptions: Array<Option>;
  keyword: string;
  isGainianSwitch: boolean;
  isShowStockFilterRow: boolean;
} = reactive({
  // 连板
  notFirstBoardChecked: false,
  // 首板
  firstBoardChecked: false,
  // 我的策略
  myStrategyChecked: false,
  // 满足策略个股数量
  myStrategyCheckedNum: 0,
  // 竞价策略
  biddingStrategyChecked: false,
  // 竞价满足条件个股数
  biddingStrategyCheckedNum: 0,
  // 涨停数量
  dailyLimitNum: 0,
  // 超预期
  exceededExpect: false,
  // 超预期数量
  exceededExpectNum: 0,
  // 符合预期
  conformToExpect: false,
  // 收盘涨停
  closeDailyLimit: false,
  // 排除 竞价涨停
  openDailyLimimExclude: false,
  // 展开折叠表格
  isShowContent: true,
  // 按板块不及预期率 降序排序
  sortPlateByIncompatibleRate: false,
  // 连板高度，-1代表全部
  evenBoardHeight: -1,
  // 连板高度可选项
  evenBoardHeightOptions: [],
  keyword: '',
  // 是否为概念
  isGainianSwitch: true,
  // 是否展示 个股筛选条件行
  isShowStockFilterRow: false,
});

/**
 * 重置筛选条件
 */
const resetFilter = () => {
  data.notFirstBoardChecked = false;
  data.firstBoardChecked = false;
  data.myStrategyChecked = false;
  data.biddingStrategyChecked = false;
  data.exceededExpect = false;
  data.conformToExpect = false;
  data.closeDailyLimit = false;
  data.openDailyLimimExclude = false;
  data.evenBoardHeight = -1;
  // 高级过滤
  filter.stockType = 'all';
  filter.dailyLimitTimeType = 'all';
  filter.firstBoardPlateDragon = false;
};

// 展开或收起 筛选条件
const toggleStockFilterRow = () => {
  data.isShowStockFilterRow = !data.isShowStockFilterRow;
};

/**
 * 按板块分类的个股（高标的首板 竞价策略 也需要过滤）
 */
const stockGroupByPlate: any = computed(() => {
  // 空对象直接返回
  if (isEmpty(superData.currentDateData)) {
    // console.log('superData.currentDateData null');
    return [];
  }
  const currentDateData = cloneDeep(superData.currentDateData);
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

  // 连板高度 可选项
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  data.evenBoardHeightOptions = transformAndSortEvenBoardHeightOptions(
    evenBoardHeightOptions,
  );

  // 将对象转换为数组 便于排序
  return transformObj2Arr(stockGroupByPlateTemp, superData.showBidding);
});

/**
 * 按条件过滤后的数据，基本策略 或 竞价策略 等
 */
const stockGroupByPlateByFilter = computed(() => {
  // 空对象直接返回
  if (isEmpty(stockGroupByPlate.value)) {
    return [];
  }
  const stockGroupByPlateCopy: any = cloneDeep(stockGroupByPlate.value);
  let myStrategyCheckedNum = 0;
  let biddingStrategyCheckedNum = 0;
  let dailyLimitNum = 0;
  let exceededExpectNum = 0;

  // 遍历 按板块 划分后的数据
  let isAdd = true;
  stockGroupByPlateCopy.forEach((plateData: any) => {
    let len = 0;
    const plateMaxHeight = getRealEvenBoardHeight(plateData.value[0]);

    plateData.value.forEach((item: DailyLimitStockDto) => {
      // 根据过滤条件，逐一筛选个股
      isAdd = true;
      // 反包首板 就视为 首板
      const evenBoardHeight = getRealEvenBoardHeight(item);
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
        // 题材 还是概念过滤？
        if (data.isGainianSwitch) {
          isAdd = item.gainian
            ? item.gainian.some((item: any) => {
                return item.name === data.keyword;
              })
            : false;
        } else {
          isAdd = item.reason ? item.reason.indexOf(data.keyword) > -1 : false;
        }
      }
      // 主板、创业板、科创、京交所
      if (filter.stockType !== 'all' && isAdd) {
        isAdd = stockTypeFilter(
          item,
          filter.stockTypeOptions,
          filter.stockType,
        );
      }
      // 上午板 下午板
      if (filter.dailyLimitTimeType !== 'all' && isAdd) {
        isAdd = dailyLimitTimeFilter(
          item.dailyTime,
          filter.dailyLimitTimeType === '1',
        );
      }
      // 首板寻龙
      if (filter.firstBoardPlateDragon && isAdd) {
        isAdd = plateMaxHeight === 1;
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
            // 符合预期 + 超预期
            isAdd =
              item.biddingData.expected === 2 ||
              item.biddingData.expected === 1;
          } else {
            // 符合预期
            isAdd =
              item.biddingData.expected === (data.conformToExpect ? 1 : 2);
          }
        }
        // 超预期数量 2024-03-08
        item.biddingData.expected === 2 && exceededExpectNum++;

        // 超预期；换手率>=5%，竞价量比大于10（连板及反包除外）
        if (data.biddingStrategyChecked && isAdd) {
          // ============ 竞价策略：高标的首板不能按首板考虑 !!!!!!============
          const evenBoardHeight = getRealEvenBoardHeight(item, true);
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
  updateNums(
    myStrategyCheckedNum,
    biddingStrategyCheckedNum,
    dailyLimitNum,
    exceededExpectNum,
  );

  return sortPlates(stockGroupByPlateCopy);
});

function updateNums(
  myStrategyCheckedNum: number,
  biddingStrategyCheckedNum: number,
  dailyLimitNum: number,
  exceededExpectNum: number,
) {
  data.myStrategyCheckedNum = myStrategyCheckedNum;
  data.biddingStrategyCheckedNum = biddingStrategyCheckedNum;
  data.dailyLimitNum = dailyLimitNum;
  data.exceededExpectNum = exceededExpectNum;
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
 * 按板块 不及预期率 降序排序
 */
function sortByIncompatibleRateDesc() {
  data.sortPlateByIncompatibleRate = !data.sortPlateByIncompatibleRate;
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
 * 刷新竞价数据
 */
const refreshData = debounce(() => {
  // superData.title有值则 刷新竞价数据，否则刷新短线数据
  emit('refreshData', superData.title);
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
    return b.len - a.len;
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
      aHeight = getRealEvenBoardHeight(aStock);
      bHeight = getRealEvenBoardHeight(bStock);
      return bHeight - aHeight;
    });
  }

  // 4. 按板块超预期率降序，如果相同则 按超预期个数为0 排在后面
  if (data.sortPlateByIncompatibleRate && superData.showBidding) {
    stockGroupByPlateArr.sort((a: any, b: any) => {
      // 精细化排序
      if (a?.incompatibleRate.rate === 0 && b?.incompatibleRate.rate === 0) {
        return b.incompatibleRate.exceededNum - a.incompatibleRate.exceededNum;
        // return a.length - b.length;
      }
      return a?.incompatibleRate.rate - b?.incompatibleRate.rate;
    });
  }

  return stockGroupByPlateArr;
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

.flex__row {
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
.stockFilter__row {
  background-color: #dcdcdc;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 65px;
  .el-checkbox {
    margin-right: 10px;
  }
}
.toggleIcon {
  flex: 1;
  margin-right: 10px;
  justify-content: flex-end;
}
</style>
