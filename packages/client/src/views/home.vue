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
        :virtualRefData="data.virtualRefData"
        :virtualRef="data.virtualRef"
      />
      <router-view />
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, provide } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { useTagsStore } from '../store/tags';
import vHeader from '../components/header.vue';
import vSidebar from '../components/sidebar.vue';
import { isMobile } from '@/core/util';
// import vTags from '../components/tags.vue';

const sidebar = useSidebarStore();
const tags = useTagsStore();

// 优化 多个popoer 性能问题，提取为公用的popoer 大大降低dom数量 2024-02-23 10:34:54
const data: {
  virtualRef: any;
  virtualRefData: any;
} = reactive({
  virtualRef: null,
  virtualRefData: null,
});
const showPoper = (target: any, superData: any) => {
  data.virtualRef = target;
  data.virtualRefData = superData;
};
provide('showPoper', showPoper);
</script>
