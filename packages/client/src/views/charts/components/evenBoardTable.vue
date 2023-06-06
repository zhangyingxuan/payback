<template>
  <!-- 10日连板梯队 -->
  <!-- 行数取决于 时间范围内 最高连板 -->
  <!-- 列数取决于 日期数量 -->
  <div class="table">
    <div class="table__container">
      <div :class="['header-row', 'date-col', { isMobile }]">
        <div class="table-headaer">连板数</div>
        <div class="table-col">其它连板</div>
        <template v-for="height in heightArr" :key="'row1' + height">
          <div class="table-col" v-if="height != 1">{{ height }}</div>
        </template>
      </div>
      <div
        :class="['date-col', { isMobile }]"
        v-for="(item, index) in evenBoard.value"
        :key="'evenBoard' + index"
      >
        <div class="table-headaer">{{ item.createTime }}</div>
        <!-- 高标数据 -->
        <div class="table-col">
          <el-tooltip
            effect="dark"
            placement="top"
            v-for="(stock, index) in item.evenBoardData.gaobiao"
            :content="stock.reason"
            :key="'stock' + index"
          >
            <span> {{ stock.name }} {{ stock.evenDays }} </span>
          </el-tooltip>
        </div>
        <template v-for="height in heightArr">
          <div class="table-col" v-if="height != 1" :key="'row' + height">
            <el-tooltip
              effect="dark"
              placement="top"
              v-for="(stock, index) in item.evenBoardData[height]"
              :content="stock.reason"
              :key="'stock' + index"
            >
              <span> {{ stock.name }} </span>
              <!-- <span> {{ stock.name }} {{ stock.code }} </span> -->
            </el-tooltip>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { fetchEvenBoardData } from '@/api/payBack';
import { fetchIndustryData } from '@/api/tonghuashun';
import { transformEvenBoardData } from '../utils/transformUtil';
import { onMounted, reactive, watch, computed } from 'vue';
import { useSidebarStore } from '@/store/sidebar';
import { storeToRefs } from 'pinia';
import { isMobile } from '@/core/util';

type EvenBoard = {
  maxHeight: number;
  createTime: String;
};
let evenBoard = reactive<any>({ value: [] });
const siderBar = useSidebarStore();
const { countDays } = storeToRefs(siderBar);

// 监听变化，重新请求数据
watch(countDays, async val => {
  await initPage(val);
});

async function initPage(pageSize: number) {
  // 获取图表数据
  const result: any = await fetchEvenBoardData({
    limit: isMobile ? 10 : pageSize,
  });
  const rs: any = await fetchIndustryData();
  evenBoard.value = transformEvenBoardData(result.shortTermData);
}

onMounted(() => {
  initPage(countDays.value);
});

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
</script>

<style scoped lang="less">
@tableColumsBorderColor: #000;
.tableColumsBorder {
  border-right: 1px solid @tableColumsBorderColor;
  border-bottom: 1px solid @tableColumsBorderColor;
}
.tableContentBorder {
  border-left: 1px solid @tableColumsBorderColor;
  border-top: 1px solid @tableColumsBorderColor;
}
.table {
  overflow: auto;
  padding: 0 15px;
}
.table * {
  box-sizing: border-box;
}

.title {
  .tableContentBorder();
  border-right: 1px solid @tableColumsBorderColor;
  padding: 5px 10px;
}

.header-row {
  border-top: 1px solid @tableColumsBorderColor;
}

.flexCenter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-content: center;
}

.table__container {
  display: flex;
  flex-direction: row;
  text-align: center;
  border-left: 1px solid @tableColumsBorderColor;
  // .tableContentBorder();

  .date-col {
    .flexCenter();
    justify-content: flex-start;
    width: 9%;
    min-width: 9%;
    &.isMobile {
      width: 62px;
      min-width: 62px;
      > div {
        padding: 2px;
      }
    }

    > div {
      padding: 10px;
    }
  }

  .table-headaer {
    background-color: #ccc;
    width: 100%;
    .tableColumsBorder();
  }
  .table-col {
    width: 100%;
    height: 80px;
    overflow: scroll;
    // flex: 1;
    .flexCenter();
    .tableColumsBorder();
    justify-content: flex-start;
  }
  .table-col > span {
    font-size: 12px;
    display: inline-block;
    cursor: pointer;
    /* scale: 0.6; */
    /* transform: scale(0.7);
  transform-origin: 100% 100%; */
  }
}
</style>
