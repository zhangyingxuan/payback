<template>
  <div :class="['optButtons', { isMobile }]" v-if="isShowUpdateBtn" v-isAdmin>
    <template v-for="(item, index) in updateBtns" :key="'updateButton' + index">
      <el-switch
        v-if="item.type === 4"
        v-model="isRemoveIncompatible"
        inline-prompt
        active-text="是"
        inactive-text="否"
        style="margin: 0 5px"
      />

      <el-button
        plain
        type="primary"
        @click="updateTodayData(item.type, index)"
        size="small"
      >
        更新{{ item.title }}
      </el-button>
    </template>
  </div>
  <el-tabs type="border-card" :class="['reviewBoard__tabs', { isMobile }]">
    <!-- <el-tabs type="border-card" class="reviewBoard__tabs" @tab-change="tabChange"> -->
    <el-tab-pane label="图表复盘">
      <TabPaneCharts ref="charts" />
    </el-tab-pane>
    <el-tab-pane label="短线">
      <TabPaneEvenBoard ref="evenBoard" />
    </el-tab-pane>
    <el-tab-pane label="板块">
      <TabPanePlates ref="plates" />
    </el-tab-pane>
    <el-tab-pane label="热榜">
      <TabPaneHotList />
    </el-tab-pane>
    <!-- <el-tab-pane label="我的自选"> </el-tab-pane> -->
  </el-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { isMobile } from '@/core/util';
import { debounce } from 'lodash-es';
import { ElMessage } from 'element-plus';
import TabPaneCharts from './tabPaneCharts.vue';
import TabPaneEvenBoard from './tabPaneEvenBoard.vue';
import TabPaneHotList from './tabPaneHotList.vue';
import TabPanePlates from './tabPanePlates.vue';
import { crawlTodayData } from '@/api/payBack';

const evenBoard = ref<any>(null);
const charts = ref<any>(null);
const plates = ref<any>(null);
const isRemoveIncompatible = ref<boolean>(false);
// 周末不显示更新数据
const isShowUpdateBtn = [0, 6].indexOf(new Date().getDay()) == -1;

let loadingMessage: any = null;
const updateBtns = [
  {
    title: '短线',
    type: 1,
  },
  {
    title: '竞价',
    type: 4,
  },
  {
    title: '市场',
    type: 2,
  },
  {
    title: '资金',
    type: 3,
  },
];

/**
 * 更新市场数据
 * @param fetchTodayDataType
 * @param index
 * @param plateMode
 */
async function updateMarkData(
  fetchTodayDataType: number,
  index: number,
  plateMode = false,
) {
  loadingMessage && loadingMessage.close();
  // 提示加载中
  loadingMessage = ElMessage({
    duration: 0,
    message: updateBtns[index].title + '数据更新中...',
    type: 'warning',
  });

  // 根据更新范围，调用对应接口
  await crawlTodayData({
    fetchTodayDataType,
  });
  ElMessage.success('更新成功！');
  charts.value && charts.value.initPage();
  plateMode && plates.value && plates.value.initPlateByFunds();
}

const updateTodayData = debounce(async (fetchTodayDataType = 0, index) => {
  try {
    switch (fetchTodayDataType) {
      case 1:
        // 短线
        // 1. 更新短线tab
        evenBoard.value &&
          (await evenBoard.value.handleRefreshBindingData(false));
        // 2. 更新报表tab
        charts.value && charts.value.initPage();
        break;
      case 2:
        // 指数
        updateMarkData(fetchTodayDataType, index, true);
        break;
      case 3:
        // 资金
        updateMarkData(fetchTodayDataType, index, false);
        break;
      case 4:
        // 竞价
        evenBoard.value &&
          evenBoard.value.handleRefreshBindingData(
            true,
            isRemoveIncompatible.value ? 1 : 0,
          );
        break;
      default:
        location.reload();
        break;
    }
  } catch (e: any) {
    console.log(e);
    ElMessage.success('更新失败！');
  } finally {
    loadingMessage && loadingMessage.close();
  }
}, 500);
</script>

<style scoped lang="less">
// 复盘看板
.reviewBoard__tabs {
  &.isMobile {
    /deep/.el-tabs__content {
      padding: 40px 0 15px 0;
    }
  }
  /deep/.el-tabs__content {
    padding: 15px 0;
  }
  .el-tab-pane {
    height: calc(100vh - 125px);
    overflow-y: auto;
  }
}

.optButtons {
  position: fixed;
  right: 0;
  top: 50px;
  z-index: 999;
  padding: 0 20px;
  justify-self: end;
  min-width: 350px;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  &.isMobile {
    top: 90px;
  }
}
</style>
