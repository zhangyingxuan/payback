<template>
  <v-header />
  <v-sidebar v-if="!isMobile" />
  <div
    :class="[
      sidebar.collapse && !isMobile ? 'content-collapse' : '',
      isMobile ? 'content-box-mobile' : 'content-box',
    ]"
  >
    <!-- <v-tags></v-tags> -->
    <div ref="contentRef" class="content">
      <!-- <router-view v-slot="{ Component }">
        <transition name="move" mode="out-in">
          <keep-alive :include="tags.nameList">
            <component :is="Component"></component>
          </keep-alive>
        </transition>
      </router-view> -->

      <!-- 全局注入 个股新增 删除popover组件 -->
      <PlatePopover
        :virtualRefData="data.popoverVirtualPlateRefData"
        :virtualRef="data.popoverVirtualPlateRef"
      />
      <!-- 全局注入 个股新增 删除popover组件 -->
      <StockPopover
        :virtualRefData="data.popoverVirtualRefData"
        :virtualRef="data.popoverVirtualRef"
      />
      <!-- 全局注入 个股 tooltip组件 -->
      <StockTooltip
        :virtualRefData="data.tooltipVirtualRefData"
        :virtualRef="data.tooltipVirtualRef"
      />
      <router-view />
    </div>
  </div>
  <!-- 悬浮按钮放在滚动容器外，避免随页面内容移动。 -->
  <div class="page-scroll-actions" role="group" aria-label="页面滚动">
    <el-button circle :icon="Top" aria-label="回到顶部" title="回到顶部" @click="scrollToEdge(false)" />
    <el-button circle :icon="Bottom" aria-label="直到底部" title="直到底部" @click="scrollToEdge(true)" />
  </div>
</template>
<script setup lang="ts">
import { reactive, provide, ref } from 'vue';
import { Top, Bottom } from '@element-plus/icons-vue';
import { useSidebarStore } from '../store/sidebar';
// import { useTagsStore } from '../store/tags';
import vHeader from '../components/header.vue';
import vSidebar from '../components/sidebar.vue';
import { isMobile } from '@/core/util';
// import vTags from '../components/tags.vue';

const sidebar = useSidebarStore();
const contentRef = ref<HTMLElement | null>(null);

// 优先操作页面声明的主滚动区，避免滚动外层空壳或表格中的局部列表。
const scrollToEdge = (bottom: boolean) => {
  const content = contentRef.value;
  if (!content) return;
  const target = Array.from(content.querySelectorAll<HTMLElement>('[data-page-scroll]')).find(
    (element) => element.clientHeight > 0 && element.scrollHeight > element.clientHeight &&
      /^(auto|scroll)$/.test(window.getComputedStyle(element).overflowY),
  ) || content;

  // 尊重系统减少动态效果的设置。
  target.scrollTo({
    top: bottom ? target.scrollHeight : 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
};
// const tags = useTagsStore();

// 优化 多个popoer 性能问题，提取为公用的popoer 大大降低dom数量 2024-02-23 10:34:54
const data: {
  popoverVirtualRef: any;
  popoverVirtualRefData: any;
  tooltipVirtualRef: any;
  tooltipVirtualRefData: any;
  popoverVirtualPlateRef: any;
  popoverVirtualPlateRefData: any;
} = reactive({
  popoverVirtualRef: null,
  popoverVirtualRefData: null,
  tooltipVirtualRef: null,
  tooltipVirtualRefData: null,
  popoverVirtualPlateRef: null,
  popoverVirtualPlateRefData: null,
});
const showPoper = (target: any, superData: any) => {
  data.popoverVirtualRef = target;
  data.popoverVirtualRefData = superData;
};
const showPlatePoper = (target: any, superData: any) => {
  data.popoverVirtualPlateRef = target;
  data.popoverVirtualPlateRefData = superData;
};
const showTooltip = (target: any, superData: any) => {
  data.tooltipVirtualRef = target;
  data.tooltipVirtualRefData = superData;
};
provide('showPoper', showPoper);
provide('showPlatePoper', showPlatePoper);
provide('showTooltip', showTooltip);
</script>

<style scoped>
.page-scroll-actions {
  position: fixed;
  right: calc(16px + env(safe-area-inset-right, 0px));
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-scroll-actions .el-button {
  width: 44px;
  height: 44px;
  margin: 0;
  color: var(--el-color-primary);
  font-size: 20px;
  box-shadow: var(--el-box-shadow-light);
}
</style>
