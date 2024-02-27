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
    <div class="content">
      <!-- <router-view v-slot="{ Component }">
        <transition name="move" mode="out-in">
          <keep-alive :include="tags.nameList">
            <component :is="Component"></component>
          </keep-alive>
        </transition>
      </router-view> -->

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
</template>
<script setup lang="ts">
import { reactive, provide } from 'vue';
import { useSidebarStore } from '../store/sidebar';
// import { useTagsStore } from '../store/tags';
import vHeader from '../components/header.vue';
import vSidebar from '../components/sidebar.vue';
import { isMobile } from '@/core/util';
// import vTags from '../components/tags.vue';

const sidebar = useSidebarStore();
// const tags = useTagsStore();

// 优化 多个popoer 性能问题，提取为公用的popoer 大大降低dom数量 2024-02-23 10:34:54
const data: {
  popoverVirtualRef: any;
  popoverVirtualRefData: any;
  tooltipVirtualRef: any;
  tooltipVirtualRefData: any;
} = reactive({
  popoverVirtualRef: null,
  popoverVirtualRefData: null,
  tooltipVirtualRef: null,
  tooltipVirtualRefData: null,
});
const showPoper = (target: any, superData: any) => {
  data.popoverVirtualRef = target;
  data.popoverVirtualRefData = superData;
};
const showTooltip = (target: any, superData: any) => {
  data.tooltipVirtualRef = target;
  data.tooltipVirtualRefData = superData;
};
provide('showPoper', showPoper);
provide('showTooltip', showTooltip);
</script>
