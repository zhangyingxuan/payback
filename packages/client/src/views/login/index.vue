<template>
  <div class="login-wrap">
    <div class="ms-login">
      <div class="ms-title">payBack</div>
      <el-form
        :model="param"
        :rules="rules"
        ref="login"
        label-width="0px"
        class="ms-content"
      >
        <el-form-item prop="account">
          <el-input v-model="param.account" placeholder="account">
            <template #prepend> 账号 </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="password"
            v-model="param.password"
          >
            <template #prepend> 密码 </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input
            placeholder="code"
            v-model="param.code"
            @keyup.enter="submitForm(login)"
          >
            <template #prepend> 验证码 </template>
            <template #append>
              <img :src="data.codeImg" class="captchaImg" @click="refreshCodeImg" />
            </template>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm(login)">登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTagsStore } from '@/store/tags';
import { usePermissStore } from '@/store/permiss';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { authLogin, getCode } from '@/api/user';
import { UserModel } from '@/api/model/UserModel';
import { setToken, setUserInfo } from '@/router/auth';


let interval: any = null;
const router = useRouter();
const param = reactive<UserModel>({
  account: '',
  password: '',
  code: '',
});
const data = reactive({
  codeImg: ''
});

const rules: FormRules = {
  account: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};
const permiss = usePermissStore();
const login = ref<FormInstance>();
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid: boolean) => {
    if (valid) {
      // 调用登录接口
      const result: any = await authLogin({
        ...param,
        password: btoa(param.password),
      });

      if (result && result.token) {
        ElMessage.success('登录成功');
        const keys =
          permiss.defaultList[param.account == 'admin' ? 'admin' : 'user'];
        permiss.handleSet(keys, param.account);
        // 设置用户信息
        setUserInfo(param.account, JSON.stringify(keys));
        // 7天
        setToken(result.token, 604800);
        router.push('/');
      } else {
        // 登录失败
        ElMessage.error('登录失败，用户名或密码错误！');
      }
    } else {
      ElMessage.error('登录失败');
      return false;
    }
  });
};

const tags = useTagsStore();
tags.clearTags();

/**
 * 刷新 验证码
 */
async function refreshCodeImg() {
  const res = await getCode();
  if (typeof URL !== 'undefined') {
    // 使用 URL.createObjectURL()
    data.codeImg = URL.createObjectURL(res);
  }
  interval && clearInterval(interval);
  interval = setInterval(() => {
    refreshCodeImg();
  }, 5 * 60 * 1000);
}
refreshCodeImg();
</script>

<style scoped>
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(../assets/img/login-bg.jpg);
  background-size: 100%;
}

.ms-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  color: #fff;
  border-bottom: 1px solid #ddd;
}

.ms-login {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 350px;
  margin: -190px 0 0 -175px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.ms-content {
  padding: 30px 30px;
}

.login-btn {
  text-align: center;
}

.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}

.login-tips {
  font-size: 12px;
  line-height: 30px;
  color: #fff;
}
/deep/.el-input-group__append {
  padding: 0;
}
.captchaImg {
  height: 32px;
}
</style>
