<template>
  <div class="table">
    <div>{{ superData.title }}</div>
    <div class="table__container">
      <div
        :class="['date-col', { isMobile: superData.isMobile }]"
        v-for="(item, index) in superData.data"
        :key="'evenBoard' + index"
      >
        <div class="table__header">{{ item.createTime }}</div>

        <!-- gainianRiseFloat: string;
  gainianFallFloat: string;
  hangyeRiseFloat: string;
  hangyeFallFloat: string; -->
        <!-- 行业涨 -->
        <div
          v-for="(plate, index) in item[
            superData.isHangye ? 'hangyeRiseFloat' : 'gainianRiseFloat'
          ]"
          class="table-col"
          :key="'row' + index"
        >
          {{ plate.name }}
          <span v-if="plate.quoteChange > 0" class="rise">
            +{{ plate.quoteChange }}%
          </span>
          <span v-else class="fall"> {{ plate.quoteChange }}%</span>
        </div>
        <!-- 行业跌 -->
        <div
          v-for="(plate, index) in item[
            superData.isHangye ? 'hangyeFallFloat' : 'gainianFallFloat'
          ]"
          class="table-col"
          :key="'row' + index"
        >
          {{ plate.name }}
          <span v-if="plate.quoteChange > 0" class="rise">
            +{{ plate.quoteChange }}%
          </span>
          <span v-else class="fall"> {{ plate.quoteChange }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
let superData = defineProps({
  data: {
    type: Array<any>,
    default: () => [],
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

.flexCenter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-content: center;
}
.flexBetween {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
  min-height: 16px;
}
.table {
  overflow: auto;
}
.table * {
  box-sizing: border-box;
}

.table__container {
  display: flex;
  flex-direction: row;
  text-align: center;
  border-left: 1px solid @tableColumsBorderColor;
  // .tableContentBorder();

  .date-col {
    .flexCenter();
    font-size: 12px;
    justify-content: flex-start;
    // width: 9%;
    // min-width: 9%;
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

    .rise {
      color: red;
    }

    .fall {
      color: green;
    }

    .name__row {
      font-size: 14px;
      margin-bottom: 5px;
    }
  }

  .table__header {
    background-color: @tableColumsBorderColor;
    width: 100%;
    font-size: 16px;
    .tableColumsBorder();
    border-top: 1px solid @tableColumsBorderColor;
  }
  .table-col {
    width: 100%;
    overflow: scroll;
    // flex: 1;
    .flexCenter();
    .tableColumsBorder();
    justify-content: flex-start;
    white-space: nowrap;
  }
}
</style>
