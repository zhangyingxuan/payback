<template>
  <el-row>
    <el-col :span="8"> {{ superData.headerTitle }} </el-col>
    <el-col :span="16" class="headerRight">
      <slot></slot>
      <el-link
        v-if="superData.url"
        type="primary"
        :href="superData.url"
        target="_blank"
        >更多数据</el-link
      >
      <!-- <a :href="superData.url" target="_blank">更多数据</a> -->
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
let superData = defineProps({
  headerTitle: {
    type: String,
    default: '默认值',
  },
  url: {
    type: String,
    default: '默认值',
  },
});
</script>

<style scoped lang="less">
.headerRight {
  text-align: right;
  line-height: 22px;
  display: flex;
  justify-content: end;
  align-items: center;
  font-size: 12px;
  color: @gray;

  .el-link {
    margin-left: 8px;
  }
  /deep/.el-button {
    margin-right: 8px;
  }
}
</style>
