# Pay-Back Client - 前端应用

<a href="https://github.com/vuejs/vue">
    <img src="https://img.shields.io/badge/vue-3.2.37-brightgreen.svg" alt="vue">
</a>
<a href="https://github.com/vuejs/pinia">
    <img src="https://img.shields.io/badge/pinia-2.0.20-brightgreen.svg" alt="pinia">
</a>
<a href="https://github.com/element-plus/element-plus">
    <img src="https://img.shields.io/badge/element--plus-2.2.14-blue.svg" alt="element-plus">
</a>
<a href="https://github.com/vitejs/vite">
    <img src="https://img.shields.io/badge/vite-3.0.0-orange.svg" alt="vite">
</a>
<a href="https://github.com/microsoft/TypeScript">
    <img src="https://img.shields.io/badge/typescript-4.6.4-blue.svg" alt="typescript">
</a>

## 📋 项目概述

Pay-Back Client 是基于 Vue 3 + TypeScript + Element Plus 的前端管理系统，为 Pay-Back 项目提供用户界面和交互功能。项目采用现代化的前端技术栈，支持模块化开发、类型安全和高效构建。

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**: Vue 3.2.37 + Composition API
- **构建工具**: Vite 3.0.0
- **UI 组件库**: Element Plus 2.2.14
- **状态管理**: Pinia 2.0.20
- **路由管理**: Vue Router 4.1.3
- **类型系统**: TypeScript 4.6.4
- **HTTP 客户端**: Axios 1.3.6
- **图表库**: ECharts 5.5.0
- **Markdown 编辑器**: v-md-editor 2.3.16

### 开发工具链

- **代码检查**: ESLint 8.30.0
- **代码格式化**: Prettier 2.8.1
- **类型检查**: Vue-TSC 0.38.4
- **Git Hooks**: Husky 8.0.2 + lint-staged 13.1.0
- **自动导入**: unplugin-auto-import 0.11.5
- **组件自动导入**: unplugin-vue-components 0.22.12

### 样式与主题

- **CSS 预处理器**: Less 4.1.3
- **主题系统**: 支持明暗主题切换
- **响应式设计**: 适配桌面端和移动端
- **图标系统**: Element Plus Icons + 自定义图标

## 📊 业务架构

### 核心业务模块

#### 1. 股票分析模块

- **复盘分析**: 股票走势图表、技术指标分析
- **短线策略**: 短线股票筛选和跟踪
- **概念板块**: 最新概念股票分组展示
- **热点资讯**: 实时股票新闻和市场动态

#### 2. 内容管理模块

- **文章管理**: Markdown 编辑器、文章发布和编辑
- **文档管理**: 投资策略文档存储和查阅
- **知识库**: 投资经验和技巧分享

#### 3. 系统管理模块

- **用户管理**: 用户权限和角色管理
- **系统配置**: 应用参数和功能配置
- **权限控制**: 基于角色的访问控制(RBAC)

#### 4. 工具模块

- **表单组件**: 通用表单设计和验证
- **图表组件**: 数据可视化展示
- **上传组件**: 文件上传和图片裁剪
- **标签管理**: 动态标签页管理

### 页面结构

```
src/
├── views/           # 页面组件
│   ├── charts/      # 复盘分析页面
│   ├── shortTerm/   # 短线策略页面
│   ├── article/     # 文章管理页面
│   ├── news/        # 资讯页面
│   ├── systemConfig/# 系统配置页面
│   ├── works/       # 作品集展示页面
│   └── ...
├── components/      # 通用组件
├── api/            # API接口定义
├── store/          # 状态管理
├── router/         # 路由配置
└── core/           # 核心工具库
```

## 🚀 部署架构

### 开发环境部署

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm start
# 或
pnpm run dev

# 访问地址: http://localhost:3000
```

### 生产环境构建

```bash
# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run serve
```

### Docker 部署

```dockerfile
# 使用多阶段构建
FROM nginx:alpine

# 复制构建产物
COPY dist/ /usr/share/nginx/html/

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 环境配置

项目支持多环境配置，通过环境变量文件管理：

- `.env` - 基础配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 性能优化

- **代码分割**: 基于路由的懒加载
- **资源压缩**: Gzip 压缩和 Brotli 压缩
- **缓存策略**: 静态资源长期缓存
- **CDN 加速**: 静态资源 CDN 分发
- **监控集成**: Aegis Web SDK 异常监控

## 🔧 开发指南

### 项目结构规范

```
client/
├── src/
│   ├── api/         # API接口层
│   ├── assets/      # 静态资源
│   ├── components/  # 通用组件
│   ├── config/      # 配置文件
│   ├── core/        # 核心工具
│   ├── router/      # 路由配置
│   ├── store/       # 状态管理
│   ├── styles/      # 样式文件
│   ├── typings/     # 类型定义
│   ├── utils/       # 工具函数
│   └── views/       # 页面组件
├── public/          # 公共资源
└── package.json     # 项目配置
```

### 代码规范

- **命名规范**: 使用驼峰命名法，组件使用 PascalCase
- **文件组织**: 按功能模块组织，保持单一职责原则
- **类型安全**: 全面使用 TypeScript，避免 any 类型
- **组件设计**: 使用 Composition API，保持组件简洁

### 开发流程

1. **功能开发**: 基于功能分支进行开发
2. **代码审查**: 提交前进行代码检查和格式化
3. **测试验证**: 确保功能正常和类型安全
4. **构建部署**: 通过 CI/CD 流水线自动部署

## 📈 监控与运维

### 前端监控

- **性能监控**: 页面加载性能、资源加载时间
- **错误监控**: JavaScript 错误、API 请求异常
- **用户体验**: 用户行为分析和转化率统计

### 健康检查

- **服务状态**: 定期检查服务可用性
- **资源监控**: 内存使用、CPU 负载监控
- **日志收集**: 前端错误日志收集和分析

## 🔐 安全考虑

- **XSS 防护**: 输入输出转义和内容安全策略
- **CSRF 防护**: Token 验证和请求头校验
- **权限控制**: 前端路由守卫和按钮级权限
- **数据加密**: 敏感信息加密传输和存储

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📞 联系方式

- 项目维护者: yxuanzhang@tencent.com
- 项目仓库: [Gitee](https://gitee.com/chongqing-woteng/pay-back.git)

---

**无限未来 (Infinite Future) | 数字前沿 (Digital Frontier) | 云端智造 (Cloud Smart Manufacturing)**dayjs 苹果兼容问题，需完整年月日 格式字符串，才能进行星期几计算 2.
