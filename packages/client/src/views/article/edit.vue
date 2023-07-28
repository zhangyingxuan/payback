<template>
  <div class="container">
    <div class="form-box">
      <el-form ref="formRef" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="文章名称" prop="name">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <v-md-editor v-model="form.content" height="600px"></v-md-editor>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit(formRef)">{{
            query && query.id ? '编辑' : '新增'
          }}</el-button>
          <el-button @click="onReset(formRef)">重置表单</el-button>
          <el-button class="error-btn" @click="goBack"> 返回 </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts" name="baseform">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { findOne, create, update } from '@/api/article';

const { query } = useRoute();

const router = useRouter();

const rules: FormRules = {
  title: [{ required: true, message: '请输入文章名称', trigger: 'blur' }],
};
const formRef = ref<FormInstance>();

const form = reactive({
  title: '',
  content: '',
});

const id = query && query.id ? query.id : null;

function initPage() {
  if (id) {
    // 编辑
    findOne({ id }).then(data => {
      form.title = data.title;
      form.content = data.content;
    });
  }
}

initPage();

// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
  // 表单校验
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      console.log(form);
      if (!form.content) {
        ElMessage.error('请输入文章内容！！！');
        return false;
      }

      if (id) {
        update({
          id,
          ...form,
        }).then(() => {
          ElMessage.success('提交成功！');
        });
      } else {
        create(form).then(() => {
          ElMessage.success('提交成功！');
        });
      }
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

const goBack = () => {
  router.go(-1);
};
</script>
