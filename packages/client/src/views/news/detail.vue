<template>
  <div class="container"></div>
</template>

<script setup lang="ts" name="newsDetail">
import { reactive, ref } from 'vue';

// 取出 storage数据
function initDetailPage() {
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  formData.content;
}

initDetailPage();
</script>
