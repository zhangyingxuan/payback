<template>
  <div class="portfolio-container">
    <!-- 紧凑型头部 -->
    <div class="compact-header">
      <h1 class="main-title">前端作品集</h1>
      <p class="subtitle">个人开发项目与工作经验展示</p>
    </div>

    <!-- 紧凑型内容区域 -->
    <div class="compact-content">
      <!-- 个人作品区域 -->
      <div class="compact-section">
        <div class="section-header">
          <el-icon class="section-icon"><User /></el-icon>
          <h2>个人作品</h2>
        </div>

        <div class="compact-grid">
          <!-- Chrome扩展插件 -->
          <div class="compact-card">
            <div class="card-header">
              <el-icon class="card-icon"><ChromeFilled /></el-icon>
              <span class="card-title">Chrome扩展</span>
            </div>
            <div class="card-items">
              <div
                class="item"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/obgljjfbbjnigkpnmjbbdeoekemaieio',
                  )
                "
              >
                <span class="item-name">侧边栏Tab管理器</span>
                <el-icon><Link /></el-icon>
              </div>
              <div
                class="item"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/papfhjbfjcemehhoonkagdndlikahakl',
                  )
                "
              >
                <span class="item-name">跨域同步Cookies</span>
                <el-icon><Link /></el-icon>
              </div>
              <div
                class="item"
                @click="
                  openLink(
                    'https://chromewebstore.google.com/detail/pcgmfkjckpfjhicmbajcjnkfkeconohc',
                  )
                "
              >
                <span class="item-name">网络请求拦截器</span>
                <el-icon><Link /></el-icon>
              </div>
            </div>
          </div>

          <!-- 个人网站 -->
          <div class="compact-card">
            <div class="card-header">
              <el-icon class="card-icon"><Document /></el-icon>
              <span class="card-title">个人网站</span>
            </div>
            <div class="card-items">
              <div
                class="item"
                @click="openLink('https://zhangyingxuan.github.io/')"
              >
                <span class="item-name">个人博客</span>
                <el-icon><Link /></el-icon>
              </div>
              <div class="item" @click="openLink('https://blowsysun.top')">
                <span class="item-name">A股复盘工具</span>
                <el-icon><Link /></el-icon>
              </div>
            </div>
          </div>

          <!-- 小程序 -->
          <div class="compact-card qr-card">
            <div class="card-header">
              <el-icon class="card-icon"><Cellphone /></el-icon>
              <span class="card-title">小程序</span>
            </div>
            <div class="qr-section">
              <div class="qr-item">
                <img
                  src="/src/assets/img/health-tools.jpg"
                  alt="健康小工具"
                  class="qr-image"
                />
                <span class="qr-label">健康小工具</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作项目区域 -->
      <div class="compact-section">
        <div class="section-header">
          <el-icon class="section-icon"><Briefcase /></el-icon>
          <h2>工作项目</h2>
        </div>

        <div class="compact-grid">
          <!-- 小程序 -->
          <div class="compact-card qr-card">
            <div class="card-header">
              <el-icon class="card-icon"><Cellphone /></el-icon>
              <span class="card-title">小程序</span>
            </div>
            <div class="qr-section">
              <div class="qr-item placeholder">
                <img
                  src="/src/assets/img/wpe2c.png"
                  alt="健康小工具"
                  class="qr-image"
                />
                <span class="qr-label">腾讯云发票管家</span>
              </div>
              <div class="qr-item placeholder">
                <img
                  src="/src/assets/img/wpe2b.png"
                  alt="健康小工具"
                  class="qr-image"
                />
                <span class="qr-label">腾讯云发票助手</span>
              </div>
              <div class="qr-item placeholder">
                <img
                  src="/src/assets/img/halfTest.jpg"
                  alt="健康小工具"
                  class="qr-image"
                />
                <span class="qr-label">半屏测试</span>
              </div>
            </div>
          </div>

          <!-- Web项目 -->
          <div class="compact-card">
            <div class="card-header">
              <el-icon class="card-icon"><Monitor /></el-icon>
              <span class="card-title">Web项目</span>
            </div>
            <div class="card-items">
              <div class="item">
                <span class="item-name">腾讯云购买页</span>
                <el-tag size="small" type="primary">腾讯云</el-tag>
              </div>
              <div class="item">
                <span class="item-name">线上订购页面</span>
                <el-tag size="small" type="success">电商项目</el-tag>
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
  TrendCharts,
  Cellphone,
  Monitor,
  Link,
} from '@element-plus/icons-vue';

const openLink = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style scoped lang="less">
.portfolio-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  box-sizing: border-box;
}

.compact-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;

  .main-title {
    font-size: 2.2rem;
    color: #2c3e50;
    margin-bottom: 8px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 1rem;
    color: #6c757d;
    font-weight: 400;
  }
}

.compact-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.compact-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f3f4;

  h2 {
    font-size: 1.4rem;
    color: #2c3e50;
    margin: 0;
    font-weight: 600;
  }

  .section-icon {
    color: #667eea;
    font-size: 1.6rem;
  }
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.compact-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  &.qr-card {
    .qr-section {
      display: flex;
      gap: 15px;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .card-icon {
    color: #667eea;
    font-size: 1.2rem;
  }

  .card-title {
    font-size: 1.1rem;
    color: #2c3e50;
    font-weight: 600;
  }
}

.card-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #667eea;
    color: white;

    .item-name {
      color: white;
    }

    .el-icon {
      color: white;
    }
  }

  .item-name {
    font-size: 0.9rem;
    color: #495057;
    font-weight: 500;
  }

  .el-icon {
    color: #6c757d;
    font-size: 0.9rem;
  }
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &.placeholder {
    .el-icon {
      font-size: 3rem;
      color: #adb5bd;
    }
  }

  .qr-image {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    border: 2px solid #dee2e6;
    object-fit: cover;
  }

  .qr-label {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 500;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .portfolio-container {
    padding: 15px;
  }

  .compact-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .compact-section {
    padding: 15px;
  }

  .main-title {
    font-size: 1.8rem;
  }

  .qr-section {
    flex-direction: column;
  }

  .qr-item {
    .qr-image {
      width: 70px;
      height: 70px;
    }
  }
}

@media (max-width: 480px) {
  .portfolio-container {
    padding: 10px;
  }

  .compact-section {
    padding: 12px;
  }

  .main-title {
    font-size: 1.6rem;
  }

  .section-header h2 {
    font-size: 1.2rem;
  }
}
</style>
