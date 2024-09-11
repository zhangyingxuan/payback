<template>
  <div class="container flex__row">
    <!-- 基础设置 是否自动加入自选 -->
    <!-- 竞价设置 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本配置</span>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="form" label-width="180px">
        <el-divider content-position="left">自选设置</el-divider>
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

        <el-divider content-position="left">竞价设置</el-divider>
        <el-form-item label="删除不及预期连板" prop="isBinddingDelEventBoard">
          <el-switch
            v-model="form.isBinddingDelEventBoard"
            inline-prompt
            active-text="是"
            inactive-text="否"
          ></el-switch>
        </el-form-item>
        <el-form-item label="删除不及预期首板" prop="isBinddingDelFirstBoard">
          <el-switch
            v-model="form.isBinddingDelFirstBoard"
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
        <el-divider content-position="left">新闻推送</el-divider>
        <el-form-item label="自动推送" prop="isAutoPushNews">
          <el-switch
            v-model="newsConfigForm.isAutoPushNews"
            inline-prompt
            active-text="是"
            inactive-text="否"
            @change="handleAutoPushNewsChange"
          ></el-switch>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>
      <el-form
        ref="dataManageFormRef"
        :model="dataManageForm"
        label-width="120px"
      >
        <el-divider content-position="left">删除数据</el-divider>
        <el-form-item label="日期" prop="isAutoAddSelf">
          <el-date-picker
            v-model="dataManageForm.date"
            type="date"
            format="YYYY-MM-DD"
            placeholder="Pick a day"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            @click="onDataManageSubmit(dataManageFormRef)"
          >
            删除
          </el-button>
        </el-form-item>
      </el-form>
      <el-form
        ref="userInfoFormRef"
        :model="userInfoForm"
        :rules="userInfoFormRules"
        label-width="120px"
      >
        <el-divider content-position="left">用户设置</el-divider>
        <el-form-item label="user" prop="user">
          <el-input
            v-model="userInfoForm.user"
            style="width: 240px"
            placeholder="user"
          />
        </el-form-item>
        <el-form-item label="token" prop="token">
          <el-input
            v-model="userInfoForm.token"
            style="width: 240px"
            placeholder="token"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSaveUserInfo(userInfoFormRef)">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { deleteData, saveUserInfo } from '@/api/payBack';
import {
  fetchSystemConfig,
  updateSystemConfig,
  toggleNewsPushEnable,
} from '@/api/systemConfig';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, dayjs, ElMessageBox } from 'element-plus';

const rules: FormRules = {
  isAutoAddSelf: [
    { required: true, message: '是否自动添加个股', trigger: 'blur' },
  ],
};
const userInfoFormRules: FormRules = {
  token: [{ required: true, message: '请输入token', trigger: 'blur' }],
  user: [{ required: true, message: '请输入user', trigger: 'blur' }],
};
const formRef = ref<FormInstance>();
const dataManageFormRef = ref<FormInstance>();
const userInfoFormRef = ref<FormInstance>();
const form = reactive({
  isAutoAddSelf: false,
  isAutoAddSelfEvenBoard: false,
  isAutoAddSelfFirstBoard: false,
  isBinddingDelEventBoard: false,
  isBinddingDelFirstBoard: false,
});
const newsConfigForm = reactive({
  // 是否自动推送新闻
  isAutoPushNews: false,
});
const dataManageForm = reactive({
  date: new Date(),
});
const userInfoForm = reactive({
  user: '',
  token: '',
});
async function initPage() {
  // 获取配置信息
  const configInfo: any = await fetchSystemConfig();
  form.isAutoAddSelf = !!configInfo.isAutoAddSelf;
  form.isAutoAddSelfEvenBoard = !!configInfo.isAutoAddSelfEvenBoard;
  form.isAutoAddSelfFirstBoard = !!configInfo.isAutoAddSelfFirstBoard;
  form.isBinddingDelEventBoard = !!configInfo.isBinddingDelEventBoard;
  form.isBinddingDelFirstBoard = !!configInfo.isBinddingDelFirstBoard;
  newsConfigForm.isAutoPushNews = !!configInfo.isAutoPushNews;
}

/**
 * 开启/关闭 自动推送新闻成功
 */
const handleAutoPushNewsChange = (isCheck: any) => {
  toggleNewsPushEnable({ isAutoPushNews: isCheck })
    .then(async () => {
      ElMessage.success(`${isCheck ? '开启' : '关闭'}自动推送新闻成功`);
    })
    .catch(() => {
      newsConfigForm.isAutoPushNews = !isCheck;
      ElMessage.error('操作失败，请稍后再试');
    });
};

// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
  // 表单校验
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      await updateSystemConfig(form);
      ElMessage.success('提交成功！');
    } else {
      return false;
    }
  });
};

// 数据管理提交
const onDataManageSubmit = (formEl: FormInstance | undefined) => {
  // 表单校验
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const date = dayjs(dataManageForm.date).format('YYYY-MM-DD');
      ElMessageBox.confirm(`确定要删除【${date}】的数据吗？`)
        .then(async () => {
          await deleteData({
            date,
          });
          ElMessage.success('删除成功！');
        })
        .catch(() => {
          // catch error
        });
    } else {
      return false;
    }
  });
};
// 用户信息提交
const onSaveUserInfo = (formEl: FormInstance | undefined) => {
  // 表单校验
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      ElMessageBox.confirm(`确定要更新用户数据吗？`)
        .then(async () => {
          await saveUserInfo({
            user: userInfoForm.user,
            token: userInfoForm.token,
          });
          ElMessage.success('更新成功！');
        })
        .catch(() => {
          // ElMessage.success('更新失败！');
        });
    } else {
      return false;
    }
  });
};

initPage();
</script>

<style scoped lang="less">
.flex__row {
  > div {
    width: 50%;
    margin: 0 5px;
  }
}
</style>
