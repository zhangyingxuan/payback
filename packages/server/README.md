# Pay-Back Server - 后端 API 服务

<a href="https://nestjs.com/">
    <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</a>

<a href="https://github.com/nestjs/nest">
    <img src="https://img.shields.io/badge/nestjs-9.0.0-red.svg" alt="nestjs">
</a>
<a href="https://github.com/mysql/mysql-server">
    <img src="https://img.shields.io/badge/mysql-8.0-blue.svg" alt="mysql">
</a>
<a href="https://github.com/typeorm/typeorm">
    <img src="https://img.shields.io/badge/typeorm-0.3.15-orange.svg" alt="typeorm">
</a>
<a href="https://github.com/microsoft/TypeScript">
    <img src="https://img.shields.io/badge/typescript-4.7.4-blue.svg" alt="typescript">
</a>
<a href="https://github.com/consul/consul">
    <img src="https://img.shields.io/badge/consul-1.0.1-green.svg" alt="consul">
</a>

## 📋 项目概述

Pay-Back Server 是基于 NestJS + TypeScript + MySQL 的后端 API 服务，为 Pay-Back 项目提供完整的后端支持。项目采用微服务架构，支持服务发现、定时任务、数据采集和实时推送等功能。

## 🏗️ 技术架构

### 核心技术栈

- **后端框架**: NestJS 9.0.0
- **数据库**: MySQL 8.0 + TypeORM 0.3.15
- **认证授权**: JWT + Passport
- **微服务**: @nestjs/microservices + Consul
- **定时任务**: @nestjs/schedule + Cron
- **数据采集**: Playwright + Node-fetch
- **API 文档**: Swagger
- **配置管理**: @nestjs/config

### 架构特性

- **模块化设计**: 基于 NestJS 模块化架构，功能解耦清晰
- **微服务架构**: 支持服务注册发现，实现高可用部署
- **数据采集**: 集成 Playwright 进行网页数据自动化采集
- **定时调度**: 支持复杂定时任务和业务逻辑调度
- **安全防护**: JWT 认证、接口限流、异常处理
- **监控运维**: 健康检查、性能监控、日志管理

## 📊 业务架构

### 核心业务模块

#### 1. 股票数据模块 (Pay-Back Module)

- **市场数据**: 实时股票行情、涨跌幅数据
- **概念板块**: 概念股票分组和关联分析
- **热点资讯**: 股票新闻和市场动态采集
- **复盘分析**: 交易数据统计和技术指标
- **短线策略**: 短线股票筛选和跟踪逻辑

#### 2. 用户管理模块 (Users Module)

- **用户认证**: JWT 令牌认证和权限管理
- **用户信息**: 用户资料管理和权限配置
- **会话管理**: Session 管理和状态维护

#### 3. 文章管理模块 (Article Module)

- **内容管理**: 投资文章发布和编辑
- **文档存储**: Markdown 文档存储和管理
- **知识库**: 投资策略和经验分享

#### 4. 系统管理模块 (System Module)

- **配置管理**: 系统参数配置和动态调整
- **监控告警**: 系统状态监控和异常告警
- **日志管理**: 操作日志和系统日志记录

### 微服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   API Gateway   │    │   Push Server   │
│   (Vue 3)       │◄──►│   (NestJS)      │◄──►│   (NestJS)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Service  │    │   Auth Service   │    │   Task Service  │
│   (Pay-Back)    │◄──►│   (JWT Auth)     │◄──►│   (Scheduler)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐
│   MySQL DB      │
│   (Data Store)  │
└─────────────────┘
```

### 数据模型设计

#### 核心数据表结构

- **market_data**: 市场行情数据表
- **plate_data**: 板块概念数据表
- **hot_list**: 热点股票列表
- **review_data**: 复盘分析数据
- **user_info**: 用户信息表
- **article_content**: 文章内容表

## 🚀 部署架构

### 开发环境部署

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run start:dev

# 访问地址: http://localhost:3000/blowsysun
```

### 生产环境构建

```bash
# 构建生产版本
pnpm run build

# 启动生产服务
pnpm run start:prod
```

### Docker 部署

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN pnpm install --production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
```

### 微服务部署配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  consul:
    image: consul:latest
    ports:
      - '8500:8500'

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: payback

  payback-server:
    build: .
    ports:
      - '3000:3000'
    depends_on:
      - mysql
      - consul
    environment:
      NODE_ENV: production
```

### 环境配置管理

项目支持多环境配置：

- `.env.dev` - 开发环境配置
- `.env.prod` - 生产环境配置

关键配置项：

- 数据库连接配置
- Consul 服务发现配置
- JWT 密钥配置
- 第三方 API 配置

## 🔧 开发指南

### 项目结构规范

```
src/
├── app.module.ts          # 应用根模块
├── main.ts               # 应用入口文件
├── auth/                 # 认证授权模块
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── pay-back/             # 核心业务模块
│   ├── entities/         # 数据实体
│   ├── dto/              # 数据传输对象
│   ├── service/          # 业务服务层
│   ├── utils/            # 工具函数
│   └── pay-back.module.ts
├── users/                # 用户管理模块
├── article/              # 文章管理模块
├── consul/               # 微服务配置模块
├── scheduler-task/       # 定时任务模块
└── utils/                # 通用工具库
```

### API 接口规范

#### RESTful API 设计

- **GET** /blowsysun/api/resources - 获取资源列表
- **POST** /blowsysun/api/resources - 创建资源
- **PUT** /blowsysun/api/resources/:id - 更新资源
- **DELETE** /blowsysun/api/resources/:id - 删除资源

#### 数据格式规范

```typescript
// 成功响应
{
  "code": 200,
  "data": {},
  "message": "success"
}

// 错误响应
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 代码规范

- **命名规范**: 使用驼峰命名法，类使用 PascalCase
- **模块设计**: 单一职责原则，功能模块化
- **类型安全**: 全面使用 TypeScript，严格类型检查
- **错误处理**: 统一异常处理和日志记录

## 📈 监控与运维

### 健康检查

- **服务状态**: Consul 服务注册和健康检查
- **数据库连接**: MySQL 连接状态监控
- **API 可用性**: 接口响应时间和成功率

### 性能监控

- **请求统计**: API 调用次数和响应时间
- **资源使用**: 内存、CPU 使用率监控
- **错误监控**: 异常日志和错误统计

### 日志管理

- **访问日志**: HTTP 请求日志记录
- **业务日志**: 关键业务操作日志
- **错误日志**: 系统异常和错误信息

## 🔐 安全考虑

### 认证授权

- **JWT 令牌**: 基于 Token 的无状态认证
- **权限控制**: 接口级别权限验证
- **会话管理**: Session 安全配置

### 接口安全

- **限流防护**: 接口访问频率限制
- **参数验证**: 输入参数校验和过滤
- **SQL 注入防护**: ORM 参数化查询

### 数据传输

- **HTTPS 加密**: 数据传输加密
- **敏感信息**: 密码和密钥加密存储
- **数据脱敏**: 敏感数据返回处理

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

**无限未来 (Infinite Future) | 数字前沿 (Digital Frontier) | 云端智造 (Cloud Smart Manufacturing)**
