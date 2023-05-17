<template>
  <!-- 10日连板梯队 -->
  <!-- 行数取决于 时间范围内 最高连板 -->
  <!-- 列数取决于 日期数量 -->
  <div class="table">
    <div class="title">连板阶梯数据</div>
    <div class="table__container">
      <div class="date-col">
        <div class="table-headaer">连板数</div>
        <div class="table-col">其它连板</div>
        <template v-for="height in heightArr" :key="'row1' + height">
          <div class="table-col" v-if="height != 1">{{ height }}</div>
        </template>
      </div>
      <div
        class="date-col"
        v-for="(item, index) in superData.evenBoardList"
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
              <span :title="stock.reason">
                {{ stock.name }} {{ stock.code }}
              </span>
            </el-tooltip>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
let superData = defineProps({
  evenBoardList: {
    type: Array as unknown as PropType<EvenBoard[]>,
    default: [],
  },
});

type EvenBoard = {
  maxHeight: number;
  createTime: String;
};

const heightArr = computed(() => {
  let maxHeight = 0;
  // 找出 日期范围内 最高连板
  superData.evenBoardList.forEach((item: EvenBoard) => {
    maxHeight = item.maxHeight > maxHeight ? item.maxHeight : maxHeight;
  });

  const heightArr = [];
  for (let i = maxHeight; i >= 1; i--) {
    heightArr.push(i);
  }

  return heightArr;
});
const colSpan = computed(() => {
  return 24 / superData.evenBoardList.length;
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

.table * {
  box-sizing: border-box;
}

.title {
  .tableContentBorder();
  padding: 5px 10px;
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
  .tableContentBorder();

  .date-col {
    .flexCenter();
    justify-content: flex-start;
    max-width: 9%;
  }
  .date-col > div {
    padding: 10px;
  }

  .table-headaer {
    background-color: #ccc;
    width: 100%;
    .tableColumsBorder();
  }
  .table-col {
    width: 100%;
    // height: 120px;
    // overflow: scroll;
    flex: 1;
    .flexCenter();
    .tableColumsBorder();
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
