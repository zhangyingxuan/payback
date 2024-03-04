<template>
  <div class="container">
    <!-- 基础设置 是否自动加入自选 -->
    <!-- 竞价设置 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本配置</span>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="form" label-width="120px">
        <el-form-item label="自动加入自选" prop="isAutoAddSelf">
          <el-switch
            v-model="form.isAutoAddSelf"
            inline-prompt
            active-text="是"
            inactive-text="否"
          ></el-switch>
        </el-form-item>
        <el-form-item label="自选连板" prop="isAutoAddSelfEvenBoard">
          <el-switch
            v-model="form.isAutoAddSelfEvenBoard"
            inline-prompt
            active-text="是"
            inactive-text="否"
          ></el-switch>
        </el-form-item>
        <el-form-item label="自选首板" prop="isAutoAddSelfFirstBoard">
          <el-switch
            v-model="form.isAutoAddSelfFirstBoard"
            inline-prompt
            active-text="是"
            inactive-text="否"
          ></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit(formRef)">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { fetchSystemConfig, updateSystemConfig } from '@/api/payBack';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

const rules: FormRules = {
  name: [{ required: true, message: '请输入表单名称', trigger: 'blur' }],
};
const formRef = ref<FormInstance>();
const form = reactive({
  isAutoAddSelf: false,
  isAutoAddSelfEvenBoard: false,
  isAutoAddSelfFirstBoard: false,
});
async function initPage() {
  // 获取配置信息
  const configInfo: any = await fetchSystemConfig();
  form.isAutoAddSelf = !!configInfo.isAutoAddSelf;
  form.isAutoAddSelfEvenBoard = !!configInfo.isAutoAddSelfEvenBoard;
  form.isAutoAddSelfFirstBoard = !!configInfo.isAutoAddSelfFirstBoard;
}

// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
  // 表单校验
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      console.log(form);
      await updateSystemConfig(form);
      ElMessage.success('提交成功！');
    } else {
      return false;
    }
  });
};

initPage();
</script>

<style scoped lang="less"></style>
