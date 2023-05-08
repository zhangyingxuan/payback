<template>
  <v-header />
  <v-sidebar v-if="!isMobile" />
  <div
    :class="[
      sidebar.collapse ? 'content-collapse' : '',
      isMobile ? 'content-box-mobile' : 'content-box',
    ]"
  >
    <!-- <v-tags></v-tags> -->
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="move" mode="out-in">
          <keep-alive :include="tags.nameList">
            <component :is="Component"></component>
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { useTagsStore } from '../store/tags';
import vHeader from '../components/header.vue';
import vSidebar from '../components/sidebar.vue';
// import vTags from '../components/tags.vue';

const sidebar = useSidebarStore();
const tags = useTagsStore();
const isMobile = computed(() => {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
});
</script>
