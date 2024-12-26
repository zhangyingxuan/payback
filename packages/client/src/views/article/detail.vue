<template>
  <div class="container">
    <div class="handle-box">
      <el-button @click="goBack"> 返回 </el-button>
      <div class="date">
        更新时间：{{ data.updatedTime }} &nbsp;&nbsp;&nbsp; 创建时间：{{
          data.createTime
        }}
      </div>
    </div>
    <div id="articleDetail">
      <div class="title">{{ data.title }}</div>
      <v-md-preview :text="data.content" />
    </div>
  </div>
  <el-backtop
    :right="20"
    :bottom="20"
    target=".content"
    :visibility-height="200"
  />
</template>

<script setup lang="ts" name="articleDetail">
import { reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { findOne } from '@/api/article';
import dayjs from 'dayjs';
import { dateTimeFormat } from './config';

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
      data.createTime = dayjs(result.createTime).format(dateTimeFormat);
      data.updatedTime = dayjs(result.updatedTime).format(dateTimeFormat);
    });
  }
}

initPage();

const goBack = () => {
  router.push({
    name: 'article',
  });
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
  margin-right: 1rem;
}

.handle-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/deep/ .vuepress-markdown-body {
  padding: 1rem;
}
</style>
