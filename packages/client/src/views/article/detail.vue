<template>
  <div class="container">
    <div class="handle-box">
      <el-button @click="goBack"> 返回 </el-button>
      <div class="date">{{ data.updatedTime }}</div>
    </div>
    <div>
      <div class="title">{{ data.title }}</div>
      <v-md-preview :text="data.content" />
    </div>
  </div>
</template>

<script setup lang="ts" name="newsDetail">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { findOne } from '@/api/article';

const { query } = useRoute();
const router = useRouter();

const id = query && query.id ? query.id : null;

const data = reactive({
  title: '',
  content: '',
  createTime: '',
  updatedTime: '',
});

function initPage() {
  if (id) {
    findOne({ id }).then(result => {
      data.title = result.title;
      data.content = result.content;
      data.createTime = result.createTime;
      data.updatedTime = result.updatedTime;
    });
  }
}

initPage();

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped lang="less">
.title {
  padding: 10px 0;
  font-size: 20px;
  font-weight: 500;
}

.date {
  font-size: 12px;
  color: gray;
  width: 100%;
  text-align: right;
}

.handle-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
