<template>
  <div class="works-container">
    <!-- 头部区域 -->
    <header class="hero-header">
      <div class="hero-content">
        <h1 class="hero-title" :class="{ 'mobile-title': isMobile }">
          <span class="title-gradient">项目展示</span>
          <span class="title-sparkle" aria-hidden="true">✨</span>
        </h1>

        <!-- 非移动端浮动装饰元素 -->
        <div class="floating-elements" v-if="!isMobile" aria-hidden="true">
          <div class="floating-element element-1">⚡</div>
          <div class="floating-element element-2">🎨</div>
          <div class="floating-element element-3">💻</div>
        </div>
      </div>
    </header>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 个人作品区域 -->
      <section
        class="section-wrapper personal-section"
        aria-labelledby="personal-projects"
      >
        <div class="section-header animated-header">
          <div class="header-icon">
            <el-icon class="section-icon"><User /></el-icon>
          </div>
          <h2 class="section-title" id="personal-projects">个人项目</h2>
          <div class="header-decoration"></div>
        </div>

        <div class="cards-grid">
          <!-- Chrome扩展插件 -->
          <article
            class="glass-card card-chrome"
            :class="{ 'touch-device': isTouchDevice }"
          >
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><ChromeFilled /></el-icon>
              </div>
              <span class="card-title">Chrome扩展</span>
            </div>
            <div class="card-items">
              <div
                class="interactive-item"
                :class="{ 'touch-active': isTouchDevice }"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/obgljjfbbjnigkpnmjbbdeoekemaieio',
                  )
                "
                @keydown.enter="
                  openLink(
                    'https://chromewebstore.google.com/detail/obgljjfbbjnigkpnmjbbdeoekemaieio',
                  )
                "
                tabindex="0"
                role="button"
                :aria-label="'打开侧边栏Tab管理器扩展页面'"
              >
                <div class="item-content">
                  <span class="item-name">侧边栏Tab管理器</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
              <div
                class="interactive-item"
                :class="{ 'touch-active': isTouchDevice }"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/papfhjbfjcemehhoonkagdndlikahakl',
                  )
                "
                @keydown.enter="
                  openLink(
                    'https://chromewebstore.google.com/detail/papfhjbfjcemehhoonkagdndlikahakl',
                  )
                "
                tabindex="0"
                role="button"
                :aria-label="'打开跨域同步Cookies扩展页面'"
              >
                <div class="item-content">
                  <span class="item-name">跨域同步Cookies</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
              <div
                class="interactive-item"
                :class="{ 'touch-active': isTouchDevice }"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/pcgmfkjckpfjhicmbajcjnkfkeconohc',
                  )
                "
                @keydown.enter="
                  openLink(
                    'https://chromewebstore.google.com/detail/pcgmfkjckpfjhicmbajcjnkfkeconohc',
                  )
                "
                tabindex="0"
                role="button"
                :aria-label="'打开网络请求拦截器扩展页面'"
              >
                <div class="item-content">
                  <span class="item-name">网络请求拦截器</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
            </div>
          </article>

          <!-- Chrome扩展插件 -->
          <!-- 个人网站 -->
          <article
            class="glass-card card-website"
            :class="{ 'touch-device': isTouchDevice }"
          >
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><Document /></el-icon>
              </div>
              <span class="card-title">个人网站</span>
              <span class="website-count">{{ websiteList.length }}个站点</span>
            </div>
            <div class="website-grid">
              <div
                v-for="site in websiteList"
                :key="site.url"
                class="website-item"
                @click="openLink(site.url)"
                @keydown.enter="openLink(site.url)"
                tabindex="0"
                role="button"
                :aria-label="`打开${site.name}`"
              >
                <div
                  class="website-item-icon"
                  :style="{ background: site.color }"
                >
                  <span class="website-item-emoji">{{ site.icon }}</span>
                </div>
                <div class="website-item-info">
                  <span class="website-item-name">{{ site.name }}</span>
                  <span class="website-item-url">{{ site.domain }}</span>
                  <span v-if="site.extra" class="website-item-extra">{{
                    site.extra
                  }}</span>
                </div>
                <el-icon class="website-item-arrow"><Link /></el-icon>
              </div>
            </div>
          </article>

          <!-- 小程序 -->
          <article
            class="glass-card card-miniprogram qr-card"
            :class="{ 'touch-device': isTouchDevice }"
          >
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><Cellphone /></el-icon>
              </div>
              <span class="card-title">小程序</span>
            </div>
            <div class="qr-display">
              <div class="qr-container">
                <picture>
                  <source :srcset="healthToolsAvif" type="image/avif" />
                  <source :srcset="healthToolsWebp" type="image/webp" />
                  <img
                    :src="healthToolsJpg"
                    alt="健康小工具小程序二维码"
                    class="qr-image animated-qr"
                    :class="{ 'mobile-qr': isMobile }"
                    loading="lazy"
                  />
                </picture>
                <div class="qr-overlay">
                  <span class="qr-label">扫码体验</span>
                </div>
              </div>
              <span class="qr-label">健康小工具</span>
            </div>
          </article>
        </div>
      </section>

      <!-- 工作项目区域 -->
      <section
        class="section-wrapper work-section"
        aria-labelledby="work-projects"
      >
        <div class="section-header animated-header">
          <div class="header-icon">
            <el-icon class="section-icon"><Briefcase /></el-icon>
          </div>
          <h2 class="section-title" id="work-projects">工作项目</h2>
          <div class="header-decoration"></div>
        </div>

        <div class="cards-grid">
          <!-- 小程序 -->
          <article
            class="glass-card card-work-miniprogram qr-card"
            :class="{ 'touch-device': isTouchDevice }"
          >
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><Cellphone /></el-icon>
              </div>
              <span class="card-title">小程序</span>
            </div>
            <div class="qr-gallery">
              <div class="qr-item">
                <div class="qr-frame">
                  <picture>
                    <source :srcset="wpe2cAvif" type="image/avif" />
                    <source :srcset="wpe2cWebp" type="image/webp" />
                    <img
                      :src="wpe2cPng"
                      alt="腾讯云发票管家小程序二维码"
                      class="qr-image"
                      :class="{ 'mobile-qr': isMobile }"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <span class="qr-label">腾讯云发票管家</span>
              </div>
              <div class="qr-item">
                <div class="qr-frame">
                  <picture>
                    <source :srcset="wpe2bAvif" type="image/avif" />
                    <source :srcset="wpe2bWebp" type="image/webp" />
                    <img
                      :src="wpe2bPng"
                      alt="腾讯云发票助手小程序二维码"
                      class="qr-image"
                      :class="{ 'mobile-qr': isMobile }"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <span class="qr-label">腾讯云发票助手</span>
              </div>
              <div class="qr-item">
                <div class="qr-frame">
                  <picture>
                    <source :srcset="halfTestAvif" type="image/avif" />
                    <source :srcset="halfTestWebp" type="image/webp" />
                    <img
                      :src="halfTestJpg"
                      alt="半屏测试小程序二维码"
                      class="qr-image"
                      :class="{ 'mobile-qr': isMobile }"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <span class="qr-label">半屏测试</span>
              </div>
            </div>
          </article>

          <!-- Web项目 -->
          <article
            class="glass-card card-web"
            :class="{ 'touch-device': isTouchDevice }"
          >
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><Monitor /></el-icon>
              </div>
              <span class="card-title">Web项目</span>
            </div>
            <div class="project-showcase">
              <div
                class="project-item"
                @click="openLink('https://buy.cloud.tencent.com/tcia')"
                @keydown.enter="openLink('https://buy.cloud.tencent.com/tcia')"
                tabindex="0"
                role="button"
                :aria-label="'打开腾讯云新购页'"
              >
                <div class="project-info">
                  <span class="project-name">腾讯云新购页</span>
                  <el-tag class="project-tag" type="primary" effect="dark">
                    腾讯云
                  </el-tag>
                </div>
                <div class="project-stats">
                  <div class="stat">
                    <span class="stat-value">99.9%</span>
                    <span class="stat-label">可用性</span>
                  </div>
                </div>
              </div>
              <div
                class="project-item"
                @click="openLink('https://efapiao.tencent.com')"
                @keydown.enter="openLink('https://efapiao.tencent.com')"
                tabindex="0"
                role="button"
                :aria-label="'打开线上订购门户'"
              >
                <div class="project-info">
                  <span class="project-name">线上订购门户</span>
                  <el-tag class="project-tag" type="success" effect="dark">
                    自研应用
                  </el-tag>
                </div>
                <div class="project-stats">
                  <div class="stat">
                    <span class="stat-value">300+</span>
                    <span class="stat-label">商户下单</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  User,
  Briefcase,
  ChromeFilled,
  Document,
  Cellphone,
  Monitor,
  Link,
} from '@element-plus/icons-vue';
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';

// 个人网站数据列表 - 后期新增网站只需在此数组中添加即可
const websiteList = ref([
  {
    name: '个人博客',
    url: 'https://zhangyingxuan.github.io/',
    domain: 'zhangyingxuan.github.io',
    icon: '📝',
    color: 'rgba(99, 102, 241, 0.3)',
  },
  {
    name: 'A股复盘工具',
    url: 'https://blowsysun.top',
    domain: 'blowsysun.top',
    icon: '📈',
    color: 'rgba(239, 68, 68, 0.3)',
    extra: '账号user 密码: user@123',
  },
  {
    name: '图片转换工具',
    url: 'https://v2.blowsysun.top',
    domain: 'v2.blowsysun.top',
    icon: '🖼️',
    color: 'rgba(16, 185, 129, 0.3)',
  },
  {
    name: '学习字帖',
    url: 'https://study.blowsysun.top/',
    domain: 'study.blowsysun.top',
    icon: '✍️',
    color: 'rgba(245, 158, 11, 0.3)',
  },
  {
    name: '智能UI实践',
    url: 'https://ui.blowsysun.top/',
    domain: 'ui.blowsysun.top',
    icon: '🤖',
    color: 'rgba(139, 92, 246, 0.3)',
  },
]);

import healthToolsAvif from '../../assets/img/health-tools.avif';
import healthToolsWebp from '../../assets/img/health-tools.webp';
import healthToolsJpg from '../../assets/img/health-tools.jpg';

import wpe2cAvif from '../../assets/img/wpe2c.avif';
import wpe2cWebp from '../../assets/img/wpe2c.webp';
import wpe2cPng from '../../assets/img/wpe2c.png';

import wpe2bAvif from '../../assets/img/wpe2b.avif';
import wpe2bWebp from '../../assets/img/wpe2b.webp';
import wpe2bPng from '../../assets/img/wpe2b.png';

import halfTestAvif from '../../assets/img/halfTest.avif';
import halfTestWebp from '../../assets/img/halfTest.webp';
import halfTestJpg from '../../assets/img/halfTest.jpg';

// 浏览器兼容性检测
const isTouchDevice = ref(false);
const isSafari = ref(false);
const isMobile = ref(false);
const isTablet = ref(false);
const windowWidth = ref(
  typeof window !== 'undefined' ? window.innerWidth : 1024,
);

// 响应式断点
const BREAKPOINTS = {
  xs: 375, // 超小屏手机
  sm: 576, // 小屏手机
  md: 768, // 平板竖屏
  lg: 1024, // 平板横屏
  xl: 1200, // 桌面端
  xxl: 1440, // 大屏桌面
} as const;

// 检测设备类型
const detectDevice = () => {
  isTouchDevice.value =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ('msMaxTouchPoints' in navigator &&
      (navigator as any).msMaxTouchPoints > 0);

  isSafari.value = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  windowWidth.value = window.innerWidth;

  // 移动端判断：宽度<=768 或 UA匹配
  isMobile.value =
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth <= BREAKPOINTS.md;

  // 平板判断：宽度在768~1024之间 或 iPad UA
  isTablet.value =
    /iPad/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Macintosh') && isTouchDevice.value) ||
    (window.innerWidth > BREAKPOINTS.md &&
      window.innerWidth <= BREAKPOINTS.lg &&
      isTouchDevice.value);
};

// 检查CSS支持
const supportsCSS = (property: string) => {
  if (typeof window === 'undefined') return false;

  const element = document.createElement('div');
  if (property in element.style) return true;

  const prefixes = ['webkit', 'Webkit', 'moz', 'Moz', 'ms', 'Ms', 'o', 'O'];
  const propertyName = property.charAt(0).toUpperCase() + property.slice(1);

  for (const prefix of prefixes) {
    const prefixedProperty = prefix + propertyName;
    if (prefixedProperty in element.style) return true;
  }

  return false;
};

// 防抖函数，优化性能
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const openLink = (url: string) => {
  // 移动端/平板优化：使用更安全的打开方式
  if (isMobile.value || isTablet.value) {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.focus();
    } else {
      window.location.href = url;
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// 存储清理函数
let resizeCleanup: (() => void) | null = null;
let observer: IntersectionObserver | null = null;

// 添加页面加载动画
onMounted(() => {
  detectDevice();

  // 优化滚动动画效果
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  // 检查IntersectionObserver支持
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');

          // 移动端/平板优化：减少动画延迟
          if (isMobile.value || isTablet.value) {
            const targetElement = entry.target as HTMLElement;
            targetElement.style.animationDelay = '0.1s';
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('.glass-card').forEach(card => {
      observer!.observe(card);
    });
  } else {
    // 不支持IntersectionObserver的回退方案
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-in');
      }, index * 100);
    });
  }

  // 窗口大小变化监听 - 响应式核心
  const handleResize = debounce(() => {
    detectDevice();
  }, 200);

  window.addEventListener('resize', handleResize);
  // 监听屏幕方向变化（平板/手机旋转）
  window.addEventListener('orientationchange', () => {
    // orientationchange后延迟执行，等待浏览器完成布局
    setTimeout(() => {
      detectDevice();
    }, 100);
  });

  resizeCleanup = () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };

  // 触摸设备优化：添加触摸反馈
  if (isTouchDevice.value) {
    const touchTargets = document.querySelectorAll(
      '.interactive-item, .project-item, .website-item',
    );
    touchTargets.forEach(element => {
      element.addEventListener(
        'touchstart',
        () => {
          element.classList.add('touch-active');
        },
        { passive: true },
      );

      element.addEventListener(
        'touchend',
        () => {
          element.classList.remove('touch-active');
        },
        { passive: true },
      );

      element.addEventListener(
        'touchcancel',
        () => {
          element.classList.remove('touch-active');
        },
        { passive: true },
      );
    });
  }

  // Safari浏览器特殊优化
  if (isSafari.value) {
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
      if (!supportsCSS('backdropFilter')) {
        (card as HTMLElement).style.backgroundColor = 'rgba(30, 64, 175, 0.4)';
      }
    });
  }

  // 键盘导航支持（无障碍）
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      const activeElement = event.target as HTMLElement;
      if (
        activeElement.classList.contains('interactive-item') ||
        activeElement.classList.contains('website-item')
      ) {
        event.preventDefault();
        activeElement.click();
      }
    }
  });
});

// 组件销毁时清理
onBeforeUnmount(() => {
  if (resizeCleanup) resizeCleanup();
  if (observer) observer.disconnect();
});
</script>

<style scoped lang="less">
/* ============================
   动画定义（含浏览器兼容前缀）
   ============================ */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}
@-webkit-keyframes float {
  0%,
  100% {
    -webkit-transform: translateY(0px) rotate(0deg);
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    -webkit-transform: translateY(-10px) rotate(5deg);
    transform: translateY(-10px) rotate(5deg);
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
@-webkit-keyframes glow {
  0%,
  100% {
    opacity: 0.5;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    -webkit-transform: scale(1.05);
    transform: scale(1.05);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@-webkit-keyframes slideInUp {
  from {
    opacity: 0;
    -webkit-transform: translateY(30px);
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
@-webkit-keyframes pulse {
  0%,
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@-webkit-keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* ============================
   全局容器
   ============================ */
.works-container {
  overflow: auto;
  overflow-x: hidden;
  height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available; /* iOS Safari 全屏适配 */
  background: #1e3a8a; /* 渐变回退色 */
  background: -webkit-linear-gradient(
    135deg,
    #1e3a8a 0%,
    #2563eb 25%,
    #3b82f6 50%,
    #60a5fa 75%,
    #93c5fd 100%
  );
  background: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #2563eb 25%,
    #3b82f6 50%,
    #60a5fa 75%,
    #93c5fd 100%
  );
  background-size: 400% 400%;
  -webkit-background-size: 400% 400%;
  -webkit-animation: gradientShift 15s ease infinite;
  animation: gradientShift 15s ease infinite;
  position: relative;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  /* iOS 安全区域适配 */
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-bottom: constant(safe-area-inset-bottom, 0); /* iOS < 11.2 */
  box-sizing: border-box;
  /* 防止移动端橡皮筋效果导致布局拉伸 */
  overscroll-behavior-y: contain;
}
/* ============================
   个人网站模块
   ============================ */
.login-info {
  margin-left: 10px;
  color: #ccc;
}

.card-website {
  .website-count {
    margin-left: auto;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 10px;
    border-radius: 20px;
    white-space: nowrap;
  }
}

.website-grid {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 2px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    &:hover {
      background: rgba(255, 255, 255, 0.35);
    }
  }
  /* Firefox 滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

.website-item {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  gap: 10px;
  /* flex布局实现两列效果，兼容性优于grid */
  -webkit-box-flex: 0;
  -ms-flex: 0 0 calc(50% - 5px);
  -webkit-flex: 0 0 calc(50% - 5px);
  flex: 0 0 calc(50% - 5px);
  width: calc(50% - 5px);
  max-width: calc(50% - 5px);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
  -webkit-tap-highlight-color: transparent;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.2);
    -webkit-transform: translateY(-2px);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

    .website-item-arrow {
      color: #93c5fd;
      -webkit-transform: translateX(2px);
      transform: translateX(2px);
    }
  }

  &.touch-active {
    background: rgba(255, 255, 255, 0.2) !important;
    -webkit-transform: scale(0.97) !important;
    transform: scale(0.97) !important;
  }

  .website-item-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-flex-shrink: 0;
    flex-shrink: 0;

    .website-item-emoji {
      font-size: 1.1rem;
      line-height: 1;
    }
  }

  .website-item-info {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    -webkit-flex: 1;
    flex: 1;
    min-width: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    gap: 2px;

    .website-item-name {
      color: white;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .website-item-url {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.7rem;
      font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .website-item-extra {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.65rem;
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .website-item-arrow {
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.85rem;
    -webkit-flex-shrink: 0;
    flex-shrink: 0;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
  }
}
/* ============================
   头部区域
   ============================ */
.hero-header {
  position: relative;
  padding: 40px 20px 30px;
  /* iOS 安全区域适配 */
  padding-top: calc(40px + env(safe-area-inset-top, 0));
  padding-top: calc(40px + constant(safe-area-inset-top, 0));
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 30px;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;

  .title-gradient {
    font-size: 2.8rem;
    font-weight: 800;
    background: -webkit-linear-gradient(45deg, #dbeafe, #93c5fd, #60a5fa);
    background: linear-gradient(45deg, #dbeafe, #93c5fd, #60a5fa);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent; /* 回退 */
    background-size: 200% 200%;
    -webkit-background-size: 200% 200%;
    -webkit-animation: gradientShift 3s ease infinite;
    animation: gradientShift 3s ease infinite;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .title-sparkle {
    font-size: 1.6rem;
    -webkit-animation: pulse 2s ease-in-out infinite;
    animation: pulse 2s ease-in-out infinite;
  }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;

  .floating-element {
    position: absolute;
    font-size: 2rem;
    opacity: 0.3;
    -webkit-animation: float 6s ease-in-out infinite;
    animation: float 6s ease-in-out infinite;
    will-change: transform; /* GPU加速 */

    &.element-1 {
      top: 20%;
      left: 10%;
      -webkit-animation-delay: 0s;
      animation-delay: 0s;
    }

    &.element-2 {
      top: 60%;
      right: 15%;
      -webkit-animation-delay: 2s;
      animation-delay: 2s;
    }

    &.element-3 {
      bottom: 30%;
      left: 20%;
      -webkit-animation-delay: 4s;
      animation-delay: 4s;
    }
  }
}

/* ============================
   内容区域
   ============================ */
.content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 15px 20px;
  /* iOS 安全区域左右适配 */
  padding-left: calc(15px + env(safe-area-inset-left, 0));
  padding-left: calc(15px + constant(safe-area-inset-left, 0));
  padding-right: calc(15px + env(safe-area-inset-right, 0));
  padding-right: calc(15px + constant(safe-area-inset-right, 0));
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
}

.section-wrapper {
  margin-bottom: 25px;
  -webkit-animation: slideInUp 0.6s ease-out;
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
  -webkit-animation-fill-mode: both;

  &.personal-section {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }

  &.work-section {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }
}

.section-header {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  position: relative;

  .header-icon {
    background: rgba(255, 255, 255, 0.2);
    padding: 12px;
    border-radius: 50%;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    -webkit-flex-shrink: 0;
    flex-shrink: 0;

    .section-icon {
      color: white;
      font-size: 1.8rem;
      display: block;
    }
  }

  .section-title {
    font-size: 2rem;
    color: white;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  .header-decoration {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    -webkit-flex: 1;
    flex: 1;
    height: 2px;
    background: -webkit-linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    margin-left: 20px;
    min-width: 40px;
  }
}

/* ============================
   卡片网格布局
   ============================ */
.cards-grid {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  gap: 15px;

  /* 三列布局：每个卡片占约1/3 */
  > .glass-card {
    -webkit-box-flex: 1;
    -ms-flex: 1 1 calc(33.333% - 10px);
    -webkit-flex: 1 1 calc(33.333% - 10px);
    flex: 1 1 calc(33.333% - 10px);
    min-width: 180px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    &:first-child {
      -ms-flex: 1 1 calc(20% - 10px);
      -webkit-flex: 1 1 calc(20% - 10px);
      flex: 1 1 calc(20% - 10px);
      margin-left: 0;
    }
    &:last-child {
      -ms-flex: 1 1 calc(10% - 10px);
      -webkit-flex: 1 1 calc(10% - 10px);
      flex: 1 1 calc(10% - 10px);
      margin-right: 0;
    }
  }
}

.glass-card {
  background: -webkit-linear-gradient(
    135deg,
    rgba(30, 64, 175, 0.15),
    rgba(59, 130, 246, 0.15)
  );
  background: linear-gradient(
    135deg,
    rgba(30, 64, 175, 0.15),
    rgba(59, 130, 246, 0.15)
  );
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  -webkit-transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;

  &:hover {
    -webkit-transform: translateY(-4px) scale(1.01);
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.08);

    .card-glow {
      opacity: 1;
      -webkit-transform: scale(1.05);
      transform: scale(1.05);
    }
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: -webkit-radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  -webkit-transition: all 0.6s ease;
  transition: all 0.6s ease;
  pointer-events: none;
}

.card-header {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;

  .icon-wrapper {
    background: rgba(255, 255, 255, 0.15);
    padding: 8px;
    border-radius: 10px;
    -webkit-flex-shrink: 0;
    flex-shrink: 0;

    .card-icon {
      color: white;
      font-size: 1.2rem;
      display: block;
    }
  }

  .card-title {
    font-size: 1.1rem;
    color: white;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

.card-items {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  gap: 8px;
}

/* ============================
   交互元素
   ============================ */
.interactive-item {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none; /* 禁止长按菜单 */

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    -webkit-transform: translateX(3px);
    transform: translateX(3px);

    .item-hover-effect {
      -webkit-transform: translateX(0);
      transform: translateX(0);
    }

    .link-icon {
      -webkit-transform: translateX(2px);
      transform: translateX(2px);
      color: #93c5fd;
    }
  }

  &.touch-active {
    background: rgba(255, 255, 255, 0.2) !important;
    -webkit-transform: scale(0.97) !important;
    transform: scale(0.97) !important;
  }

  .item-content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    position: relative;
    z-index: 2;

    .item-name {
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .link-icon {
      color: rgba(255, 255, 255, 0.6);
      -webkit-transition: all 0.2s ease;
      transition: all 0.2s ease;
      -webkit-flex-shrink: 0;
      flex-shrink: 0;
    }
  }

  .item-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: -webkit-linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.08),
      transparent
    );
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.08),
      transparent
    );
    -webkit-transform: translateX(-100%);
    transform: translateX(-100%);
    -webkit-transition: transform 0.3s ease;
    transition: transform 0.3s ease;
  }
}

/* ============================
   二维码展示区域
   ============================ */
.qr-display,
.qr-gallery {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  gap: 12px;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}
.qr-display {
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  .qr-label {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
  }
}

.qr-container {
  position: relative;

  .qr-image {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    -o-object-fit: cover;
    object-fit: cover;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
    image-rendering: -webkit-optimize-contrast;

    &.animated-qr {
      -webkit-animation: glow 3s ease-in-out infinite;
      animation: glow 3s ease-in-out infinite;
    }

    &:hover {
      -webkit-transform: scale(1.05);
      transform: scale(1.05);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }

  .qr-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    border-radius: 10px;
    opacity: 0;
    -webkit-transition: opacity 0.2s ease;
    transition: opacity 0.2s ease;

    .qr-label {
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
    }
  }

  &:hover .qr-overlay {
    opacity: 1;
  }
}

.qr-item {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  gap: 6px;

  .qr-frame {
    position: relative;

    .qr-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      -o-object-fit: cover;
      object-fit: cover;
      -webkit-transition: all 0.2s ease;
      transition: all 0.2s ease;
      /* 图片渲染优化 */
      image-rendering: -webkit-optimize-contrast;

      &:hover {
        -webkit-transform: scale(1.04);
        transform: scale(1.04);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }

    .qr-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      background: #ef4444;
      color: white;
      padding: 1px 4px;
      border-radius: 6px;
      font-size: 0.6rem;
      font-weight: 600;
    }
  }

  .qr-label {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.7rem;
    font-weight: 500;
    text-align: center;
  }
}

.project-showcase {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  gap: 10px;
}

.project-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    -webkit-transform: translateX(3px);
    transform: translateX(3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: -webkit-linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    -webkit-transition: left 0.5s ease;
    transition: left 0.5s ease;
  }

  &:hover::after {
    left: 100%;
  }

  .project-info {
    position: relative;
    z-index: 2;
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .project-name {
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      -webkit-transition: color 0.2s ease;
      transition: color 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .project-tag {
      font-size: 0.6rem;
      border: none;
      -webkit-flex-shrink: 0;
      flex-shrink: 0;
    }
  }

  &:hover .project-name {
    color: #93c5fd;
  }

  .project-stats {
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    gap: 10px;
    position: relative;
    z-index: 2;
    -webkit-flex-shrink: 0;
    flex-shrink: 0;

    .stat {
      display: -webkit-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-box-align: center;
      -ms-flex-align: center;
      -webkit-align-items: center;
      align-items: center;

      .stat-value {
        color: #93c5fd;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.6rem;
      }
    }
  }

  &.touch-active {
    background: rgba(255, 255, 255, 0.2) !important;
    -webkit-transform: scale(0.98) !important;
    transform: scale(0.98) !important;
  }
}

/* ============================
   响应式设计 - 按断点逐级适配
   ============================ */

/* 大屏桌面 1440px+ */
@media (min-width: 1440px) {
  .content-wrapper {
    max-width: 1200px;
  }
}

/* 桌面端 1200px */
@media (max-width: 1200px) {
  .content-wrapper {
    max-width: 900px;
    padding: 0 20px 20px;
  }
}

/* 平板横屏 / 小桌面 1024px */
@media (max-width: 1024px) {
  .content-wrapper {
    max-width: 768px;
    padding: 0 20px 20px;
  }

  .cards-grid > .glass-card {
    -ms-flex: 1 1 calc(50% - 8px);
    -webkit-flex: 1 1 calc(50% - 8px);
    flex: 1 1 calc(50% - 8px);
    min-width: 240px;
  }

  .section-header {
    .section-title {
      font-size: 1.8rem;
    }
  }

  .hero-title .title-gradient {
    font-size: 2.5rem;
  }
}

/* 平板竖屏 768px */
@media (max-width: 768px) {
  .hero-header {
    padding: 30px 15px 20px;
    padding-top: calc(30px + env(safe-area-inset-top, 0));
    padding-top: calc(30px + constant(safe-area-inset-top, 0));
  }

  .hero-title .title-gradient {
    font-size: 2.2rem;
  }

  .cards-grid {
    gap: 12px;

    > .glass-card {
      -ms-flex: 1 1 100%;
      -webkit-flex: 1 1 100%;
      flex: 1 1 100%;
      min-width: 0;
    }
  }

  .glass-card {
    padding: 16px;
  }

  .section-header {
    gap: 10px;
    margin-bottom: 15px;

    .header-decoration {
      min-width: 30px;
    }

    .section-title {
      font-size: 1.6rem;
    }
  }

  /* 二维码在平板竖屏下适当放大 */
  .qr-item .qr-frame .qr-image {
    width: 55px;
    height: 55px;
  }
}

/* 手机端 576px */
@media (max-width: 576px) {
  .hero-header {
    padding: 20px 10px 15px;
    padding-top: calc(20px + env(safe-area-inset-top, 0));
    padding-top: calc(20px + constant(safe-area-inset-top, 0));
    margin-bottom: 20px;
  }

  .hero-title {
    gap: 8px;

    .title-gradient {
      font-size: 1.8rem;
    }

    .title-sparkle {
      font-size: 1.2rem;
    }
  }

  .content-wrapper {
    padding: 0 10px 15px;
    padding-left: calc(10px + env(safe-area-inset-left, 0));
    padding-left: calc(10px + constant(safe-area-inset-left, 0));
    padding-right: calc(10px + env(safe-area-inset-right, 0));
    padding-right: calc(10px + constant(safe-area-inset-right, 0));
  }

  .section-header {
    .section-title {
      font-size: 1.5rem;
    }

    .header-icon {
      padding: 10px;

      .section-icon {
        font-size: 1.5rem;
      }
    }
  }

  .glass-card {
    padding: 14px;
    border-radius: 12px;
  }

  .card-header {
    .card-title {
      font-size: 1rem;
    }
  }

  .interactive-item {
    padding: 8px 10px;

    .item-name {
      font-size: 0.85rem;
    }
  }

  /* 网站项在小屏手机改为单列 */
  .website-item {
    -ms-flex: 0 0 100%;
    -webkit-flex: 0 0 100%;
    flex: 0 0 100%;
    width: 100%;
    max-width: 100%;
  }

  .qr-container .qr-image {
    width: 70px;
    height: 70px;
  }

  .qr-item .qr-frame .qr-image {
    width: 50px;
    height: 50px;
  }

  .project-item {
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    gap: 6px;

    .project-info {
      -ms-flex: 1 1 auto;
      -webkit-flex: 1 1 auto;
      flex: 1 1 auto;
    }
  }
}

/* 超小屏手机 375px */
@media (max-width: 375px) {
  .hero-title .title-gradient {
    font-size: 1.5rem;
  }

  .section-header {
    gap: 8px;

    .section-title {
      font-size: 1.2rem;
    }

    .header-icon {
      padding: 8px;

      .section-icon {
        font-size: 1.3rem;
      }
    }
  }

  .glass-card {
    padding: 12px;
  }

  .card-header {
    gap: 8px;
  }

  .website-item {
    padding: 8px 10px;
    gap: 8px;

    .website-item-icon {
      width: 30px;
      height: 30px;
      min-width: 30px;
      border-radius: 8px;

      .website-item-emoji {
        font-size: 0.9rem;
      }
    }

    .website-item-info {
      .website-item-name {
        font-size: 0.8rem;
      }
      .website-item-url {
        font-size: 0.6rem;
      }
    }
  }

  .qr-container .qr-image {
    width: 60px;
    height: 60px;
  }

  .qr-item .qr-frame .qr-image {
    width: 45px;
    height: 45px;
  }

  .project-item {
    padding: 8px 10px;

    .project-info .project-name {
      font-size: 0.8rem;
    }

    .project-stats .stat {
      .stat-value {
        font-size: 0.8rem;
      }
      .stat-label {
        font-size: 0.55rem;
      }
    }
  }
}

/* ============================
   触摸设备优化
   ============================ */
@media (hover: none) and (pointer: coarse) {
  /* 触摸设备移除hover效果，避免粘滞 */
  .interactive-item:hover {
    background: rgba(255, 255, 255, 0.08);
    -webkit-transform: none;
    transform: none;
  }

  .glass-card:hover {
    -webkit-transform: none;
    transform: none;
    box-shadow: none;
  }

  .qr-container .qr-image:hover {
    -webkit-transform: none;
    transform: none;
  }

  .project-item:hover {
    -webkit-transform: none;
    transform: none;
    box-shadow: none;
  }

  .website-item:hover {
    -webkit-transform: none;
    transform: none;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.06);
  }

  /* 触摸设备卡片点击时的反馈 */
  .interactive-item.touch-active {
    background: rgba(255, 255, 255, 0.2) !important;
    -webkit-transform: scale(0.97) !important;
    transform: scale(0.97) !important;
  }
}

/* 平板横屏专用优化 */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .cards-grid > .glass-card {
    -ms-flex: 1 1 calc(50% - 8px);
    -webkit-flex: 1 1 calc(50% - 8px);
    flex: 1 1 calc(50% - 8px);
  }

  .website-item {
    -ms-flex: 0 0 calc(50% - 5px);
    -webkit-flex: 0 0 calc(50% - 5px);
    flex: 0 0 calc(50% - 5px);
    width: calc(50% - 5px);
    max-width: calc(50% - 5px);
  }
}

/* 手机横屏专用优化 */
@media (max-width: 767px) and (orientation: landscape) {
  .hero-header {
    padding: 15px 15px 10px;
  }

  .hero-title .title-gradient {
    font-size: 1.8rem;
  }

  .cards-grid > .glass-card {
    -ms-flex: 1 1 calc(50% - 8px);
    -webkit-flex: 1 1 calc(50% - 8px);
    flex: 1 1 calc(50% - 8px);
    min-width: 200px;
  }

  .website-item {
    -ms-flex: 0 0 calc(50% - 5px);
    -webkit-flex: 0 0 calc(50% - 5px);
    flex: 0 0 calc(50% - 5px);
    width: calc(50% - 5px);
    max-width: calc(50% - 5px);
  }

  .website-grid {
    max-height: 200px;
  }
}

/* ============================
   高分辨率屏幕优化
   ============================ */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .hero-title .title-gradient {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Retina屏下1px边框优化 */
  .glass-card {
    border-width: 0.5px;
  }

  .website-item {
    border-width: 0.5px;
  }
}

/* ============================
   减少动效偏好（无障碍）
   ============================ */
@media (prefers-reduced-motion: reduce) {
  .works-container {
    -webkit-animation: none;
    animation: none;
  }

  .floating-element {
    -webkit-animation: none !important;
    animation: none !important;
  }

  .title-sparkle {
    -webkit-animation: none !important;
    animation: none !important;
  }

  .section-wrapper {
    -webkit-animation: none;
    animation: none;
  }

  .glass-card,
  .interactive-item,
  .project-item,
  .website-item {
    -webkit-transition: none;
    transition: none;
  }
}

/* ============================
   打印样式
   ============================ */
@media print {
  .works-container {
    background: white !important;
    color: black !important;
  }

  .glass-card {
    background: white !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
  }

  .hero-title .title-gradient {
    background: black !important;
    -webkit-text-fill-color: black !important;
    color: black !important;
  }
}
</style>
