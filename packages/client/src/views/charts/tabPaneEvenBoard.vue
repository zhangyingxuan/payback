<template>
  <!-- 10日连板梯队 -->
  <!-- 行数取决于 时间范围内 最高连板 -->
  <!-- 列数取决于 日期数量 -->
  <div class="table">
    <div class="table__container">
      <div :class="['date-col first-col', { isMobile }]">
        <div class="table-header">高度</div>
        <div class="table-col height1">连板数</div>
        <div class="table-col">其它</div>
        <template v-for="height in heightArr" :key="'row1' + height">
          <div
            :class="['table-col', getClassByHeight(height)]"
            v-if="height != 1"
          >
            {{ height }}
          </div>
          <div v-else class="table-col height1">首板</div>
        </template>
        <div class="table-col downLimitStock__plate">跌停股</div>
      </div>
      <div
        :class="[
          'date-col',
          { isMobile },
          { isMonday: judgeMonday(item.createTime) },
        ]"
        v-for="(item, index) in evenBoard.value"
        :key="'evenBoard' + index"
      >
        <div
          :class="[
            'table-header',
            { isActive: item.createTime === data.currentDate },
          ]"
          @click="handleDateClick(item.createTime)"
        >
          {{ item.createTime }}
          <el-icon>
            <SuccessFilled />
          </el-icon>
        </div>

        <div class="table-col height1">{{ item.evenBoardAmount }}</div>
        <!-- 高标数据 -->
        <div class="table-col">
          <el-tooltip
            effect="dark"
            placement="top"
            v-for="(stock, index) in item.evenBoardData.gaobiao"
            :content="stock.reason"
            :key="'stock' + index"
          >
            <span>
              <Stock :name="stock.name" :code="stock.code" />
              <span class="gray">{{ stock.evenDays }}</span>
            </span>
          </el-tooltip>
        </div>
        <template v-for="height in heightArr">
          <div
            :class="['table-col', getClassByHeight(height)]"
            v-if="height != 1"
            :key="'row' + height"
          >
            <el-tooltip
              effect="dark"
              placement="top"
              v-for="(stock, index) in item.evenBoardData[height]"
              :content="stock.reason"
              :key="'stock' + index"
            >
              <Stock :name="stock.name" :code="stock.code" />
            </el-tooltip>
          </div>
          <div v-else class="table-col height1">
            <span v-if="item.evenBoardData && item.evenBoardData[1]">{{
              item.evenBoardData[1].length
            }}</span>
          </div>
        </template>
        <!-- 跌停数据 -->
        <div class="table-col">
          <el-tooltip
            effect="dark"
            placement="top"
            v-for="(stock, index) in item.downLimitData"
            :content="stock.plateLevel2"
            :key="'downLimitStock' + index"
          >
            <span>
              <Stock :name="stock.name" :code="stock.code" />
              <span
                v-if="!isMobile"
                class="downLimitStock__plate"
                type="success"
                >{{ stock.plateLevel2 }}</span
              >
            </span>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>

  <!-- 当日涨停分布，按行业板块划分 -->
  <DailyStockTable :data="data.currentDailyStocks" :isMobile="isMobile" />
  <DownStockTable :data="data.currentDownStocks" :isMobile="isMobile" />
</template>
<script lang="ts" setup>
import { fetchEvenBoardData } from '@/api/payBack';
// import { fetchIndustryData } from '@/api/tonghuashun';
import { judgeMonday } from './utils';
import { transformEvenBoardData } from './utils/transformUtil';
import { onMounted, reactive, watch, computed } from 'vue';
import { useSidebarStore } from '@/store/sidebar';
import { storeToRefs } from 'pinia';
import { isMobile } from '@/core/util';
import DailyStockTable from './components/tabPaneEvenBoardDailyStockTable.vue';
import DownStockTable from './components/tabPaneEvenBoardDownStockTable.vue';
import dayjs from 'dayjs';

// 默认选中最新日期，可点击日期切换 查看选中日期详细涨停数据；PC横着，移动端竖着展示；按行业

type EvenBoard = {
  maxHeight: number;
  createTime: String;
};
let evenBoard = reactive<any>({ value: [] });

const data = reactive({
  currentDailyStocks: [],
  currentDownStocks: [],
  currentDate: dayjs(new Date()).format('MM/DD'),
});

const siderBar = useSidebarStore();
const { countDays } = storeToRefs(siderBar);

// 监听变化，重新请求数据
watch(countDays, async val => {
  await initPage(val);
});

async function initPage(pageSize: number) {
  // 获取图表数据
  const result: any = await fetchEvenBoardData({
    // limit: 10,
    limit: isMobile ? 10 : pageSize,
    isMobile,
  });
  // const rs: any = await fetchIndustryData();
  evenBoard.value = transformEvenBoardData(result);
  // 将当日涨停个股，按连板高度、行业 做成表格
  handleDateClick(evenBoard.value[0]?.createTime);
}

onMounted(() => {
  initPage(countDays.value);
});

function handleDateClick(date: string) {
  data.currentDate = date;
  data.currentDailyStocks = evenBoard.value.find(
    (item: any) => item.createTime === date,
  );
  data.currentDownStocks = evenBoard.value.find(
    (item: any) => item.createTime === date,
  );
  console.log(data.currentDailyStocks);
}

const heightArr = computed(() => {
  let maxHeight = 0;
  // 找出 日期范围内 最高连板
  evenBoard.value.forEach((item: EvenBoard) => {
    maxHeight = item.maxHeight > maxHeight ? item.maxHeight : maxHeight;
  });

  const heightArr = [];
  for (let i = maxHeight; i >= 1; i--) {
    heightArr.push(i);
  }

  return heightArr;
});

function getClassByHeight(height: any) {
  switch (height) {
    case 2:
      return 'height2';
    case 3:
      return 'height3';
    case 4:
    case 5:
    case 6:
      return 'height4';
    case 7:
    case 8:
    default:
      return 'height7';
  }
}
</script>

<style scoped lang="less">
@tableColumsBorderColor: #dcdcdc;
.tableColumsBorder {
  border-right: 1px solid @tableColumsBorderColor;
  border-bottom: 1px solid @tableColumsBorderColor;
}
.tableContentBorder {
  border-left: 1px solid @tableColumsBorderColor;
  border-top: 1px solid @tableColumsBorderColor;
}
.table {
  padding: 0 15px;
  margin-bottom: 10px;
}
.table * {
  box-sizing: border-box;
}

.flexCenter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-content: center;
}

.table__container {
  overflow: auto;
  display: flex;
  flex-direction: row;
  text-align: center;
  border-left: 1px solid @tableColumsBorderColor;
  // .tableContentBorder();

  .date-col {
    .flexCenter();
    justify-content: flex-start;
    // width: 9%;
    // min-width: 9%;
    // max-width: 9%;
    min-width: 130px;
    // white-space: nowrap;

    &.first-col {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
      position: sticky;
      left: 0;
      background-color: #fff;
    }
    &.isMobile {
      width: 62px;
      min-width: 62px;
      .isActive {
        /deep/.el-icon {
          display: none;
        }
      }
      > div {
        padding: 2px;
      }

      .gray {
        display: inline-block;
      }
    }

    > div {
      padding: 5px;
    }
  }

  .isMonday {
    border-right: 2px double #5a9cf8;
    .table-header {
      background-color: #5a9cf8;
      color: #fff !important;
    }
  }

  .table-header {
    background-color: #dcdcdc;
    width: 100%;
    cursor: pointer;
    .tableColumsBorder();
    border-top: 1px solid @tableColumsBorderColor;

    &.isActive {
      color: #5a9cf8;
      > .el-icon {
        display: inline-block;
      }
    }
    > .el-icon {
      margin-bottom: -4px;
      display: none;
    }
  }
  .table-col {
    width: 100%;
    height: 83px;
    overflow: scroll;
    // flex: 1;
    .flexCenter();
    .tableColumsBorder();
    justify-content: flex-start;

    &.height2 {
      height: 110px;
    }
    &.height3 {
      height: 75px;
    }
    &.height4 {
      height: 50px;
      color: rgb(163, 5, 5);
    }
    &.height7,
    &.height1 {
      padding: 0px;
      height: 30px;
      color: rgb(96, 3, 3);
      justify-content: center;
    }
    &.height1 {
      color: rgb(216, 26, 61);
    }
  }
  .table-col > span {
    font-size: 12px;
    display: inline-block;
    cursor: pointer;
    /* scale: 0.6; */
    /* transform: scale(0.7);
  transform-origin: 100% 100%; */
  }

  .downLimitStock__plate {
    padding: 2px;
    color: rgb(45, 182, 136);
  }
}
</style>
