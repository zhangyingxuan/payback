<template>
  <div class="portfolio-container">
    <!-- 惊艳头部设计 -->
    <div class="hero-header">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-gradient">前端作品集</span>
          <div class="title-sparkle">✨</div>
        </h1>
        <div class="floating-elements">
          <div class="floating-element element-1">⚡</div>
          <div class="floating-element element-2">🎨</div>
          <div class="floating-element element-3">💻</div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 个人作品区域 -->
      <div class="section-wrapper personal-section">
        <div class="section-header animated-header">
          <div class="header-icon">
            <el-icon class="section-icon"><User /></el-icon>
          </div>
          <h2 class="section-title">个人作品</h2>
          <div class="header-decoration"></div>
        </div>

        <div class="cards-grid">
          <!-- Chrome扩展插件 -->
          <div class="glass-card card-chrome">
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
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/obgljjfbbjnigkpnmjbbdeoekemaieio',
                  )
                "
              >
                <div class="item-content">
                  <span class="item-name">侧边栏Tab管理器</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
              <div
                class="interactive-item"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/papfhjbfjcemehhoonkagdndlikahakl',
                  )
                "
              >
                <div class="item-content">
                  <span class="item-name">跨域同步Cookies</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
              <div
                class="interactive-item"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/pcgmfkjckpfjhicmbajcjnkfkeconohc',
                  )
                "
              >
                <div class="item-content">
                  <span class="item-name">网络请求拦截器</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
            </div>
          </div>

          <!-- 个人网站 -->
          <div class="glass-card card-website">
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
                @click="openLink('https://zhangyingxuan.github.io/')"
              >
                <div class="item-content">
                  <span class="item-name">个人博客</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
              <div
                class="interactive-item"
                @click="openLink('https://blowsysun.top')"
              >
                <div class="item-content">
                  <span class="item-name">A股复盘工具</span>
                  <el-icon class="link-icon"><Link /></el-icon>
                </div>
                <div class="item-hover-effect"></div>
              </div>
            </div>
          </div>

          <!-- 小程序 -->
          <div class="glass-card card-miniprogram qr-card">
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><Cellphone /></el-icon>
              </div>
              <span class="card-title">小程序</span>
            </div>
            <div class="qr-display">
              <div class="qr-container">
                <img
                  src="/src/assets/img/health-tools.jpg"
                  alt="健康小工具"
                  class="qr-image animated-qr"
                />
                <div class="qr-overlay">
                  <span class="qr-label">扫码体验</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作项目区域 -->
      <div class="section-wrapper work-section">
        <div class="section-header animated-header">
          <div class="header-icon">
            <el-icon class="section-icon"><Briefcase /></el-icon>
          </div>
          <h2 class="section-title">工作项目</h2>
          <div class="header-decoration"></div>
        </div>

        <div class="cards-grid">
          <!-- 小程序 -->
          <div class="glass-card card-work-miniprogram qr-card">
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
                  <img
                    src="/src/assets/img/wpe2c.png"
                    alt="腾讯云发票管家"
                    class="qr-image"
                  />
                  <div class="qr-badge">企业级</div>
                </div>
                <span class="qr-label">腾讯云发票管家</span>
              </div>
              <div class="qr-item">
                <div class="qr-frame">
                  <img
                    src="/src/assets/img/wpe2b.png"
                    alt="腾讯云发票助手"
                    class="qr-image"
                  />
                  <div class="qr-badge">工具类</div>
                </div>
                <span class="qr-label">腾讯云发票助手</span>
              </div>
              <div class="qr-item">
                <div class="qr-frame">
                  <img
                    src="/src/assets/img/halfTest.jpg"
                    alt="半屏测试"
                    class="qr-image"
                  />
                  <div class="qr-badge">测试版</div>
                </div>
                <span class="qr-label">半屏测试</span>
              </div>
            </div>
          </div>

          <!-- Web项目 -->
          <div class="glass-card card-web">
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><Monitor /></el-icon>
              </div>
              <span class="card-title">Web项目</span>
            </div>
            <div class="project-showcase">
              <div class="project-item">
                <div class="project-info">
                  <span class="project-name">腾讯云购买页</span>
                  <el-tag class="project-tag" type="primary" effect="dark"
                    >腾讯云</el-tag
                  >
                </div>
                <div class="project-stats">
                  <div class="stat">
                    <span class="stat-value">99.9%</span>
                    <span class="stat-label">可用性</span>
                  </div>
                </div>
              </div>
              <div class="project-item">
                <div class="project-info">
                  <span class="project-name">线上订购页面</span>
                  <el-tag class="project-tag" type="success" effect="dark"
                    >电商项目</el-tag
                  >
                </div>
                <div class="project-stats">
                  <div class="stat">
                    <span class="stat-value">10K+</span>
                    <span class="stat-label">日访问</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import { onMounted } from 'vue';

const openLink = (url: string) => {
  window.open(url, '_blank');
};

// 添加页面加载动画
onMounted(() => {
  // 添加滚动动画效果
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // 观察所有卡片元素
  document.querySelectorAll('.glass-card').forEach(card => {
    observer.observe(card);
  });
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

.portfolio-container {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #2563eb 25%,
    #3b82f6 50%,
    #60a5fa 75%,
    #93c5fd 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow-x: hidden;
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

.hero-header {
  position: relative;
  padding: 40px 20px 30px;
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
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
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }

  .title-sparkle {
    font-size: 1.6rem;
    animation: pulse 2s ease-in-out infinite;
  }
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 300;
  margin-bottom: 20px;
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

    &.element-1 {
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    &.element-2 {
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    &.element-3 {
      bottom: 30%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

.content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 15px 20px;
}

.section-wrapper {
  margin-bottom: 25px;
  animation: slideInUp 0.6s ease-out;

  &.personal-section {
    animation-delay: 0.1s;
  }

  &.work-section {
    animation-delay: 0.2s;
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
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.08);

    .card-glow {
      opacity: 1;
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
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: all 0.6s ease;
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
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(3px);

    .item-hover-effect {
      transform: translateX(0);
    }

    .link-icon {
      transform: translateX(2px);
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
    transform: translateX(-100%);
    transition: transform 0.3s ease;
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

.qr-container {
  position: relative;

  .qr-image {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    object-fit: cover;
    transition: all 0.2s ease;

    &.animated-qr {
      animation: glow 3s ease-in-out infinite;
    }

    &:hover {
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
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    opacity: 0;
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

      &:hover {
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

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateX(3px);
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
}

@media (max-width: 768px) {
  .hero-title .title-gradient {
    font-size: 2.5rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .glass-card {
    padding: 20px;
  }

  .qr-display,
  .qr-gallery {
    flex-direction: column;
  }

  .project-item {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-header {
    padding: 60px 15px 40px;
  }

  .hero-title .title-gradient {
    font-size: 2rem;
  }

  .content-wrapper {
    padding: 0 15px 30px;
  }

  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;

    .header-decoration {
      margin-left: 0;
      width: 100px;
      align-self: center;
    }
  }
}
</style>
