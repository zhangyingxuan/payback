<template>
  <div :class="['table', { isMobile }]">
    <div class="table__container">
      <div class="table-header table-row">
        <div class="col1">行业板块</div>
        <div class="col2 green">跌停个股</div>
      </div>

      <div
        class="table-row"
        v-for="(item, key) in stockGroupByPlate"
        :key="key"
      >
        <div class="col1">
          <div>
            <span class="zise">{{ item.key }}</span>
            <span>&nbsp;{{ item.value.length }}</span>
          </div>
        </div>
        <div class="col2">
          <div v-for="(stock, index) in item.value" :key="'stock' + index">
            <Stock :name="stock.name" :code="stock.code" />
            &nbsp;[&nbsp;<span class="lvse">封单{{ stock.closingFunds }}亿</span
            >]
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import _ from 'lodash-es';
import { computed } from 'vue';
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

const stockGroupByPlate = computed(() => {
  const evenBoardData = _.cloneDeep(superData.data);
  console.log(evenBoardData);
  const stockGroupByPlate: any = {};
  // 按 行业板块 将涨停个股分类
  evenBoardData.forEach((item: any) => {
    // 按板块划分 涨停数据
    if (!stockGroupByPlate[item.plateLevel2]) {
      stockGroupByPlate[item.plateLevel2] = [];
    }

    stockGroupByPlate[item.plateLevel2].push(item);
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
    o.value = stockGroupByPlate[key];
    // 板块内 个股按 连板高度 => 首次涨停时间降序
    stockGroupByPlateArr.push(o);
  });

  // 按 行业板块 涨停数量降序
  stockGroupByPlateArr.sort((a: any, b: any) => {
    return b.value.length - a.value.length;
  });
  return stockGroupByPlateArr;
}
</script>

<style scoped lang="less">
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

.table {
  padding: 0 15px;
  font-size: 12px;
  overflow: auto;

  &.isMobile {
    .table-row {
      .col1 {
        width: 100px;
        flex: 0 0 100px;
      }
    }
  }
}

.table__container {
  overflow: auto;
  .flexCenter();
  border-right: 1px solid @tableColumsBorderColor;

  .table-header {
    font-size: 14px;
    font-weight: 500;
    background-color: #dcdcdc;
    width: 100%;
    padding: 5px 10px;
    cursor: pointer;
    .tableColumsBorder();
    border-top: 1px solid @tableColumsBorderColor;
    display: flex;

    &.table-row > .col2 {
      font-size: 14px;
    }
  }

  .table-row {
    display: flex;
    width: 100%;
    .col1 {
      flex: 0 0 200px;
      width: 200px;
      display: flex;
      // justify-content: center;
      align-items: center;
    }
    .col2 {
      white-space: nowrap;
      font-size: 12px;
    }
    > div {
      border-left: 1px solid @tableColumsBorderColor;
      border-bottom: 1px solid @tableColumsBorderColor;
      padding: 5px 10px;
      flex: 1;
    }
  }
}
</style>
