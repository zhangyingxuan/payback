<template>
  <section class="review-board">
    <div class="optButtons" v-if="isShowUpdateBtn" v-isAdmin>
      <el-tooltip
        effect="dark"
        content="是否自动删除不及预期个股"
        placement="bottom"
      >
        <el-switch
          v-model="sidebar.isRemoveIncompatible"
          inline-prompt
          active-text="是"
          inactive-text="否"
          style="margin: 0 5px"
        />
      </el-tooltip>
      <template
        v-for="(item, index) in updateBtns"
        :key="'updateButton' + index"
      >
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
      <el-tab-pane label="短线" data-page-scroll>
        <TabPaneEvenBoard ref="evenBoard" />
      </el-tab-pane>
      <el-tab-pane label="图表复盘" lazy data-page-scroll>
        <TabPaneCharts ref="charts" />
      </el-tab-pane>
      <el-tab-pane label="板块" data-page-scroll>
        <TabPanePlates ref="plates" />
      </el-tab-pane>
      <el-tab-pane label="热榜" data-page-scroll>
        <TabPaneHotList />
      </el-tab-pane>
      <!-- <el-tab-pane label="我的自选"> </el-tab-pane> -->
    </el-tabs>
  </section>
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
import { useSidebarStore } from '@/store/sidebar';

const evenBoard = ref<any>(null);
const charts = ref<any>(null);
const plates = ref<any>(null);
const sidebar = useSidebarStore();

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
        evenBoard.value && (await evenBoard.value.handleRefreshData(false));
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
          evenBoard.value.handleRefreshData(
            true,
            sidebar.isRemoveIncompatible ? 1 : 0,
          );
        break;
      default:
        location.reload();
        break;
    }
  } catch (e: any) {
    console.error(e);
    ElMessage.success('更新失败！');
  } finally {
    loadingMessage && loadingMessage.close();
  }
}, 500);
</script>

<style scoped lang="less">
.review-board {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 5px;
  box-sizing: border-box;
  background: #f3f6fa;
  color: #18283c;
}

.optButtons {
  position: absolute;
  top: 17px;
  right: 42px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  .el-button {
    margin: 0;
    border-radius: 7px;
  }
}

.reviewBoard__tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e9f1;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(35, 55, 80, 0.05);
  overflow: hidden;

  :deep(.el-tabs__header) {
    flex-shrink: 0;
    margin: 0;
    padding: 0 18px;
    background: #fff;
    border-bottom: 1px solid #e8edf3;
  }
  :deep(.el-tabs__nav) {
    border: 0;
  }
  :deep(.el-tabs__item) {
    height: 54px;
    line-height: 54px;
    padding: 0 18px;
    margin: 0;
    border: 0 !important;
    color: #718198;
    font-size: 14px;
    font-weight: 600;
    transition: color 0.2s;
  }
  :deep(.el-tabs__item.is-active) {
    color: #245a9b;
    box-shadow: inset 0 -3px #3575bd;
  }
  :deep(.el-tabs__item:hover) {
    color: #245a9b;
  }
  :deep(.el-tabs__content) {
    flex: 1;
    min-height: 0;
    padding: 18px;
  }
  :deep(.el-tab-pane) {
    height: 100%;
    overflow-y: auto;
  }
  :deep(.el-card) {
    border: 1px solid #e6ecf3;
    border-radius: 10px;
    box-shadow: 0 3px 12px rgba(35, 55, 80, 0.04);
  }
  :deep(.el-card__header) {
    padding: 14px 16px;
    background: #f9fbfd;
    border-bottom: 1px solid #edf1f5;
    font-weight: 600;
  }
}

@media (max-width: 1100px) {
  .optButtons {
    position: static;
    justify-content: flex-end;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .reviewBoard__tabs {
    :deep(.el-tabs__header) {
      padding: 0 6px;
    }
    :deep(.el-tabs__item) {
      padding: 0 12px;
      height: 48px;
      line-height: 48px;
    }
    :deep(.el-tabs__content) {
      padding: 12px 8px;
    }
  }
}
</style>
