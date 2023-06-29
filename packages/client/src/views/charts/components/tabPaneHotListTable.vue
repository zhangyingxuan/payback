<template>
  <!-- 10日连板梯队 -->
  <!-- 行数取决于 时间范围内 最高连板 -->
  <!-- 列数取决于 日期数量 -->
  <div class="table">
    <div class="table__container">
      <div
        :class="['date-col', { isMobile: superData.isMobile }]"
        v-for="(item, index) in superData.data"
        :key="'evenBoard' + index"
      >
        <div class="table__header">{{ item.createTime }}</div>
        <div
          v-for="(hot, index) in item[superData.type]"
          class="table-col"
          :key="'row' + index"
        >
          <div class="name__row flexBetween">
            <Stock
              v-if="superData.type.includes('stock')"
              :name="hot.name"
              :code="hot.code"
            />
            <Plate v-else :name="hot.name" :code="hot.code" />
            <span v-if="hot.rise_and_fall > 0" class="rise">
              +{{ hot.rise_and_fall }}%</span
            >
            <span v-else class="fall"> {{ hot.rise_and_fall }}%</span>
          </div>
          <div class="flexBetween">
            <div v-if="hot.hot_tag" class="tag red">
              <div class="tabBorder red"></div>
              {{ hot.hot_tag }}
            </div>
            <template v-if="Array.isArray(hot.tag)">
              <div
                v-for="(tag, index) in hot.tag"
                :key="'tag' + index"
                class="tag"
              >
                <div class="tabBorder"></div>
                {{ tag }}
              </div>
            </template>
            <div v-else-if="hot.tag" class="tag">
              <div class="tabBorder"></div>
              {{ hot.tag }}
            </div>
          </div>
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
  type: {
    type: String,
    default: '',
  },
  isMobile: {
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

    .tag {
      position: relative;
      color: rgba(0, 0, 0, 0.52);
      border-radius: 2px;
      font-size: 12px;
      padding: 1px 2px;
      .tabBorder {
        width: 300%;
        height: 300%;
        border: 1px solid rgba(0, 0, 0, 0.52);
        -webkit-transform: scale(0.33);
        transform: scale(0.33);
        -webkit-transform-origin: 0 0;
        transform-origin: 0 0;
        position: absolute;
        left: 0;
        // top: -1px;
        background: none;
        border-radius: 6px;
        &.red {
          border-color: #ff2634;
        }
      }
      &.red {
        color: #ff2634;
      }
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
