<template>
  <div class="table">
    <div>{{ superData.title }}</div>
    <div class="table__container">
      <div
        :class="[
          'date-col',
          { isMobile: superData.isMobile },
          { isMonday: judgeMonday(item.createTime) },
        ]"
        v-for="(item, index) in data"
        :key="'evenBoard' + index"
      >
        <div class="table__header">{{ item.createDate }}</div>
        <!-- 行业涨 -->
        <div
          v-for="(plate, index) in item[
            superData.isHangye ? 'hangyeRiseFloat' : 'gainianRiseFloat'
          ]"
          :class="['table-col', plate.class]"
          :key="'row' + index"
        >
          <Plate :code="plate.code" :name="plate.name" />
          <span v-if="plate.quoteChange > 0" class="red">
            +{{ plate.quoteChange }}%
          </span>
          <span v-else class="green"> {{ plate.quoteChange }}%</span>
        </div>
        <div class="line"></div>
        <!-- 行业跌 -->
        <div
          v-for="(plate, index) in item[
            superData.isHangye ? 'hangyeFallFloat' : 'gainianFallFloat'
          ]"
          :class="['table-col', plate.class]"
          :key="'row' + index"
        >
          <Plate :code="plate.code" :name="plate.name" />
          <span v-if="plate.quoteChange > 0" class="red">
            +{{ plate.quoteChange }}%
          </span>
          <span v-else class="green"> {{ plate.quoteChange }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import _ from 'lodash-es';
import { judgeMonday } from '../utils';

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

.line {
  width: 100%;
  border-bottom: 2px double red;
  height: 1px;
  margin: 0px;
  padding: 0 !important;
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

    &.isMonday {
      border-right: 2px double red;
      .table__header {
        background-color: red !important;
        color: #fff !important;
      }
    }

    > div {
      padding: 10px;
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

  .plate1 {
    color: #fff;
    background-image: linear-gradient(#2afadf, #2261f3);
  }
  .plate2 {
    color: #fff;
    background-image: linear-gradient(#5efce8, #736efe);
  }
  .plate3 {
    color: #fff;
    background-image: linear-gradient(#abdcff, #0396ff);
  }
  // .plate4 {
  //   background-image: linear-gradient(#cdcfd0, #00eaff);
  //   color: #fff;
  // }
  // .plate5 {
  //   color: #fff;
  //   background-image: linear-gradient(#65fdf0, #1d6fa3);
  // }

  // .plate6 {
  //   background-image: linear-gradient(#90f7ec, #32ccbc);
  // }

  // .plate7 {
  //   background-image: linear-gradient(#81fbb8, #28c76f);
  // }
  // .plate8 {
  //   background-image: linear-gradient(#fff720, #3cd500);
  // }
  // .plate9 {
  //   background-image: linear-gradient(#f0ff00, #58cffb);
  // }
  // .plate10 {
  //   background-image: linear-gradient(#70f570, #49c628);
  // }

  // .plate1 {
  //   color: #fff;
  //   background-image: linear-gradient(#abdcff, #0396ff);
  // }
  // .plate2 {
  //   color: #fff;
  //   background-image: linear-gradient(#736efe, #5efce8);
  // }
  // .plate3 {
  //   color: #fff;
  //   background-image: linear-gradient(#465efb, #c2ffd8);
  // }
  // .plate4 {
  //   color: #fff;
  //   background-image: linear-gradient(#90f7ec, #32ccbc);
  // }
  // .plate5 {
  //   color: #fff;
  //   background-image: linear-gradient(#fff720, #3cd500);
  // }

  .plate6 {
    background-image: linear-gradient(#ff96f9, #c32bac);
  }

  .plate7 {
    background-image: linear-gradient(#f6d242, #ff52e5);
  }
  .plate8 {
    background-image: linear-gradient(#fff6b7, #f6416c);
  }
  // .plate9 {
  //   background-image: linear-gradient(#feb692, #ea5455);
  // }
  // .plate10 {
  //   background-image: linear-gradient(#fccf31, #f55555);
  // }
}
</style>
