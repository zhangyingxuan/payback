<template>
  <main class="login-page" :class="{ 'theme-bull': theme === 'bull' }">
    <section class="login-shell" aria-label="PayBack 登录">
      <aside class="brand-panel">
        <div class="brand-mark"><span class="brand-icon" aria-hidden="true">P</span><span>PayBack<span class="brand-dot">.</span></span></div>
        <div class="brand-content">
          <span class="eyebrow"><span class="status-dot"></span> YOUR MARKET WORKSPACE</span>
          <h1>看清市场，<br /><span>从容复盘。</span></h1>
          <p>让每一次观察都有迹可循，<br />让每一次复盘更有方向。</p>
          <div class="market-visual" aria-hidden="true">
            <div class="visual-top"><span>MARKET OBSERVATION</span><span>01 — 04</span></div>
            <svg viewBox="0 0 500 170" preserveAspectRatio="none" fill="none">
              <path class="grid-line" d="M0 40H500M0 85H500M0 130H500M100 0V170M200 0V170M300 0V170M400 0V170" />
              <path class="chart-area" d="M0 142 L35 126 L70 135 L105 104 L140 113 L175 81 L210 93 L245 58 L280 74 L315 55 L350 67 L385 31 L420 45 L455 18 L500 28 L500 170 L0 170Z" />
              <path class="chart-line" d="M0 142 L35 126 L70 135 L105 104 L140 113 L175 81 L210 93 L245 58 L280 74 L315 55 L350 67 L385 31 L420 45 L455 18 L500 28" />
            </svg>
            <div class="visual-bottom"><span>观察</span><span>分析</span><span>复盘</span></div>
          </div>
        </div>
        <div class="brand-footer"><span>专注每一次交易思考</span><span>PAYBACK / WORKSPACE</span></div>
      </aside>

      <section class="form-panel">
        <div class="mobile-brand"><span class="brand-icon" aria-hidden="true">P</span> PayBack<span class="brand-dot">.</span></div>
        <div class="theme-row"><button type="button" class="theme-toggle" :aria-label="theme === 'bull' ? '切换至经典主题' : '切换至牛市红主题'" @click="toggleTheme"><span class="theme-swatch" aria-hidden="true"></span>{{ theme === 'bull' ? '牛市红' : '经典绿' }} <span aria-hidden="true">↔</span></button></div>
        <div class="form-content">
          <span class="form-kicker">WELCOME BACK <span> / </span> 欢迎回来</span>
          <h2>登录 PayBack</h2>
          <p class="form-description">输入账号信息，继续你的复盘之旅。</p>
          <el-form ref="login" :model="param" :rules="rules" class="login-form" @keyup.enter="submitForm">
            <el-form-item prop="account" label="账号" label-position="top">
              <el-input v-model="param.account" placeholder="请输入账号" autocomplete="username" />
            </el-form-item>
            <el-form-item prop="password" label="密码" label-position="top">
              <el-input v-model="param.password" type="password" placeholder="请输入密码" autocomplete="current-password" show-password />
            </el-form-item>
            <el-form-item prop="code" label="验证码" label-position="top">
              <div class="captcha-row">
                <el-input v-model="param.code" placeholder="请输入验证码" autocomplete="off" />
                <button type="button" class="captcha-button" aria-label="刷新验证码" title="点击刷新验证码" @click="refreshCodeImg">
                  <img v-if="data.codeImg" :src="data.codeImg" alt="验证码" />
                  <span v-else>刷新验证码</span>
                </button>
              </div>
            </el-form-item>
            <el-button class="submit-button" type="primary" @click="submitForm">登 录 <span aria-hidden="true">→</span></el-button>
          </el-form>
          <p class="form-note"><span aria-hidden="true">✦</span> 专注数据，保持独立思考</p>
        </div>
        <div class="form-footer">PAYBACK <span>·</span> 你的个人复盘工作台</div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, getCurrentInstance } from 'vue';
import { useTagsStore } from '@/store/tags';
import { usePermissStore } from '@/store/permiss';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { authLogin, getCode } from '@/api/user';
import { UserModel } from '@/api/model/UserModel';
import { setToken } from '@/router/auth';
import { updateNavThemeColor } from '@/core/util';
import { theme, toggleTheme } from '@/core/theme';

// 更新监控 uin
const { proxy }: any = getCurrentInstance();
updateNavThemeColor('#324157');

const router = useRouter();
const param = reactive<UserModel>({
  account: '',
  password: '',
  code: '',
});
const data = reactive({
  codeImg: '',
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
const submitForm = (event: Event) => {
  event.preventDefault();
  if (!login.value) return;
  login.value.validate(async (valid: boolean) => {
    if (valid) {
      // 调用登录接口
      const result: any = await authLogin({
        ...param,
        password: btoa(param.password),
      });

      if (result && result.token) {
        ElMessage.success('登录成功');
        // 设置用户信息
        permiss.handleSetUserInfo({ ...result, ...param });
        proxy?.$aegis &&
          proxy?.$aegis?.setConfig({
            uin: result.account,
          });
        // 7天
        setToken(result.token, 604800);
        router.push('/');
      } else {
        // 登录失败
        ElMessage.error(result.msg || '登录失败，用户名或密码错误！');
      }
    } else {
      ElMessage.error('登录失败');
      // 移除return false，因为FormValidateCallback要求返回void
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
  // interval && clearInterval(interval);
  // interval = setInterval(() => {
  //   refreshCodeImg();
  // }, 5 * 60 * 1000);
}
refreshCodeImg();
</script>

<style scoped>
.login-page { box-sizing: border-box; height: 100%; overflow-y: auto; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 36px; background: #edf1ef; color: #1e302d; font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif; }
.login-shell { display: grid; grid-template-columns: 1.08fr 0.92fr; width: min(1080px, 100%); min-height: 660px; overflow: hidden; background: #fff; border: 1px solid #e3eae6; border-radius: 20px; box-shadow: 0 28px 80px rgba(28, 56, 47, .12); }
.brand-panel { position: relative; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: 43px 48px 34px; background: #183f37; color: #f3faf6; }
.brand-panel::before { position: absolute; top: -170px; right: -150px; width: 430px; height: 430px; border: 1px solid rgba(179, 220, 186, .1); border-radius: 50%; box-shadow: 0 0 0 58px rgba(179, 220, 186, .025), 0 0 0 116px rgba(179, 220, 186, .025); content: ""; pointer-events: none; }
.brand-mark, .mobile-brand { position: relative; display: flex; align-items: center; gap: 10px; font-size: 21px; font-weight: 750; letter-spacing: -.8px; }
.brand-icon { display: inline-grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; background: #b7e4bd; color: #183f37; font-size: 20px; font-weight: 800; }
.brand-dot { color: #94d5a3; }
.brand-content { position: relative; padding-top: 28px; }
.eyebrow, .form-kicker { font-size: 10px; font-weight: 700; letter-spacing: 2px; }
.eyebrow { display: flex; align-items: center; gap: 9px; color: #b3d8bd; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #a7e2b2; box-shadow: 0 0 0 4px rgba(167, 226, 178, .12); }
.brand-content h1 { margin: 24px 0 18px; font-size: clamp(34px, 3.5vw, 48px); line-height: 1.32; font-weight: 650; letter-spacing: 2px; }
.brand-content h1 span { color: #b7e4bd; }
.brand-content p { margin: 0; color: #c0d4c9; font-size: 14px; line-height: 2; }
.market-visual { margin-top: 42px; padding: 18px 18px 14px; border: 1px solid rgba(204, 237, 212, .16); border-radius: 12px; background: rgba(255, 255, 255, .035); }
.visual-top, .visual-bottom, .brand-footer { display: flex; justify-content: space-between; color: #b1cebc; font-size: 10px; letter-spacing: 1.2px; }
.market-visual svg { display: block; width: 100%; height: 136px; margin: 14px 0 9px; }
.grid-line { stroke: rgba(202, 232, 207, .12); stroke-width: 1; }
.chart-area { fill: rgba(154, 215, 165, .08); }
.chart-line { stroke: #addfb6; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
.visual-bottom { letter-spacing: 2px; }
.brand-footer { position: relative; align-items: center; gap: 12px; color: #a9c7b4; font-size: 10px; }
.form-panel { display: flex; flex-direction: column; justify-content: space-between; padding: 54px clamp(36px, 6vw, 76px) 34px; background: #fff; }
.form-content { width: 100%; max-width: 360px; margin: auto; }
.form-kicker { color: #60836d; }
.form-kicker span { padding: 0 3px; color: #a3b6a9; }
.form-content h2 { margin: 20px 0 9px; color: #1d302b; font-size: 30px; font-weight: 700; letter-spacing: -.5px; }
.form-description { margin: 0; color: #74877d; font-size: 14px; line-height: 1.7; }
.login-form { margin-top: 36px; }
.login-form :deep(.el-form-item) { margin-bottom: 23px; }
.login-form :deep(.el-form-item__label) { height: auto; padding: 0 0 9px; color: #344a40; font-size: 13px; font-weight: 600; line-height: 1.4; }
.login-form :deep(.el-input__wrapper) { min-height: 48px; padding: 0 15px; border-radius: 8px; background: #f8faf8; box-shadow: 0 0 0 1px #dce6df inset; }
.login-form :deep(.el-input__wrapper.is-focus) { background: #fff; box-shadow: 0 0 0 1px #4b8c64 inset, 0 0 0 3px rgba(75, 140, 100, .12); }
.login-form :deep(.el-input__inner) { color: #243e32; font-size: 14px; }
.login-form :deep(.el-input__inner::placeholder) { color: #9baaa0; }
.captcha-row { display: flex; width: 100%; gap: 10px; }
.captcha-row .el-input { flex: 1; min-width: 0; }
.captcha-button { display: flex; flex: 0 0 118px; align-items: center; justify-content: center; height: 48px; padding: 0; overflow: hidden; border: 1px solid #dce6df; border-radius: 8px; background: #f8faf8; color: #526d5d; cursor: pointer; font-size: 12px; }
.captcha-button img { max-width: 100%; max-height: 100%; }
.captcha-button:focus-visible { outline: 3px solid #9ed2ac; outline-offset: 2px; }
.submit-button.el-button { display: flex; justify-content: center; gap: 13px; width: 100%; height: 50px; margin-top: 31px; border: 0; border-radius: 8px; background: #245c48; color: #fff; font-size: 15px; font-weight: 600; letter-spacing: 2px; transition: background .2s; }
.submit-button.el-button:hover, .submit-button.el-button:focus-visible { background: #317457; }
.submit-button span { font-size: 19px; font-weight: 400; }
.form-note { margin: 24px 0 0; color: #829589; font-size: 12px; text-align: center; }
.form-note span { margin-right: 5px; color: #6ba77c; }
.form-footer { padding-top: 30px; color: #91a398; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-align: center; }
.form-footer span { padding: 0 4px; }
.mobile-brand { display: none; }
.theme-row { display: flex; justify-content: flex-end; }
.theme-toggle { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 12px; border: 1px solid #dce6df; border-radius: 999px; background: #fff; color: #536d5e; font: inherit; font-size: 12px; cursor: pointer; }
.theme-toggle:focus-visible { outline: 3px solid #9ed2ac; outline-offset: 2px; }
.theme-swatch { width: 9px; height: 9px; border-radius: 50%; background: #245c48; }
.login-page.theme-bull { background: #f8eeeb; color: #462421; }
.theme-bull .login-shell { border-color: #f0ddda; box-shadow: 0 28px 80px rgba(111, 37, 31, .13); }
.theme-bull .brand-panel { background: #7d2826; color: #fff6ef; }
.theme-bull .brand-panel::before { border-color: rgba(255, 217, 181, .14); box-shadow: 0 0 0 58px rgba(255, 217, 181, .035), 0 0 0 116px rgba(255, 217, 181, .035); }
.theme-bull .brand-icon { background: #f7c9a3; color: #7d2826; }
.theme-bull .brand-dot, .theme-bull .brand-content h1 span { color: #f5c59e; }
.theme-bull .eyebrow, .theme-bull .visual-top, .theme-bull .visual-bottom, .theme-bull .brand-footer { color: #f0c7b7; }
.theme-bull .brand-content p { color: #f2d2c8; }
.theme-bull .status-dot { background: #ffc99e; box-shadow: 0 0 0 4px rgba(255, 201, 158, .15); }
.theme-bull .market-visual { border-color: rgba(255, 216, 190, .2); }
.theme-bull .grid-line { stroke: rgba(255, 221, 202, .14); }
.theme-bull .chart-area { fill: rgba(255, 196, 163, .1); }
.theme-bull .chart-line { stroke: #ffc49e; }
.theme-bull .form-kicker, .theme-bull .form-note span { color: #a9453c; }
.theme-bull .form-content h2, .theme-bull .mobile-brand { color: #532723; }
.theme-bull .submit-button.el-button { background: #aa3731; }
.theme-bull .submit-button.el-button:hover, .theme-bull .submit-button.el-button:focus-visible { background: #c2483c; }
.theme-bull .login-form :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px #b75249 inset, 0 0 0 3px rgba(183, 82, 73, .12); }
.theme-bull .theme-toggle { border-color: #eddbd6; color: #8d433a; }
.theme-bull .theme-swatch { background: #b53a32; }
@media (max-width: 760px) {
  .login-page { align-items: flex-start; padding: 20px; }
  .login-shell { display: block; min-height: 0; max-width: 480px; margin: auto; }
  .brand-panel { display: none; }
  .form-panel { min-height: min(680px, calc(100vh - 40px)); padding: 30px 26px 24px; }
  .mobile-brand { display: flex; color: #1d4335; }
  .form-content { padding: 45px 0; }
  .form-content h2 { font-size: 27px; }
}
@media (max-width: 360px) { .login-page { padding: 12px; } .form-panel { padding-right: 20px; padding-left: 20px; } .captcha-button { flex-basis: 100px; } }
</style>
