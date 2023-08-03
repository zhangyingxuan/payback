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
      <router-view />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSidebarStore } from '../store/sidebar';
import { useTagsStore } from '../store/tags';
import vHeader from '../components/header.vue';
import vSidebar from '../components/sidebar.vue';
import { isMobile } from '@/core/util';
// import vTags from '../components/tags.vue';

const sidebar = useSidebarStore();
const tags = useTagsStore();
</script>
