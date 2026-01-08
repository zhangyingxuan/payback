<template>
  <div class="works-container">
    <!-- 惊艳头部设计 -->
    <div class="hero-header">
      <div class="hero-content">
        <h1 class="hero-title" :class="{ 'mobile-title': isMobile }">
          <span class="title-gradient">项目展示</span>
          <div class="title-sparkle">✨</div>
        </h1>

        <!-- 移动端优化：简化浮动元素 -->
        <div class="floating-elements" v-if="!isMobile">
          <div class="floating-element element-1">⚡</div>
          <div class="floating-element element-2">🎨</div>
          <div class="floating-element element-3">💻</div>
        </div>
      </div>
    </div>

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
            </div>
            <div class="card-items">
              <div
                class="interactive-item"
                :class="{ 'touch-active': isTouchDevice }"
                @click="openLink('https://zhangyingxuan.github.io/')"
                @keydown.enter="openLink('https://zhangyingxuan.github.io/')"
                tabindex="0"
                role="button"
                :aria-label="'打开个人博客网站'"
              >
                <div class="item-content">
                  <span class="item-name">个人博客</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
              <div
                class="interactive-item"
                :class="{ 'touch-active': isTouchDevice }"
                @click="openLink('https://blowsysun.top')"
                @keydown.enter="openLink('https://blowsysun.top')"
                tabindex="0"
                role="button"
                :aria-label="'打开A股复盘工具网站'"
              >
                <div class="item-content">
                  <span class="item-name"
                    >A股复盘工具<span class="login-info"
                      >账号user密码: user@123</span
                    ></span
                  >
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
              <div
                class="interactive-item"
                :class="{ 'touch-active': isTouchDevice }"
                @click="openLink('https://v2.blowsysun.top')"
                @keydown.enter="openLink('https://v2.blowsysun.top')"
                tabindex="0"
                role="button"
                :aria-label="'图片转换工具'"
              >
                <div class="item-content">
                  <span class="item-name">图片转换工具</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
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

    <!-- 移动端优化：添加触摸反馈指示器 -->
    <div v-if="isTouchDevice" class="touch-indicator"></div>
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
import { onMounted, ref } from 'vue';

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

// 检测设备类型
const detectDevice = () => {
  isTouchDevice.value =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ('msMaxTouchPoints' in navigator &&
      (navigator as any).msMaxTouchPoints > 0);

  isSafari.value = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  isMobile.value =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth <= 768;
};

// 检查CSS支持
const supportsCSS = (property: string) => {
  if (typeof window === 'undefined') return false;

  // 检查CSS属性支持
  const element = document.createElement('div');

  // 检查标准属性
  if (property in element.style) return true;

  // 检查带前缀的属性
  const prefixes = ['webkit', 'moz', 'ms', 'o'];
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
  // 移动端优化：使用更安全的打开方式
  if (isMobile.value) {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.focus();
    } else {
      // 如果被阻止，使用location.href
      window.location.href = url;
    }
  } else {
    window.open(url, '_blank');
  }
};

// 修复第442行左右的Element类型错误
const handleElementStyle = (element: HTMLElement) => {
  // 添加类型断言确保element是HTMLElement
  const htmlElement = element as HTMLElement;
  if (htmlElement.style) {
    htmlElement.style.display = 'none';
  }
};

// 添加页面加载动画
onMounted(() => {
  detectDevice();

  // 移动端优化：禁用双击缩放
  if (isMobile.value) {
    let lastTouchEnd = 0;
    document.addEventListener(
      'touchend',
      event => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      false,
    );
  }

  // 优化滚动动画效果
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  // 检查IntersectionObserver支持
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');

          // 移动端优化：减少动画延迟
          if (isMobile.value) {
            const targetElement = entry.target as HTMLElement;
            targetElement.style.animationDelay = '0.1s';
          }
        }
      });
    }, observerOptions);

    // 观察所有卡片元素
    document.querySelectorAll('.glass-card').forEach(card => {
      observer.observe(card);
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

  // 添加窗口大小变化监听
  const handleResize = debounce(() => {
    detectDevice();

    // 移动端优化：调整字体大小
    if (isMobile.value) {
      const viewportWidth = window.innerWidth;
      if (viewportWidth < 375) {
        document.documentElement.style.fontSize = '14px';
      } else {
        document.documentElement.style.fontSize = '16px';
      }
    }
  }, 250);

  window.addEventListener('resize', handleResize);

  // 触摸设备优化
  if (isTouchDevice.value) {
    // 添加触摸反馈
    const interactiveElements = document.querySelectorAll('.interactive-item');
    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });

      element.addEventListener('touchend', () => {
        element.classList.remove('touch-active');
      });
    });

    // 为项目项添加触摸反馈
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });

      element.addEventListener('touchend', () => {
        element.classList.remove('touch-active');
      });
    });
  }

  // Safari浏览器特殊优化
  if (isSafari.value) {
    // Safari的backdrop-filter支持较差，添加回退
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
      if (!supportsCSS('backdrop-filter')) {
        (card as HTMLElement).style.backgroundColor =
          'rgba(255, 255, 255, 0.1)';
      }
    });
  }

  // 添加键盘导航支持
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      const activeElement = event.target as HTMLElement;
      if (activeElement.classList.contains('interactive-item')) {
        event.preventDefault();
        activeElement.click();
      }
    }
  });

  // 清理函数
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});
</script>

<style scoped lang="less">
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
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

/* 浏览器兼容性前缀 */
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

.works-container {
  overflow: auto;
  height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available; /* 移动端适配 */
  background: #1e3a8a; /* 渐变回退色 */
  background: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #2563eb 25%,
    #3b82f6 50%,
    #60a5fa 75%,
    #93c5fd 100%
  );
  background: -webkit-linear-gradient(
    135deg,
    #1e3a8a 0%,
    #2563eb 25%,
    #3b82f6 50%,
    #60a5fa 75%,
    #93c5fd 100%
  );
  background-size: 400% 400%;
  -webkit-background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  -webkit-animation: gradientShift 15s ease infinite;
  position: relative;
  overflow-x: hidden;
}
.login-info {
  margin-left: 10px;
  color: #ccc;
}
.hero-header {
  position: relative;
  padding: 40px 20px 30px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;

  .title-gradient {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(45deg, #dbeafe, #93c5fd, #60a5fa);
    background: -webkit-linear-gradient(45deg, #dbeafe, #93c5fd, #60a5fa);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    -webkit-background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
    -webkit-animation: gradientShift 3s ease infinite;
  }

  .title-sparkle {
    font-size: 1.6rem;
    animation: pulse 2s ease-in-out infinite;
    -webkit-animation: pulse 2s ease-in-out infinite;
  }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .floating-element {
    position: absolute;
    font-size: 2rem;
    opacity: 0.3;
    animation: float 6s ease-in-out infinite;
    -webkit-animation: float 6s ease-in-out infinite;

    &.element-1 {
      top: 20%;
      left: 10%;
      animation-delay: 0s;
      -webkit-animation-delay: 0s;
    }

    &.element-2 {
      top: 60%;
      right: 15%;
      animation-delay: 2s;
      -webkit-animation-delay: 2s;
    }

    &.element-3 {
      bottom: 30%;
      left: 20%;
      animation-delay: 4s;
      -webkit-animation-delay: 4s;
    }
  }
}

.content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 15px 20px;
  box-sizing: border-box;
}

.section-wrapper {
  margin-bottom: 25px;
  animation: slideInUp 0.6s ease-out;
  -webkit-animation: slideInUp 0.6s ease-out;

  &.personal-section {
    animation-delay: 0.1s;
    -webkit-animation-delay: 0.1s;
  }

  &.work-section {
    animation-delay: 0.2s;
    -webkit-animation-delay: 0.2s;
  }
}

.section-header {
  display: flex;
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

    .section-icon {
      color: white;
      font-size: 1.8rem;
    }
  }

  .section-title {
    font-size: 2rem;
    color: white;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .header-decoration {
    flex: 1;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    background: -webkit-linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    margin-left: 20px;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.glass-card {
  background: linear-gradient(
    135deg,
    rgba(30, 64, 175, 0.15),
    rgba(59, 130, 246, 0.15)
  );
  background: -webkit-linear-gradient(
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
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  -webkit-transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    -webkit-transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.08);

    .card-glow {
      opacity: 1;
      transform: scale(1.05);
      -webkit-transform: scale(1.05);
    }
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  background: -webkit-radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: all 0.6s ease;
  -webkit-transition: all 0.6s ease;
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;

  .icon-wrapper {
    background: rgba(255, 255, 255, 0.15);
    padding: 8px;
    border-radius: 10px;

    .card-icon {
      color: white;
      font-size: 1.2rem;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.interactive-item {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-transition: all 0.2s ease;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent; /* 移动端点击高亮 */

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(3px);
    -webkit-transform: translateX(3px);

    .item-hover-effect {
      transform: translateX(0);
      -webkit-transform: translateX(0);
    }

    .link-icon {
      transform: translateX(2px);
      -webkit-transform: translateX(2px);
      color: #93c5fd;
    }
  }

  .item-content {
    display: flex;
    justify-content: space-between;
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
      transition: all 0.2s ease;
      -webkit-transition: all 0.2s ease;
    }
  }

  .item-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.08),
      transparent
    );
    background: -webkit-linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.08),
      transparent
    );
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
    transition: transform 0.3s ease;
    -webkit-transition: transform 0.3s ease;
  }
}

.qr-display,
.qr-gallery {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.qr-display {
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
    object-fit: cover;
    transition: all 0.2s ease;
    -webkit-transition: all 0.2s ease;

    &.animated-qr {
      animation: glow 3s ease-in-out infinite;
      -webkit-animation: glow 3s ease-in-out infinite;
    }

    &:hover {
      transform: scale(1.05);
      -webkit-transform: scale(1.05);
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
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.2s ease;
    -webkit-transition: opacity 0.2s ease;

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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .qr-frame {
    position: relative;

    .qr-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      object-fit: cover;
      transition: all 0.2s ease;
      -webkit-transition: all 0.2s ease;

      &:hover {
        transform: scale(1.04);
        -webkit-transform: scale(1.04);
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.project-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  -webkit-transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(3px);
    -webkit-transform: translateX(3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    background: -webkit-linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease;
    -webkit-transition: left 0.5s ease;
  }

  &:hover::after {
    left: 100%;
  }

  .project-info {
    position: relative;
    z-index: 2;
  }

  .project-name {
    position: relative;
    transition: color 0.2s ease;
    -webkit-transition: color 0.2s ease;
  }

  &:hover .project-name {
    color: #93c5fd;
  }

  .project-tag {
    position: relative;
    z-index: 2;
  }

  .project-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .project-name {
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .project-tag {
      font-size: 0.6rem;
      border: none;
    }
  }

  .project-stats {
    display: flex;
    gap: 10px;
    position: relative;
    z-index: 2;

    .stat {
      display: flex;
      flex-direction: column;
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
    transform: scale(0.98) !important;
    -webkit-transform: scale(0.98) !important;
  }
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .content-wrapper {
    max-width: 900px;
    padding: 0 20px 20px;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .content-wrapper {
    max-width: 768px;
    padding: 0 15px 20px;
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

@media (max-width: 768px) {
  .hero-header {
    padding: 30px 15px 20px;
  }

  .hero-title .title-gradient {
    font-size: 2.2rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .glass-card {
    padding: 20px;
  }

  .section-header {
    text-align: center;
    gap: 10px;
    margin-bottom: 10px;

    .header-decoration {
      margin-left: 0;
      width: 100px;
      align-self: center;
    }
  }

  .project-item {
    gap: 10px;
    text-align: center;
  }
}

@media (max-width: 576px) {
  .qr-overlay {
    width: 100%;
    height: 100%;
  }
  .hero-header {
    padding: 20px 10px 0;
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
    padding: 15px;
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

  .qr-container .qr-image {
    width: 70px;
    height: 70px;
  }

  .qr-item .qr-frame .qr-image {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 375px) {
  .hero-title .title-gradient {
    font-size: 1.6rem;
  }

  .section-header .section-title {
    font-size: 1.3rem;
  }

  .glass-card {
    padding: 12px;
  }

  .card-header {
    gap: 8px;
    text-align: center;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .interactive-item:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: none;
    -webkit-transform: none;
  }

  .glass-card:hover {
    transform: none;
    -webkit-transform: none;
  }

  .qr-container .qr-image:hover {
    transform: none;
    -webkit-transform: none;
  }

  .project-item:hover {
    transform: none;
    -webkit-transform: none;
  }
}

/* 高分辨率屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .hero-title .title-gradient {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* 打印样式 */
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
