<template>
  <div class="container">
    <div class="form-box">
      <el-form ref="formRef" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="新闻名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="选择器" prop="region">
          <el-select v-model="form.region" placeholder="请选择">
            <el-option key="bbk" label="步步高" value="bbk"></el-option>
            <el-option key="xtc" label="小天才" value="xtc"></el-option>
            <el-option key="imoo" label="imoo" value="imoo"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="新闻内容" prop="content">
          <Editor ref="wangEditor" :content="form.content" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit(formRef)">表单提交</el-button>
          <el-button @click="onReset(formRef)">重置表单</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts" name="baseform">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import Editor from './components/editor.vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useRoute } from 'vue-router';

const route = useRoute();

const rules: FormRules = {
  name: [{ required: true, message: '请输入新闻名称', trigger: 'blur' }],
};
const formRef = ref<FormInstance>();
const wangEditor = ref<InstanceType<typeof Editor> | null>(null);

const form = reactive({
  name: '',
  region: '',
  content: '是放大法士大夫',
});
// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
  // 表单校验
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      console.log(form);
      console.log(wangEditor.value?.valueHtml);
      localStorage.setItem('formData', JSON.stringify(form));
      ElMessage.success('提交成功！');
    } else {
      return false;
    }
  });
};
// 重置
const onReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>
